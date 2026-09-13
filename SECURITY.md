# Security

Report vulnerabilities using [private GitHub reporting](https://github.com/Ritesh-Root/legalBuddy/security/advisories/new). Do not submit real contracts in public issues. This is a hackathon application; there is no promised response SLA.

## Threat model

- Untrusted document text, questions, context, and provider JSON cross explicit Zod boundaries.
- Embedded document instructions are isolated as data in a fixed system prompt. Prompt isolation reduces risk but cannot guarantee that a model will never follow an injection.
- Every returned finding and obligation must quote its correct source. A matching quote proves textual provenance, not legal correctness, completeness, or entailment.
- Content is rendered as React text. The app never renders Markdown/HTML from a file or model, executes model tools, or follows document URLs.
- A bounded stream reader enforces 340,000 request bytes, even without Content-Length; document text is limited to 40,000 characters per version.
- Consent is required before inference. No documents are persisted in a database, browser storage, analytics, or application logs. Extracted text is sent to Gemini; provider and hosting retention is outside the app's control.

## Credentials and cost control

`GEMINI_API_KEY` is stored only in ignored local environment files and Vercel project environment variables. Never put it in a `VITE_` variable. The deployment token is not part of the repository.

Anonymous inference is limited to 6 requests per minute per network identifier and 60 per minute **per warm function instance**. Identifiers are SHA-256 hashed in memory and expire after one minute. This is not a distributed/global spend cap: cold starts or scaling create new buckets. Configure provider-side quotas and billing limits for a public deployment; a shared durable quota is needed for stronger multi-instance guarantees. The app uses a 40-second provider timeout, one attempt, and a 5,000-token output cap. It does not automatically repeat billable requests.

## HTTP headers

Production headers are defined in `vercel.json`; the Vite development server intentionally supports development tooling and is not a production host.

| Header                    | Policy                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy   | Same-origin scripts, styles, fonts, and connections; no unsafe grants; self/blob PDF workers; no objects or framing |
| X-Content-Type-Options    | nosniff                                                                                                             |
| X-Frame-Options           | DENY                                                                                                                |
| Strict-Transport-Security | One year, includeSubDomains                                                                                         |
| Referrer-Policy           | strict-origin-when-cross-origin                                                                                     |
| Permissions-Policy        | Camera, microphone, geolocation, payment, USB disabled                                                              |
| Cache-Control             | no-store for API responses; hashed static assets cache for one year                                                 |

JSON-only POSTs and same-origin browser checks reject ordinary cross-site forms. Requests without Origin are permitted for API clients and are still rate limited; origin validation is not authentication.

## Supply chain

Exact dependency versions and a lockfile are committed. CI gates production advisories at moderate and the full dependency tree at high severity, checks types, runs functional and accessibility tests, and performs CodeQL analysis. Dependabot does not open PRs during the event because additional branches would break the submission rule. The preflight script scans tracked files for credential patterns and generated artifacts.

ESLint 9 is pinned because the current jsx-a11y release declares support through ESLint 9. Its package emits an upstream end-of-support notice; this does not represent a vulnerability finding. Upgrade the linter and accessibility plugin together when their supported ranges align. The Gemini SDK includes the deprecated `node-domexception` compatibility shim transitively; no application code imports it.

## Limitations

No OCR, authentication, encrypted document vault, legal research, or guarantee of privilege. Do not send confidential, personal, or sensitive documents. See the [processing notice](https://margin-legal-assistant.vercel.app/privacy.html) before a live review.
