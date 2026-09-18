# Hyperframes Composition Brief: legalBuddy

## Objective

Create a short launch-style brag video for legalBuddy.

## Output

- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920×1080
- Duration: 20 seconds

## Source Material

- Project root: `/home/ritesh/margin-legal-assistant`
- Primary files: `index.html`, `src/styles/base.css`, `src/features/documents/welcome.tsx`, `src/features/documents/document-entry.tsx`, `src/features/review/review-panel.tsx`, `src/domain/sample.ts`, `README.md`
- Product name: legalBuddy
- Tagline / strongest claim: Make sense of the fine print. / Before you sign.
- Key UI to recreate: lavender dashboard greeting card; sample agreement + **Make it clear**; ownership finding with source highlight; **Download brief**
- Copy that must appear verbatim:
  - LESS LEGAL JARGON. MORE UNDERSTANDING.
  - Before you sign.
  - Make it clear
  - Explore the sample
  - You could hand over ownership before being paid
  - All intellectual property rights in the deliverables transfer to the Client upon creation
  - Quotations matched to source text
  - Download brief
  - Information and preparation only. Not legal advice.
  - legalBuddy

## Creative Direction

- Tone preset: polished
- Creative direction: Quiet lavender dashboard film. The proof is the sentence in the contract.
- Interpretation: Slow reveals, mixed-case serif headlines, no slam cuts, no narration.
- Angle: Show the quote, do not sell an AI lawyer.
- Hook: Before you sign.
- Outro / punchline: Download brief. legalBuddy. Not legal advice.
- Avoid: Generic SaaS language, abstract filler, cream folio, Margin wordmark.

## Visual Identity

- Background: `#eef0fa`
- Text: `#2f2b5c`
- Accent: `#5b54d6`
- Muted: `#4f4b76`
- Paper: `#fff` tinted toward lavender (`#f6f7fc`)
- Highlight: `#dcd9f8`
- Display font: Instrument Serif (local `@font-face` from the product)
- Body font: DM Sans (local `@font-face` from the product)
- Visual references: `public/illustrations/consult.jpg`, `public/illustrations/justice.jpg`, `public/favicon.svg`, sidebar wordmark, rounded `.main-shell` cards, status ring

## Storyboard to implement

See `brag-plan.md`. Four scenes, 20.0s, music vol-12, SFX sparse.

## Audio

- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` at ~0.20
- SFX: drop_001, click_002, bong_001, drop_003
- Voice: none
- Audio-reactive: glow opacity from bass/RMS
- Beat locks: 8.74 (click), 10.93 (finding), 17.47 (wordmark)

## Constraints

- 15–25 seconds (lock 20.0)
- Readable holds, not flash cuts
- At least one real UI recreation
- No generic SaaS language
- Product colors and fonts, not a redesign
- Seek-safe paused GSAP timeline, `fromTo`, no `repeat: -1`
- `npx hyperframes check` must pass before render

## Delivery

- `brag-output/brag.mp4`
- Best-frame poster `brag-output/brag.jpg` baked as frame 0
- `brag-output/share-copy.txt`
- Copy finals to `~/Downloads`
