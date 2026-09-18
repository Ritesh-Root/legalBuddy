# PromptWars Virtual — what to paste in the form

Official dual submission from [PromptWars Virtual](https://promptwars.in/promptwarsVirtual.html):

- **Technical:** public code + a live preview
- **Narrative:** a technical blog **and** a LinkedIn post

## Technical

| Field             | Use this                                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| GitHub            | https://github.com/Ritesh-Root/legalBuddy                                    |
| Live preview      | https://legalbuddy-app.vercel.app                                            |
| Walkthrough video | `brag-output/brag.mp4` in that repo (also `~/Downloads/legalBuddy-brag.mp4`) |

Do **not** submit:

- https://margin-legal-assistant.vercel.app — old Margin build

Judges can use the sample with no API key: **Explore the sample** → ownership finding → compare → ask **Can I show this in my portfolio?** → **Download brief**.

## Narrative

1. Publish [docs/build-in-public.md](build-in-public.md) as a LinkedIn article, Hashnode, or Dev.to post. Put that URL in the form.
2. Post [brag-output/share-copy.txt](../brag-output/share-copy.txt) on LinkedIn. Attach the video or the live URL.

Optional Instagram reel (separate Prompt Credits bonus): the clip is 20s landscape. A 9:16 cut is not in this repo yet.

## Gates already green

- `npm run preflight` — size, one branch, README headings, no tracked secrets
- Quality / CodeQL / secret-scan CI on `main`
- Live health `{"status":"ok","aiConfigured":true}`
- Live sample review, compare, and ask returned verified quotes

## You still do by hand

- Publish the blog and the LinkedIn post, then paste those URLs into Hack2skill
- Confirm the form’s GitHub + live preview fields match the table above
