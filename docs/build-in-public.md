# legalBuddy: a quote-checked reading assistant for everyday agreements

PromptWars Virtual, track **AI for Legal Assistance & Access**.

Live app: https://legalbuddy-app.vercel.app  
Source: https://github.com/Ritesh-Root/legalBuddy

## The problem I actually hit

A freelancer agreement, a lease, a vendor PDF. You can paste it into a chatbot and get a confident summary. You cannot tell whether the model still has the sentence in front of it.

legalBuddy is built around that check. It explains the wording in plain language, shows the sentence it used, and writes a short Markdown brief you can take to a lawyer. It does not look up statutes or decide whether a clause is enforceable.

## What you can do in one visit

- Review a document in English or Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Gujarati, or Punjabi. Quotations stay in the document’s original wording.
- Compare an original and a revised draft. Each point is tied to a labeled source.
- Ask a question about the text you supplied. If the document does not say, the answer says that.
- Download a lawyer brief on the device. No extra model call.

There is no account and no document database. Closing the tab clears the workspace.

## How a live answer is allowed to exist

1. The browser reads paste, `.txt`, or a text-based PDF. Only extracted text is sent, and only after consent.
2. Gemini runs on the server (`gemini-2.5-flash` via `@google/genai`). The key never ships to the client.
3. The model must return JSON. Zod checks the shape.
4. Every quotation is matched against the labeled source after Unicode and whitespace normalization. If a quote is not in the document, the whole response is thrown away.

The sample freelancer agreement is a separate, labeled path. It needs no API key. A failed live call never falls back to that sample.

## What I would show a judge first

Click **Explore the sample**. Open **You could hand over ownership before being paid**. The quote is:

> All intellectual property rights in the deliverables transfer to the Client upon creation, regardless of whether payment has been received.

Compare versions, ask **Can I show this in my portfolio?**, then **Download brief**. The file includes the review, the comparison, and that question.

A 20-second walkthrough of that path is in the repository: `brag-output/brag.mp4`.

## Limits I am not hiding

- 2 MB per file, 30 PDF pages, 80 to 40,000 characters
- Text-based PDFs only
- Rate limits are per warm server instance, not a shared store
- Information and preparation, not legal advice
