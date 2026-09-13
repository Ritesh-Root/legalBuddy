/** Dispatch API requests through shared validation, rate limiting, and inference. */
import { AppError, errorResponse } from './errors.js';
import { createGeminiGenerator, generateAnalysis, type GenerateText } from './provider.js';
import { createRateLimiter } from './rate-limit.js';
import { parseRequest, validateTransport } from './request.js';

/** Dependency injection enables real HTTP-contract tests without external credentials. */
export interface HandlerOptions {
  generate?: GenerateText;
  origin?: string;
  rateLimit?: (identity: string) => void;
}

/** Return one Fetch-compatible handler for both Vercel and local development. */
export function createHandler(options: HandlerOptions): (request: Request) => Promise<Response> {
  const rateLimit = options.rateLimit ?? createRateLimiter();
  return async (request) => {
    try {
      const url = new URL(request.url);
      if (
        (url.pathname === '/api/health' || url.pathname === '/healthz') &&
        request.method === 'GET'
      ) {
        return Response.json(
          { status: 'ok', aiConfigured: Boolean(options.generate) },
          { headers: { 'Cache-Control': 'no-store' } },
        );
      }
      if (url.pathname !== '/api/assist')
        throw new AppError(404, 'NOT_FOUND', 'This endpoint does not exist.');
      validateTransport(request, options.origin);
      rateLimit(request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? 'local');
      const input = await parseRequest(request);
      if (!options.generate)
        throw new AppError(
          503,
          'AI_NOT_CONFIGURED',
          'Live AI is not configured yet. You can explore the sample agreement in the meantime.',
        );
      const result = await generateAnalysis(input, options.generate);
      return Response.json({ result }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      const response = errorResponse(error);
      if (response.status === 429) response.headers.set('Retry-After', '60');
      if (response.status === 405) response.headers.set('Allow', 'POST');
      return response;
    }
  };
}

const key = process.env.GEMINI_API_KEY;
/** Production handler reuses its provider client and rate-limit buckets across warm requests. */
export const handleRequest = createHandler({
  ...(key
    ? { generate: createGeminiGenerator(key, process.env.GEMINI_MODEL ?? 'gemini-2.5-flash') }
    : {}),
  ...(process.env.APP_ORIGIN ? { origin: process.env.APP_ORIGIN } : {}),
});
