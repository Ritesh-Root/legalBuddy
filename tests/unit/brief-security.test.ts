/** Exported Markdown must treat document and model text as literal content. */
import { describe, expect, it } from 'vitest';
import { createBrief } from '../../src/domain/brief';
import { SAMPLE_ANALYSIS, SAMPLE_CONTEXT } from '../../src/domain/sample';

describe('brief export isolation', () => {
  it('escapes links, images, raw HTML, code fences and injected block structure', () => {
    const payload =
      '![track](https://example.invalid/pixel)\n<script>bad</script>\n# Heading\n```js\n[link](https://example.invalid)';
    const analysis = {
      ...SAMPLE_ANALYSIS,
      title: payload,
      summary: payload,
      nextSteps: [payload],
      missingInformation: [payload],
      findings: SAMPLE_ANALYSIS.findings.map((finding) => ({
        ...finding,
        title: payload,
        explanation: payload,
        quote: payload,
        question: payload,
      })),
      obligations: SAMPLE_ANALYSIS.obligations.map((item) => ({
        ...item,
        task: payload,
        owner: payload,
        timing: payload,
        quote: payload,
      })),
    };
    const brief = createBrief(
      analysis,
      { ...SAMPLE_CONTEXT, concern: payload, jurisdiction: payload },
      false,
    );
    expect(brief).not.toContain('![track](');
    expect(brief).not.toContain('<script>');
    expect(brief).not.toContain('\n# Heading');
    expect(brief).not.toContain('```');
    expect(brief).toContain('\\!\\[track\\]\\(https://example\\.invalid/pixel\\)');
    expect(analysis.summary).toBe(payload);
  });
  it('preserves ordinary legal wording and escapes existing HTML entities as text', () => {
    const brief = createBrief(
      {
        ...SAMPLE_ANALYSIS,
        summary: '₹30,000 is due; interest is 2% & principal < ₹60,000. &lt;img&gt;',
      },
      SAMPLE_CONTEXT,
      false,
    );
    expect(brief).toContain(
      '₹30,000 is due; interest is 2% &amp; principal &lt; ₹60,000\\. &amp;lt;img&amp;gt;',
    );
  });
});
