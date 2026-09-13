/** Create portable preparation notes locally, without an additional AI request. */
import type { Analysis, ReaderContext } from './types';

/** Markdown is downloaded as a file; it is never rendered as trusted HTML. */
export function createBrief(analysis: Analysis, context: ReaderContext, sample: boolean): string {
  const lines = [
    '# Margin · Legal conversation brief',
    sample
      ? '\nSAMPLE WALKTHROUGH — illustrative content, not a live AI review.'
      : '\nAI-assisted preparation notes — verify all interpretations.',
    '\nInformation and preparation only. This is not legal advice or a determination of enforceability.',
    `\n## Reader context\nRole: ${context.role}\nJurisdiction: ${context.jurisdiction || 'Not specified'}\nMain concern: ${context.concern || 'General understanding'}`,
    `\n## ${analysis.title}\n${analysis.summary}`,
    '\n## Points to discuss',
    ...analysis.findings.map(
      (finding, index) =>
        `\n${index + 1}. ${finding.title} [${finding.attention}]\n${finding.explanation}\nSource (${finding.source}): “${finding.quote}”\nAsk: ${finding.question}`,
    ),
    '\n## Obligations to verify',
    ...analysis.obligations.map(
      (item) =>
        `\n- [ ] ${item.task}\n  Who: ${item.owner}; when: ${item.timing}\n  Source (${item.source}): “${item.quote}”`,
    ),
    '\n## Suggested preparation',
    ...analysis.nextSteps.map((step) => `- [ ] ${step}`),
    '\n## Missing information',
    ...analysis.missingInformation.map((item) => `- ${item}`),
  ];
  return lines.join('\n');
}
