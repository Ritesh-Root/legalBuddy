<p>
  <img src="public/favicon.svg" width="56" height="56" alt="legalBuddy">
</p>

# legalBuddy

Paste an agreement. legalBuddy explains the wording, shows the sentence it used, and writes a short brief you can take to a lawyer.

It does not look up statutes or tell you a clause is enforceable. Closing the tab clears the workspace.

[Open the live app](https://margin-legal-assistant.vercel.app) · [Repository](https://github.com/Ritesh-Root/legalBuddy)

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
```

## How quotes are checked

Gemini returns JSON. Zod checks the shape. Every quotation is matched against the labeled source after Unicode and whitespace normalization. If a quote is not in the document, the whole response is thrown away.

The model is instructed to treat the document as untrusted data, not as instructions. Findings sit beside the source so you can read the sentence yourself.

## Stack

React, TypeScript, Vite, Zod, Gemini (`@google/genai`), Vercel, Vitest, Playwright, axe.

This was built for PromptWars, track **AI for Legal Assistance & Access**. It is information and preparation, not legal advice.

MIT. Ritesh.
