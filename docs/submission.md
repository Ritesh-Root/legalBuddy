# PromptWars Virtual — what to paste in the form

Official dual submission from [PromptWars Virtual](https://promptwars.in/promptwarsVirtual.html):

- **Technical:** public code + a live preview
- **Narrative:** a technical blog **and** a LinkedIn post

## Technical

| Field             | Use this                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| GitHub            | https://github.com/Ritesh-Root/legalBuddy                                    |
| Live preview      | https://legalbuddy-app.vercel.app                                            |
| Walkthrough video | **85s judge cut** (this is the form video): `~/Downloads/legalBuddy-submission.mp4` and `brag-output-2026-09-19-021758/brag.mp4` (untracked — over the 10 MB repo cap if committed). Upload to Drive (Anyone with the link) or YouTube, then paste that URL. |

Do **not** submit:

- https://margin-legal-assistant.vercel.app — old Margin build

Judges can use the sample with no API key: **Explore the sample** → ownership finding → compare → ask **Can I show this in my portfolio?** → **Download brief**.

## Narrative

1. Publish [docs/build-in-public.md](build-in-public.md) as a LinkedIn article, Hashnode, or Dev.to post. Put that URL in the form.
2. Post [brag-output/share-copy.txt](../brag-output/share-copy.txt) on LinkedIn. The 20s launch clip is `brag-output/brag.mp4` / `~/Downloads/legalBuddy-brag.mp4`.

Optional Instagram reel (separate Prompt Credits bonus): the 20s clip is landscape. A 9:16 cut is not in this repo yet.

## Judge video checklist (85s cut)

The submission walkthrough follows the Hack2skill Video Submission Guide:

- Walkthrough of paste, review, quote jump, Q&A, Download brief
- Live typing of a photography agreement (not the sample)
- Edge cases: empty brief, rejected `.exe`, two-character paste
- GenAI called out on **Make it clear** and **Ask about this document**
- Two different Gemini answers on the same document
- On-screen captions, no voiceover, 85 seconds (under 4 minutes)

You still upload that file and paste a public Drive or YouTube link. Open the link in a private window before submitting.

## Gates already green

- `npm run preflight` — size, one branch, README headings, no tracked secrets
- Quality / CodeQL / secret-scan CI on `main`
- Live health `{"status":"ok","aiConfigured":true}`
- Live sample review, compare, and ask returned verified quotes

## You still do by hand

- Publish the blog and the LinkedIn post, then paste those URLs into Hack2skill
- Confirm the form’s GitHub + live preview fields match the table above
