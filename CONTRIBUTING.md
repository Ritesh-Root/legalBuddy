# Contributing

Use Node.js 24 and `npm ci`. Run `npm run dev`; Gemini is optional for the curated walkthrough. Put local credentials only in `.env.local`.

Keep feature UI under `src/features`, shared contracts under `src/domain`, and server boundaries under `server`. Validate input and generated output; never add document telemetry, HTML rendering of model output, or silent fallback to sample data.

Before a change is ready, run `npm run verify`, `npm run test:e2e`, and `npm run preflight`. Browser tests require `npx playwright install chromium`; `PLAYWRIGHT_CHANNEL=chrome` can use an existing Chrome installation. Use conventional commit messages.

During the PromptWars event, the repository must contain exactly one branch. Do not create bot or feature branches on the public submission repository. Proposed changes can be discussed in issues without including private documents.
