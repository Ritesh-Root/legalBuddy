/** Evidence invariants prevent invented or misattributed model quotations. */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  documentParagraphs,
  documentHighlights,
  hasVerifiedEvidence,
  normalizeText,
} from '../../src/domain/evidence';
import {
  SAMPLE_ANALYSIS,
  SAMPLE_COMPARISON,
  SAMPLE_CONTEXT,
  SAMPLE_DOCUMENT,
  SAMPLE_REVISED,
} from '../../src/domain/sample';
import { requestSchema, type AssistanceRequest } from '../../src/domain/types';
import { createBrief } from '../../src/domain/brief';

const request: AssistanceRequest = {
  action: 'review',
  document: SAMPLE_DOCUMENT,
  revised: '',
  question: '',
  context: SAMPLE_CONTEXT,
  consent: true,
};

describe('source evidence', () => {
  it('verifies every sample quotation and comparison against its correct source', () => {
    expect(hasVerifiedEvidence(SAMPLE_ANALYSIS, request)).toBe(true);
    expect(
      hasVerifiedEvidence(SAMPLE_COMPARISON, {
        ...request,
        action: 'compare',
        revised: SAMPLE_REVISED,
      }),
    ).toBe(true);
  });
  it('rejects an invented quote and a revision quoted during original-only review', () => {
    const first = SAMPLE_ANALYSIS.findings[0];
    expect(first).toBeDefined();
    if (!first) throw new Error('Sample finding missing');
    expect(
      hasVerifiedEvidence(
        {
          ...SAMPLE_ANALYSIS,
          findings: [{ ...first, quote: 'The client will pay one million rupees.' }],
        },
        request,
      ),
    ).toBe(false);
    expect(
      hasVerifiedEvidence(
        { ...SAMPLE_ANALYSIS, findings: [{ ...first, source: 'revised' }] },
        { ...request, revised: SAMPLE_DOCUMENT },
      ),
    ).toBe(false);
  });
  it('preserves content across whitespace normalization and finds the matching paragraph', () => {
    expect(normalizeText('  one\n\t two  ')).toBe('one two');
    expect(documentParagraphs(' first\nline\n\n second \n\n')).toEqual(['first\nline', 'second']);
    expect(
      documentHighlights(SAMPLE_DOCUMENT, 'The Client will pay 50% before work begins.').findIndex(
        (paragraph) => paragraph.match,
      ),
    ).toBe(2);
    expect(
      documentHighlights(SAMPLE_DOCUMENT, 'Not a real quote').every(
        (paragraph) => !paragraph.match,
      ),
    ).toBe(true);
    expect(documentHighlights(SAMPLE_DOCUMENT, '').every((paragraph) => !paragraph.match)).toBe(
      true,
    );
  });
  it('highlights source quotes across paragraph boundaries', () => {
    expect(
      documentHighlights(
        'Payment is due.\n\nOwnership transfers later.',
        'due. Ownership transfers',
      ),
    ).toEqual([
      { before: 'Payment is ', match: 'due.', after: '' },
      { before: '', match: 'Ownership transfers', after: ' later.' },
    ]);
  });
  it('normalization is idempotent for arbitrary Unicode strings', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (text) => normalizeText(normalizeText(text)) === normalizeText(text),
      ),
      { numRuns: 200 },
    );
  });
});

describe('input contracts', () => {
  it('requires consent, rejects unknown keys, and caps input', () => {
    expect(requestSchema.safeParse(request).success).toBe(true);
    for (const invalid of [
      { ...request, consent: false },
      { ...request, apiKey: 'injected' },
      { ...request, document: 'a'.repeat(40_001) },
      { ...request, context: { ...SAMPLE_CONTEXT, instructions: 'bypass' } },
    ])
      expect(requestSchema.safeParse(invalid).success).toBe(false);
  });
  it('requires a second document for comparison and a real question for Q&A', () => {
    expect(requestSchema.safeParse({ ...request, action: 'compare' }).success).toBe(false);
    expect(requestSchema.safeParse({ ...request, action: 'ask' }).success).toBe(false);
    expect(
      requestSchema.safeParse({ ...request, action: 'ask', question: 'When do I get paid?' })
        .success,
    ).toBe(true);
  });
});

describe('portable lawyer brief', () => {
  it('includes quotations, obligations, questions, and an explicit sample label', () => {
    const brief = createBrief(SAMPLE_ANALYSIS, SAMPLE_CONTEXT, true);
    expect(brief).toContain('SAMPLE WALKTHROUGH');
    expect(brief).toContain('Source (original)');
    expect(brief).toContain('Pay the initial ₹30,000');
    expect(brief).toContain('Could ownership transfer');
    expect(brief).toContain('not legal advice');
  });
  it('labels actual AI output and discloses missing reader context', () => {
    const brief = createBrief(
      SAMPLE_ANALYSIS,
      { role: 'Tenant', jurisdiction: '', concern: '' },
      false,
    );
    expect(brief).not.toContain('SAMPLE WALKTHROUGH');
    expect(brief).toContain('Not specified');
    expect(brief).toContain('General understanding');
  });
});
