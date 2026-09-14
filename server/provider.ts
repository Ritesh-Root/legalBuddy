/** Gemini adapter with bounded generation, timeout, and validated source evidence. */
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { analysisSchema, type Analysis, type AssistanceRequest } from '../src/domain/types.js';
import { hasVerifiedEvidence } from '../src/domain/evidence.js';
import { AppError } from './errors.js';
import { SYSTEM_INSTRUCTION, userPrompt } from './prompt.js';

/** Injectable generation boundary keeps route and failure tests offline. */
export type GenerateText = (request: AssistanceRequest, signal?: AbortSignal) => Promise<string>;

/** Create a reusable SDK client without exposing its credential to the browser. */
export function createGeminiGenerator(apiKey: string, model: string): GenerateText {
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: 40_000, retryOptions: { attempts: 1 } },
  });
  return async (request, signal) => {
    const result = await client.models.generateContent({
      model,
      contents: userPrompt(request),
      config: {
        ...(signal ? { abortSignal: signal } : {}),
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseJsonSchema: z.toJSONSchema(analysisSchema),
        maxOutputTokens: 5_000,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return result.text ?? '';
  };
}

/** Reject hallucinated citations and malformed structured output at one chokepoint. */
export async function generateAnalysis(
  request: AssistanceRequest,
  generate: GenerateText,
  signal?: AbortSignal,
): Promise<Analysis> {
  signal?.throwIfAborted();
  let output: string;
  try {
    output = await generate(request, signal);
  } catch {
    signal?.throwIfAborted();
    throw new AppError(
      502,
      'PROVIDER_UNAVAILABLE',
      'The AI provider is unavailable or timed out. Your document is still here; try again shortly.',
    );
  }
  signal?.throwIfAborted();
  let raw: unknown;
  try {
    raw = JSON.parse(output);
  } catch {
    throw new AppError(
      502,
      'INVALID_RESPONSE',
      'The AI returned an incomplete response. Please retry the review.',
    );
  }
  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success || !hasVerifiedEvidence(parsed.data, request)) {
    throw new AppError(
      502,
      'UNVERIFIED_RESPONSE',
      'We could not verify the AI response against your document. It has not been shown. Please try again.',
    );
  }
  if (request.action === 'ask' && !parsed.data.answer.trim()) {
    throw new AppError(
      502,
      'INVALID_RESPONSE',
      'The AI did not return an answer. Please try your question again.',
    );
  }
  if (request.action === 'review' && parsed.data.findings.length === 0) {
    throw new AppError(
      422,
      'NO_CLAUSES_FOUND',
      'No supported contract clauses were identified. Check that you added readable legal document text.',
    );
  }
  return parsed.data;
}
