# Missing features vs PromptWars “AI for Legal Assistance & Access”

**Date:** 2026-09-16  
**Question:** Which required or strongly expected capabilities is legalBuddy missing, and what is the smallest feature to add?

Primary sources were fetched on this date. The official PromptWars Virtual site was a refresh stub, so numbered R1–R7 below are the in-repo problem-statement mapping in [README.md](../README.md), not a published Hack2skill PDF.

## Sources consulted

| Source                                                                                                         | What it owns                                                                                   | Retrieved                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [promptwars.in/promptwarsVirtual.html](https://promptwars.in/promptwarsVirtual.html)                           | Official PromptWars Virtual rules, dual submission, India-only, Antigravity FAQ                | 2026-09-16. Hero is a “brief refresh / launch dates coming soon” stub. Body still states the 14-day cycle and FAQs. |
| [hack2skill.com/event/build-with-ai?tab=promptwars](https://hack2skill.com/event/build-with-ai?tab=promptwars) | Program overview (in-person vs virtual)                                                        | 2026-09-16                                                                                                          |
| User-attached Hack2skill card (16 Sep 2026)                                                                    | Current challenge title: **AI for Legal Assistance & Access**; format Virtual; host Hack2skill | Contest UI screenshot, not a PDF                                                                                    |
| [README.md](../README.md) Problem Statement Alignment                                                          | This repo’s R1–R7 mapping used for judging alignment                                           | In-repo                                                                                                             |
| [docs/decisions.md](decisions.md)                                                                              | Explicit non-goals: no law research, no filings, no document DB                                | In-repo                                                                                                             |
| [docs/research-promptwars-criteria.md](research-promptwars-criteria.md)                                        | Prior audit (2026-09-15): R5/R6 thinner than README; brief was review-only                     | In-repo (secondary to source)                                                                                       |

Not retrieved: a public PDF or dashboard text of the 16 September problem statement. promptwars.in states the Virtual site is refreshing. Do not treat R1–R7 as official Hack2skill numbering.

## Official program constraints (cited)

From [PromptWars Virtual](https://promptwars.in/promptwarsVirtual.html):

- India only.
- Dual submission: live preview **and** a narrative (LinkedIn / technical post).
- Build with Google Antigravity or other AI tools (FAQ also says Antigravity is required).
- Functional app, not a mock.
- Evaluation is of a valid working submission, not a published rubric of legal-assistant sub-features.

The Hack2skill card names the industry problem **AI for Legal Assistance & Access**. “Access” is part of the official title; it is not expanded into a feature list on the public Virtual page.

## Repo inventory (2026-09-16)

| Capability                                       | Status                           | Evidence                                                                   |
| ------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------- |
| R1 Simplify documents                            | Present                          | Review panel, plain-language prompt in `server/prompt.ts`                  |
| R2 Compare versions                              | Present                          | `src/features/workspace/compare-panel.tsx`                                 |
| R3 Clauses, obligations, risks                   | Present                          | Findings + `src/features/review/obligations.tsx`                           |
| R4 Document Q&A                                  | Present                          | `src/features/workspace/question-panel.tsx`                                |
| R5 Next steps / options                          | Present                          | `analysis.nextSteps` on review and brief                                   |
| R6 Actionable output                             | Partial (before this change)     | `createBrief` used review only; comparison and Q&A stayed off the download |
| R7 Not legal advice                              | Present                          | Scope copy, prompt, brief disclaimer                                       |
| Sample without API key                           | Present                          | `exploreSample`, `src/domain/sample.ts`                                    |
| Quote verification                               | Present                          | `src/domain/evidence.ts`                                                   |
| Consent, in-memory workspace                     | Present                          | `document-entry.tsx`, `use-workspace.ts`                                   |
| Indian-language explanations                     | **Missing** (before this change) | Context had role / jurisdiction / concern only (`src/domain/types.ts`)     |
| OCR of scans, statute research, drafting filings | Absent by design                 | [docs/decisions.md](decisions.md)                                          |

## Gap table

| Feature                                          | Required by                                                                                                            | Status before this change | Priority                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------ |
| Explanations in a language the reader can use    | Official track title **Access**; Virtual is India-only ([promptwars.in](https://promptwars.in/promptwarsVirtual.html)) | Missing                   | High — added                                                 |
| Brief includes compare + Q&A                     | In-repo R6; walkthrough in README; prior audit                                                                         | Missing                   | High — added                                                 |
| Official PS PDF extras (rights lookup, drafting) | Unknown — PS not published                                                                                             | Not implemented           | Do not add without the PDF; conflicts with R7 / decisions.md |
| OCR for scanned PDFs                             | Not in public Virtual rules                                                                                            | Explicit non-goal         | Skip                                                         |
| Voice / TTS                                      | Not in public Virtual rules                                                                                            | Absent                    | Skip                                                         |

## What is explicitly not required (from what we could cite)

- A document database or user accounts ([docs/decisions.md](decisions.md)).
- Researching applicable law or producing filings (same; `server/prompt.ts`).
- Using only Cloud Run (Challenge 3+ recordings say GitHub + live preview; Vercel is accepted in later cycles).

## What we added

1. **Explain in** — English plus nine scheduled Indian languages. Gemini writes explanations in that language; **quotations stay verbatim in the source document’s language** so evidence checks still pass.
2. **Brief extras** — the Markdown download now includes the workspace comparison and the latest grounded Q&A, matching the README walkthrough.

## Recommended non-adds

Do not add statute lookup, contract drafting, or OCR until a first-party problem statement requires them. Those would weaken R7 and the “wording is evidence, not law” boundary.
