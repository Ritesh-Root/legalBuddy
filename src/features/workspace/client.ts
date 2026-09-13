/** Validate responses and surface useful failures without trusting remote JSON. */
import { z } from 'zod';
import { analysisSchema, type Analysis, type AssistanceRequest } from '../../domain/types';

const resultSchema = z.object({ result: analysisSchema }).strict();
const failureSchema = z.object({ error: z.object({ message: z.string() }) });

/** The server handles provider credentials; the client only sends consented document text. */
export async function requestAssistance(
  input: AssistanceRequest,
  signal: AbortSignal,
): Promise<Analysis> {
  const response = await fetch('/api/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.any([signal, AbortSignal.timeout(55_000)]),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const parsed = failureSchema.safeParse(body);
    throw new Error(
      parsed.success ? parsed.data.error.message : 'The request failed. Please try again.',
    );
  }
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) throw new Error('The response could not be read. Please try again.');
  return parsed.data.result;
}
