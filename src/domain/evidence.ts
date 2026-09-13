/** Verify citations against normalized source text without inventing evidence. */
import type { Analysis, AssistanceRequest } from './types.js';

/** PDF extraction may introduce whitespace differences; wording must still match. */
export function normalizeText(text: string): string {
  return text.normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

/** All returned quotations must exist in the correctly labeled source. */
export function hasVerifiedEvidence(result: Analysis, request: AssistanceRequest): boolean {
  const sources = {
    original: normalizeText(request.document),
    revised: normalizeText(request.revised),
  };
  return [...result.findings, ...result.obligations].every(({ quote, source }) => {
    if (source === 'revised' && request.action !== 'compare') return false;
    return sources[source].includes(normalizeText(quote));
  });
}

/** Segment the source without altering the original document sent for analysis. */
export function documentParagraphs(document: string): string[] {
  return document
    .split(/\n\s*\n/gu)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Highlight every intersection, including citations spanning blank-line paragraph boundaries. */
export function documentHighlights(
  document: string,
  quote: string,
): { before: string; match: string; after: string }[] {
  const paragraphs = documentParagraphs(document);
  const normalized = paragraphs.map(normalizeText);
  const target = normalizeText(quote);
  const start = target ? normalized.join(' ').indexOf(target) : -1;
  let offset = 0;
  return paragraphs.map((paragraph, index) => {
    const text = normalized[index] ?? '';
    const from = Math.max(0, start - offset);
    const to = Math.min(text.length, start + target.length - offset);
    offset += text.length + 1;
    if (start < 0 || from >= to) return { before: paragraph, match: '', after: '' };
    return { before: text.slice(0, from), match: text.slice(from, to), after: text.slice(to) };
  });
}
