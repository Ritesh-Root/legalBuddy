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

/** Encode untrusted values for downstream Markdown readers without changing source evidence. */
export function createBrief(analysis: Analysis, context: ReaderContext, sample: boolean): string {
  const lines = [
    '# Margin · Legal conversation brief',
    sample
      ? '\nSAMPLE WALKTHROUGH — illustrative content, not a live AI review.'
      : '\nAI-assisted preparation notes — verify all interpretations.',
    '\nInformation and preparation only. This is not legal advice or a determination of enforceability.',
    `\n## Reader context\nRole: ${literal(context.role)}\nJurisdiction: ${literal(context.jurisdiction || 'Not specified')}\nMain concern: ${literal(context.concern || 'General understanding')}`,
    `\n## ${literal(analysis.title)}\n${literal(analysis.summary)}`,
    '\n## Points to discuss',
    ...analysis.findings.map(
      (finding, index) =>
        `\n${index + 1}. ${literal(finding.title)} [${finding.attention}]\n${literal(finding.explanation)}\nSource (${finding.source}): “${literal(finding.quote)}”\nAsk: ${literal(finding.question)}`,
    ),
    '\n## Obligations to verify',
    ...analysis.obligations.map(
      (item) =>
        `\n- [ ] ${literal(item.task)}\n  Who: ${literal(item.owner)}; when: ${literal(item.timing)}\n  Source (${item.source}): “${literal(item.quote)}”`,
    ),
    '\n## Suggested preparation',
    ...analysis.nextSteps.map((step) => `- [ ] ${literal(step)}`),
    '\n## Missing information',
    ...analysis.missingInformation.map((item) => `- ${literal(item)}`),
  ];
  return lines.join('\n');
}
