<p>
  <img src="public/favicon.svg" width="56" height="56" alt="legalBuddy">
</p>

# legalBuddy

Paste an agreement. legalBuddy explains the wording, shows the sentence it used, and writes a short brief you can take to a lawyer.

It does not look up statutes or tell you a clause is enforceable. Closing the tab clears the workspace.

[Open the live app](https://legalbuddy-app.vercel.app) · [Repository](https://github.com/Ritesh-Root/legalBuddy) · [20-second walkthrough](brag-output/brag.mp4)

Contest form fields and the 85-second judge video path live in [docs/submission.md](docs/submission.md).

## Try the sample

The fictional freelancer agreement needs no API key.

1. Click **Explore the sample**.
2. Open the ownership finding and jump to the quote in the document.
3. Compare versions. The revision shortens the payment window from 60 days to 15 and changes when ownership transfers.
4. Ask **Can I show this in my portfolio?**
5. Download the lawyer brief. It includes the review, the comparison, and that question.

For a live Gemini run, start a new document, paste or upload readable text, set your role and language, tick consent, then **Make it clear**. If no server key is configured, the app says so. It never substitutes the sample for a failed live call.

## What you can do

Review a contract in plain language, in English or Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, or Punjabi. Quotations stay in the document's original wording so you can check them.

Compare an original and a revised draft. Each point is tied to one labeled source.

Ask a question about the text you supplied. If the document does not say, the answer says that.

Export a Markdown brief on your device. No extra model call.

PDFs and text files are read in the browser. Only extracted text is sent to Gemini, and only after consent. There is no account and no document database. The workspace lives in memory for this visit.

## Limits

- 2 MB per file, 30 PDF pages, 80 to 40,000 characters per document
- Text-based PDFs only. Scans need OCR somewhere else
- One in-memory workspace. Closing the tab clears it
- Rate limits are per warm server instance, not a shared Redis store

## Run locally

Node.js 24.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Put `GEMINI_API_KEY` in `.env.local` for live analysis. Leave it empty to use the sample. Vite prints the local URL. The API listens on port 3001 behind the Vite proxy.

On Vercel, set `GEMINI_API_KEY` in the project environment. `GEMINI_MODEL` defaults to `gemini-2.5-flash`.

```bash
npm run verify    # lint, types, coverage, production build
npm run test:e2e  # desktop and mobile journeys, including axe
npm run preflight # size, branch, secrets, and README gates
```

## How quotes are checked

Gemini returns JSON. Zod checks the shape. Every quotation is matched against the labeled source after Unicode and whitespace normalization. If a quote is not in the document, the whole response is thrown away.

The model is instructed to treat the document as untrusted data, not as instructions. Findings sit beside the source so you can read the sentence yourself.

## Chosen Vertical

AI for Legal Assistance & Access. legalBuddy is for people who need to read an everyday agreement before they talk to a lawyer: freelancers, tenants, and anyone handed a contract they did not draft.

## Approach and Logic

Validate the paste or upload, attach the reader's role, jurisdiction, concern, and explanation language, ask Gemini for structured JSON, then verify every quotation against the exact source. Unsupported evidence is discarded. The labeled sample is a separate path from live inference and is never used as a fallback.

## How the Solution Works

1. Add a document in the browser (paste, `.txt`, or a text-based PDF).
2. Set who you are, where the deal sits, what worries you, and which language explanations should use.
3. Consent, then review, compare a revision, or ask a question.
4. Open a finding to jump to the quote. Download a Markdown brief on the device.

Gemini runs only on the server. Quotes stay in the source language even when the explanation is in Hindi, Tamil, or another supported language.

## Assumptions Made

- The document is evidence, not a source of trusted instructions.
- The app explains wording. It does not research applicable law or decide whether a clause is enforceable.
- Text-based PDF and UTF-8 text work. Scans need OCR somewhere else.
- Limits: 2 MB, 30 PDF pages, 80 to 40,000 characters per document. Missing information is stated.
- No account or document database. The current workspace lives in browser memory for this visit.
- Contest rules the participant is following: public repository, one branch, tracked files under 10 MB.

## Problem Statement Alignment

| ID  | Requirement                                               | What legalBuddy does                                                                         |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| R1  | Simplifying complex legal documents                       | Plain-language review in English or an Indian language, with a verified quote for each point |
| R2  | Comparing contracts, agreements, or policies              | Original vs revised analysis with explicit source labels                                     |
| R3  | Highlighting clauses, obligations, risks, inconsistencies | Prioritized findings and an obligation checklist                                             |
| R4  | Answering questions based on documents                    | Grounded Q&A; if the text does not say, the answer says so                                   |
| R5  | Helping users understand options and next steps           | Context-aware questions and preparation steps                                                |
| R6  | Generating actionable outputs                             | Downloadable Markdown lawyer brief, including this visit's comparison and Q&A                |
| R7  | Assistance rather than professional legal advice          | Scope notice, no enforceability verdicts, missing information surfaced                       |

## Security

`GEMINI_API_KEY` stays on the server. Input and model JSON are validated. Document text is treated as untrusted data. The app does not log or store document bodies. After consent, extracted text is sent to Gemini. Downloaded briefs encode untrusted Markdown syntax; the UI renders model output as React text. See [SECURITY.md](SECURITY.md) for the threat model, headers, and rate limits. API responses use `Cache-Control: no-store`.

## Testing

`npm run verify` runs lint, types, coverage, the production build, and format checks. `npm run test:e2e` runs desktop and mobile journeys plus axe. `npm run preflight` checks repository size, the single-branch rule, secret signatures, and these README sections. Offline tests mock Gemini. `npm run test:live` is an optional billable check against the deployed sample.

## Accessibility

Skip link, semantic landmarks, labeled controls, visible keyboard focus, source navigation that moves focus into the quote, async status announcements, and a reduced-motion path. Playwright journeys include axe scans on desktop and a narrow viewport.

## Stack

React, TypeScript, Vite, Zod, Gemini (`@google/genai`), Vercel, Vitest, Playwright, axe.

Built for PromptWars, track **AI for Legal Assistance & Access**. Information and preparation, not legal advice.

MIT. Ritesh.
