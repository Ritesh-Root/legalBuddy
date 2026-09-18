/** Opt-in deployed checks use only the public fictional sample, never private documents. */
import assert from 'node:assert/strict';
import { z } from 'zod';
import { analysisSchema, type AssistanceRequest } from '../src/domain/types';
import { hasVerifiedEvidence } from '../src/domain/evidence';
import { SAMPLE_CONTEXT, SAMPLE_DOCUMENT, SAMPLE_REVISED } from '../src/domain/sample';

const base = process.env.E2E_BASE_URL ?? 'https://legalbuddy-app.vercel.app';
const health = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(30_000) });
assert.equal(health.status, 200, 'Deployed health must respond successfully');
assert.deepEqual(await health.json(), { status: 'ok', aiConfigured: true });
process.stdout.write('PASS deployed API readiness and AI configuration\n');

const actions = z
  .array(z.enum(['review', 'compare', 'ask']))
  .parse((process.env.LIVE_ACTIONS ?? 'review,compare,ask').split(','));
for (const action of actions) {
  const input: AssistanceRequest = {
    action,
    document: SAMPLE_DOCUMENT,
    revised: action === 'compare' ? SAMPLE_REVISED : '',
    question:
      action === 'ask' ? 'When does ownership transfer and when is the final payment due?' : '',
    context: SAMPLE_CONTEXT,
    consent: true,
  };
  const start = Date.now();
  const response = await fetch(`${base}/api/assist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(60_000),
  });
  const body: unknown = await response.json();
  assert.equal(
    response.status,
    200,
    `Live ${action} failed after ${Date.now() - start} ms: ${JSON.stringify(body)}`,
  );
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.ok(typeof body === 'object' && body !== null && 'result' in body);
  const result = analysisSchema.parse(body.result);
  assert.ok(hasVerifiedEvidence(result, input), `${action}: source citations must verify`);
  if (action === 'ask') assert.ok(result.answer.length > 0);
  process.stdout.write(
    `PASS live ${action}: ${result.findings.length} verified findings, ${result.obligations.length} obligations, ${Date.now() - start} ms\n`,
  );
}
