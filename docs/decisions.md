# Architecture decisions

## One small workspace

The brief calls for practical legal assistance. legalBuddy follows one document through review, comparison, questions, and a lawyer briefing. A single React workspace avoids a generic chatbot landing page and keeps the source available. Each panel is a separate feature module.

## Static client and Fetch-compatible API

Vite serves a cacheable static client. Vercel runs the same Request/Response handler exercised locally and in integration tests. A small native adapter is sufficient; a database and authentication system would add sensitive retention and are outside this focused scope.

## Verify quotations, preserve uncertainty

Zod validates model output and a second check matches each quotation to the correctly labeled source after Unicode/whitespace normalization. Any unverifiable output is rejected as a whole. This sacrifices some successful-but-imperfect outputs in exchange for fewer fabricated citations. It does not establish that the interpretation follows from the quote.

## Local extraction, explicit consent

Text-based PDFs are parsed lazily on the client. Uploading a file never sends the binary to a third party. Analysis begins only after consent and sends extracted text to Gemini. Scans, encrypted files, large files, and unreadable input receive clear limits rather than silently losing pages. No cross-user cache is used because preserving private document boundaries is more important than reusing responses.

Within one workspace, a bounded in-memory cache reuses identical successful requests for five minutes. Every input field participates in the key, and resetting the workspace invalidates pending cache writes. This removes redundant inference without retaining legal documents in a shared service. Only completed results are cached; sharing in-flight promises would couple independent request cancellation. PDF extraction checks cumulative text length after each page and releases its worker immediately on rejection.

## Curated sample as a distinct mode

The fictional sample and its answers are bundled and clearly labeled. Arbitrary questions or user documents never receive sample output. The sample cannot silently substitute for a failed provider request. Live failures retain the user's input and show retryable errors.

## Bounded scope and deployment

Vercel is the requested host. GCP infrastructure, document storage, background jobs, and model-generated filings are deliberately omitted. Rate limiting is per warm instance and is disclosed as such. The project uses one public branch and keeps generated assets and dependencies out of git.
