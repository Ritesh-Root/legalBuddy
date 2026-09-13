/** Keep operational errors useful to readers without leaking provider details. */
/** An expected public error with a stable status and machine-readable code. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** All API failures share this sanitized JSON boundary. */
export function errorResponse(error: unknown): Response {
  const known = error instanceof AppError;
  return Response.json(
    {
      error: {
        code: known ? error.code : 'INTERNAL_ERROR',
        message: known ? error.message : 'The review could not be completed. Please try again.',
      },
    },
    { status: known ? error.status : 500, headers: { 'Cache-Control': 'no-store' } },
  );
}
