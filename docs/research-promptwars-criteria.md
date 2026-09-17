# PromptWars criteria — independent audit (2026-09-15)

Six high-effort agents scored `/home/ritesh/margin-legal-assistant` against the contest Evaluation Evidence table. Ruflo MCP memory was unavailable; this file is the synthesis.

**Challenge:** PromptWars — AI for Legal Assistance & Access (R1–R7 in README). Official challenge page was not retrieved (refresh stub).

## Scoreboard

| Criterion | Impact | Prior in-repo | This audit | Agent |
| --- | --- | --- | --- | --- |
| Code Quality | High | 100 | **88** | reviewer |
| Problem Statement Alignment | High | 100 | **87** | deep-researcher |
| Security | Medium | 95 | **91** | security-auditor |
| Efficiency | Medium | 85 | **89** | observability |
| Testing | Low | 100 | **79** | tester |
| Accessibility | Low | 100 | **83** | deep-researcher |

Weighted (H=3, M=2, L=1): **87 / 100**.

Prior 100s in `docs/verification.md` are not supported. Presence of features is high; fidelity and gates are not 100.

## Executive summary

Margin is a strong contest submission: strict TypeScript, server-only Gemini, quote verification, sample without a key, and CI that actually runs lint, coverage, build, e2e, and audit. Judges who only check that review / compare / Q&A / brief exist will score it near the top. Independent reading of the code drops Code Quality, Alignment, Testing, and Accessibility because abort handling is copied, R5/R6 are thinner than the README, 100% coverage is a 145-line slice, and axe never runs WCAG 2.2.

## Key findings

1. **R1–R4 and R7 are real.** Sample E2E walks findings, compare, Q&A, download. Live is Gemini; sample never fakes an API. (High)
2. **R5/R6 overclaim.** No first-class “options”; review UI omits `nextSteps`; brief is review-only Markdown, not compare/Q&A. (High)
3. **Security is the strongest criterion (91).** No VITE_ keys, no innerHTML, JSON-isolated prompts, CSP without unsafe-inline. Residual: LLM01 can still steer explanations that cite a real substring; rate limits are per instance. (High)
4. **Efficiency claims match code (89).** Cache of 8 / 5 min, 3 concurrent, lazy PDF chunk, 40s timeout. Not global spend-safe. (High)
5. **Testing 100% is scoped.** 41/41 unit tests this session; 145/145 lines in `server/` + `src/domain` minus `types.ts`. UI has no component tests; live Gemini is not in CI. (High)
6. **A11y is built-in, not a 2.2 pass (83).** Skip link and labels are real. Input borders ~1.4:1; focus lost after review; duplicate `findings-heading`; axe tags omit `wcag22aa`. (High)

## Cross-agent agreements

- Sample vs live split is honest (`use-workspace.ts`, CONTRIBUTING).
- Abort/lifecycle split: review aborts previous controller; compare/ask do not (Code Quality + Efficiency + Testing).
- Coverage exclude of `types.ts` vs “domain 100%” (Code Quality + Testing).
- Lighthouse 100 / PSA 100 are landing or auto scores, not this tree.

## Contradictions

- Efficiency **up** vs prior 85 (cache, abort-to-SDK, measured bundle). Security **down** 95→91 because residuals counted.
- README “keyboard navigation” is skip-link only (Testing vs Accessibility).

## Open questions

- Official PromptWars PDF text (if it requires drafting or rights lookup, Alignment drops to the 70s).
- Production live-smoke not re-run (`aiConfigured` was false locally).
- E2E and axe not re-executed this session.

## Recommended next steps (contest, not a rewrite)

1. Put `nextSteps` on the review panel; fold compare/Q&A into the brief.
2. Soften README R2/R5/R6 wording.
3. Unify abort in `useWorkspace`; map timeout errors.
4. Add `wcag22aa` to axe; darken field borders; focus the new `h1` after review.
5. Include `types.ts` in coverage or stop saying 100% domain.
6. Do **not** rewrite in Rust for these criteria; judges score this TS/React/Vercel stack.

## Evidence quality

| Finding | Quality |
| --- | --- |
| Unit coverage 145/145, 41 tests | High (ran) |
| Source security/a11y/alignment | High (read) |
| E2E green / live Gemini | Medium / unverified |
| Official PS document | Low (not fetched) |
