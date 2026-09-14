/** Workspace reuse saves inference without sharing documents or retaining stale results. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionClient } from '../../src/features/workspace/session-client';
import { SAMPLE_ANALYSIS, SAMPLE_CONTEXT, SAMPLE_DOCUMENT } from '../../src/domain/sample';
import type { AssistanceRequest } from '../../src/domain/types';

const input: AssistanceRequest = {
  action: 'ask',
  document: SAMPLE_DOCUMENT,
  revised: '',
  question: 'When is payment due?',
  context: SAMPLE_CONTEXT,
  consent: true,
};
const signal = () => new AbortController().signal;
afterEach(() => vi.useRealTimers());

describe('workspace inference reuse', () => {
  it('reuses identical success but keeps every document and context field in its key', async () => {
    const send = vi.fn(() => Promise.resolve(SAMPLE_ANALYSIS));
    const client = createSessionClient(send);
    await client.request(input, signal());
    await client.request({ ...input }, signal());
    expect(send).toHaveBeenCalledTimes(1);
    for (const change of [
      { question: 'Who owns the work?' },
      { document: `${input.document} More wording.` },
      { revised: input.document },
      { action: 'compare' as const },
      { context: { ...input.context, role: 'Tenant' as const } },
      { context: { ...input.context, jurisdiction: 'Another jurisdiction' } },
      { context: { ...input.context, concern: 'A different concern' } },
    ])
      await client.request({ ...input, ...change }, signal());
    expect(send).toHaveBeenCalledTimes(8);
  });
  it('expires results after five minutes and bounds the cache to eight entries', async () => {
    vi.useFakeTimers();
    const send = vi.fn(() => Promise.resolve(SAMPLE_ANALYSIS));
    const client = createSessionClient(send);
    await client.request(input, signal());
    vi.advanceTimersByTime(300_000);
    await client.request(input, signal());
    expect(send).toHaveBeenCalledTimes(2);
    for (let index = 0; index < 8; index++)
      await client.request({ ...input, question: `Question ${index}` }, signal());
    await client.request(input, signal());
    expect(send).toHaveBeenCalledTimes(11);
  });
  it('isolates workspaces and clears all reuse on reset', async () => {
    const send = vi.fn(() => Promise.resolve(SAMPLE_ANALYSIS));
    const first = createSessionClient(send);
    await first.request(input, signal());
    await createSessionClient(send).request(input, signal());
    first.clear();
    await first.request(input, signal());
    expect(send).toHaveBeenCalledTimes(3);
  });
  it('does not cache failures or issue a request with an aborted signal', async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValue(SAMPLE_ANALYSIS);
    const client = createSessionClient(send);
    await expect(client.request(input, signal())).rejects.toThrow('Temporary failure');
    await client.request(input, signal());
    await expect(client.request(input, AbortSignal.abort())).rejects.toThrow();
    expect(send).toHaveBeenCalledTimes(2);
  });
  it('does not repopulate a reset workspace when an older request finishes', async () => {
    let complete: (value: typeof SAMPLE_ANALYSIS) => void = vi.fn();
    const pending = new Promise<typeof SAMPLE_ANALYSIS>((resolve) => {
      complete = resolve;
    });
    const send = vi.fn(() => pending);
    const client = createSessionClient(send);
    const result = client.request(input, signal());
    client.clear();
    complete(SAMPLE_ANALYSIS);
    await result;
    await client.request(input, signal());
    expect(send).toHaveBeenCalledTimes(2);
  });
});
