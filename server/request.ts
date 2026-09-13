/** Validate transport, origin, body size, and schema before an inference request. */
import { requestSchema, type AssistanceRequest } from '../src/domain/types.js';
import { AppError } from './errors.js';

const MAX_BODY_BYTES = 340_000;

/** Require JSON and reject cross-origin browser requests before reading their body. */
export function validateTransport(request: Request, origin?: string): void {
  if (request.method !== 'POST')
    throw new AppError(405, 'METHOD_NOT_ALLOWED', 'Use POST for document assistance.');
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') {
    throw new AppError(415, 'JSON_REQUIRED', 'Send the request as application/json.');
  }
  const suppliedOrigin = request.headers.get('origin');
  const allowed = origin ?? new URL(request.url).origin;
  if (
    (suppliedOrigin && suppliedOrigin !== allowed) ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  ) {
    throw new AppError(403, 'ORIGIN_REJECTED', 'Requests must come from this application.');
  }
  const length = Number(request.headers.get('content-length'));
  if (length > MAX_BODY_BYTES)
    throw new AppError(413, 'DOCUMENT_TOO_LARGE', 'The request exceeds the document size limit.');
}

async function readBoundedBody(request: Request): Promise<string> {
  if (!request.body)
    throw new AppError(400, 'INVALID_REQUEST', 'Add a document before starting a review.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let body = '';
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) return body + decoder.decode();
      length += chunk.value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new AppError(
          413,
          'DOCUMENT_TOO_LARGE',
          'The request exceeds the document size limit.',
        );
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

/** Validate actual streamed bytes, not just the optional Content-Length header. */
export async function parseRequest(request: Request): Promise<AssistanceRequest> {
  const body = await readBoundedBody(request);
  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    throw new AppError(400, 'INVALID_JSON', 'The request must contain valid JSON.');
  }
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success)
    throw new AppError(
      400,
      'INVALID_REQUEST',
      parsed.error.issues[0]?.message ?? 'Check the document and reader context.',
    );
  return parsed.data;
}
