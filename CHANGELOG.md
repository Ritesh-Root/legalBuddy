# Changelog

## Security and efficiency update — 2026-09-14

- Reuse identical successful AI requests within a bounded, private in-memory workspace.
- Propagate cancellation to inference, limit concurrent generations, and stop oversized PDF extraction early.
- Encode untrusted Markdown in downloaded briefs while retaining original source evidence.
- Pin CI actions and add checksum-verified, redacted full-history secret scanning.
- Add regression tests for reuse/reset, cancellation/capacity, export safety, and PDF budgets.

## 1.0.0 — 2026-09-13

- Added consent-first text/PDF legal document review with reader context.
- Added verified source quotations, prioritized findings, and obligation extraction.
- Added document comparison, grounded questions, and a local lawyer-brief download.
- Added a clearly labeled fictional walkthrough and responsive keyboard-accessible workspace.
- Added strict types, automated security/API tests, browser journeys, and accessibility checks.
