/** Create portable preparation notes locally, without an additional AI request. */
import type { Analysis, ReaderContext } from './types';

function literal(text: string): string {
  return text
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/[\\`*_{}[\]()#+.!|-]/gu, '\\$&')
    .replace(/[\r\n]+/gu, ' ');
}

function findingLines(items: Analysis['findings'], start = 1): string[] {
  return items.map(
    (finding, index) =>
      `\n${index + start}. ${literal(finding.title)} [${finding.attention}]\n${literal(finding.explanation)}\nSource (${finding.source}): “${literal(finding.quote)}”\nAsk: ${literal(finding.question)}`,
  );
}

/** Optional compare/Q&A results travel with the review so the download matches the workspace. */
export type BriefExtras = {
  comparison?: Analysis | null;
  question?: string;
  answer?: Analysis | null;
};

/** Encode untrusted values for downstream Markdown readers without changing source evidence. */
export function createBrief(
  analysis: Analysis,
  context: ReaderContext,
  sample: boolean,
  extras: BriefExtras = {},
): string {
  const comparison = extras.comparison;
  const asked = extras.question?.trim() ?? '';
  const answer = extras.answer;
  const lines = [
    '# legalBuddy · Legal conversation brief',
    sample
      ? '\nSAMPLE WALKTHROUGH — illustrative content, not a live AI review.'
      : '\nAI-assisted preparation notes — verify all interpretations.',
    '\nInformation and preparation only. This is not legal advice or a determination of enforceability.',
    `\n## Reader context\nRole: ${literal(context.role)}\nJurisdiction: ${literal(context.jurisdiction || 'Not specified')}\nExplain in: ${literal(context.language)}\nMain concern: ${literal(context.concern || 'General understanding')}`,
    `\n## ${literal(analysis.title)}\n${literal(analysis.summary)}`,
    '\n## Points to discuss',
    ...findingLines(analysis.findings),
    '\n## Obligations to verify',
    ...analysis.obligations.map(
      (item) =>
        `\n- [ ] ${literal(item.task)}\n  Who: ${literal(item.owner)}; when: ${literal(item.timing)}\n  Source (${item.source}): “${literal(item.quote)}”`,
    ),
  ];
  if (comparison) {
    lines.push(
      `\n## Version comparison\n${literal(comparison.summary)}`,
      ...findingLines(comparison.findings),
    );
  }
  if (asked && answer) {
    lines.push(
      `\n## Question asked\n${literal(asked)}\n\n${literal(answer.answer)}`,
      ...findingLines(answer.findings),
    );
  }
  lines.push(
    '\n## Suggested preparation',
    ...analysis.nextSteps.map((step) => `- [ ] ${literal(step)}`),
    '\n## Missing information',
    ...analysis.missingInformation.map((item) => `- ${literal(item)}`),
  );
  return lines.join('\n');
}
