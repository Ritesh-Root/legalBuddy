/** Bound concurrent generation and release capacity on failure or cancellation. */
import { describe, expect, it, vi } from 'vitest';
import { createHandler } from '../../server/handler';
import { SAMPLE_ANALYSIS, SAMPLE_CONTEXT, SAMPLE_DOCUMENT } from '../../src/domain/sample';
import type { AssistanceRequest } from '../../src/domain/types';

function post(signal?: AbortSignal): Request {
  return new Request('https://margin.example/api/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'review',
      document: SAMPLE_DOCUMENT,
      revised: '',
      question: '',
      context: SAMPLE_CONTEXT,
      consent: true,
    }),
    ...(signal ? { signal } : {}),
  });
}

describe('inference lifecycle', () => {
  it('rejects pre-aborted requests before generation', async () => {
    const generate = vi.fn(() => Promise.resolve(JSON.stringify(SAMPLE_ANALYSIS)));
    const response = await createHandler({ generate })(post(AbortSignal.abort()));
    expect(response.status).toBe(499);
    expect(generate).not.toHaveBeenCalled();
  });
  it('passes cancellation through to generation and returns a sanitized cancellation', async () => {
    const controller = new AbortController();
    const generate = vi.fn((_input: AssistanceRequest, signal?: AbortSignal) => {
      return new Promise<string>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new Error('private SDK detail')), {
          once: true,
        });
      });
    });
    const handler = createHandler({ generate });
    const pending = handler(post(controller.signal));
    await vi.waitFor(() => expect(generate).toHaveBeenCalledOnce());
    controller.abort();
    const response = await pending;
    expect(response.status).toBe(499);
    expect(await response.text()).not.toContain('private SDK detail');
  });
  it('admits at most three simultaneous calls and releases capacity after failures', async () => {
    let fail: (error: Error) => void = vi.fn();
    const pending = new Promise<string>((_resolve, reject) => {
      fail = reject;
    });
    const generate = vi.fn(() => pending);
    const handler = createHandler({ generate });
    const active = Array.from({ length: 3 }, () => handler(post()));
    await vi.waitFor(() => expect(generate).toHaveBeenCalledTimes(3));
    const rejected = await handler(post());
    expect(rejected.status).toBe(429);
    expect(rejected.headers.get('retry-after')).toBe('60');
    expect(generate).toHaveBeenCalledTimes(3);
    fail(new Error('Provider failed'));
    expect((await Promise.all(active)).every((response) => response.status === 502)).toBe(true);
    generate.mockImplementation(() => Promise.resolve(JSON.stringify(SAMPLE_ANALYSIS)));
    expect((await handler(post())).status).toBe(200);
  });
});
