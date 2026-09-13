/** HTTP-contract integration covers validation order, errors, quotas, and a full journey. */
import { describe, expect, it, vi } from 'vitest';
import { createHandler, handleRequest } from '../../server/handler';
import { AppError, errorResponse } from '../../server/errors';
import {
  SAMPLE_ANALYSIS,
  SAMPLE_COMPARISON,
  SAMPLE_CONTEXT,
  SAMPLE_DOCUMENT,
  SAMPLE_REVISED,
} from '../../src/domain/sample';
import { createBrief } from '../../src/domain/brief';
import type { AssistanceRequest } from '../../src/domain/types';

const input: AssistanceRequest = {
  action: 'review',
  document: SAMPLE_DOCUMENT,
  revised: '',
  question: '',
  context: SAMPLE_CONTEXT,
  consent: true,
};
function post(body: unknown = input, headers: Record<string, string> = {}): Request {
  return new Request('https://margin.example/api/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://margin.example', ...headers },
    body: JSON.stringify(body),
  });
}
function configured() {
  return createHandler({ generate: () => Promise.resolve(JSON.stringify(SAMPLE_ANALYSIS)) });
}

describe('assistance API', () => {
  it('reports readiness without exposing credentials and exposes the deployed handler', async () => {
    const healthy = await createHandler({})(new Request('https://margin.example/healthz'));
    expect(await healthy.json()).toEqual({ status: 'ok', aiConfigured: false });
    expect((await handleRequest(new Request('https://margin.example/api/health'))).status).toBe(
      200,
    );
  });
  it('runs health, review, comparison, question and export through shared contracts', async () => {
    const handler = createHandler({
      generate: (request) =>
        Promise.resolve(
          JSON.stringify(
            request.action === 'compare'
              ? SAMPLE_COMPARISON
              : request.action === 'ask'
                ? {
                    ...SAMPLE_ANALYSIS,
                    answer:
                      'The balance is payable within 60 days of final delivery, subject to client satisfaction.',
                  }
                : SAMPLE_ANALYSIS,
          ),
        ),
    });
    expect((await handler(new Request('https://margin.example/api/health'))).status).toBe(200);
    for (const request of [
      input,
      { ...input, action: 'compare', revised: SAMPLE_REVISED },
      { ...input, action: 'ask', question: 'When do I get paid?' },
    ]) {
      const response = await handler(post(request));
      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(response.headers.get('content-type')).toContain('application/json');
    }
    expect(createBrief(SAMPLE_ANALYSIS, input.context, false)).toContain('Source (original)');
  });
  it('rejects unknown endpoints and unsupported methods with static errors', async () => {
    const handler = configured();
    const missing = await handler(new Request('https://margin.example/api/secret-path'));
    expect(missing.status).toBe(404);
    expect(await missing.text()).not.toContain('secret-path');
    const method = await handler(new Request('https://margin.example/api/assist'));
    expect(method.status).toBe(405);
    expect(method.headers.get('allow')).toBe('POST');
  });
  it('rejects foreign origins, cross-site fetches, and non-JSON content before generation', async () => {
    const generate = vi.fn(() => Promise.resolve(JSON.stringify(SAMPLE_ANALYSIS)));
    const handler = createHandler({ generate });
    for (const [headers, status] of [
      [{ Origin: 'https://attacker.example' }, 403],
      [{ 'sec-fetch-site': 'cross-site' }, 403],
      [{ 'Content-Type': 'text/plain' }, 415],
    ] as const)
      expect((await handler(post(input, headers))).status).toBe(status);
    expect(generate).not.toHaveBeenCalled();
    expect(
      (
        await createHandler({ origin: 'https://custom.example', generate })(
          post(input, { Origin: 'https://custom.example' }),
        )
      ).status,
    ).toBe(200);
  });
  it('accepts explicit JSON charset and bounded non-browser requests', async () => {
    const request = post(input, { 'Content-Type': 'application/json; charset=utf-8' });
    request.headers.delete('origin');
    expect((await configured()(request)).status).toBe(200);
  });
  it('rejects malformed JSON, absent consent, a missing body, and oversized actual bytes', async () => {
    const handler = configured();
    const malformed = new Request('https://margin.example/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    expect((await handler(malformed)).status).toBe(400);
    expect((await handler(post({ ...input, consent: false }))).status).toBe(400);
    expect(
      (
        await handler(
          new Request('https://margin.example/api/assist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      ).status,
    ).toBe(400);
    expect((await handler(post({ ...input, document: '界'.repeat(120_000) }))).status).toBe(413);
    expect((await handler(post(input, { 'Content-Length': '400000' }))).status).toBe(413);
  });
  it('fails honestly without a provider and sanitizes unexpected internal errors', async () => {
    expect((await createHandler({})(post())).status).toBe(503);
    const broken = createHandler({
      rateLimit: () => {
        throw new Error('private operational detail');
      },
    });
    const response = await broken(post());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private operational detail');
    expect(errorResponse(new AppError(400, 'TEST_ERROR', 'Safe message')).status).toBe(400);
  });
  it('returns Retry-After when the per-client quota is exhausted', async () => {
    const handler = configured();
    for (let index = 0; index < 6; index += 1)
      await handler(post(input, { 'x-vercel-forwarded-for': '192.0.2.1, 127.0.0.1' }));
    const response = await handler(post(input, { 'x-vercel-forwarded-for': '192.0.2.1' }));
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('60');
  });
});
