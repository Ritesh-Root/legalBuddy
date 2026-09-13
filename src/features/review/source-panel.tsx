/** Keep the original wording visible and focus evidence selected from a finding. */
import {
  FileTextIcon as FileText,
  MagnifyingGlassIcon as MagnifyingGlass,
} from '@phosphor-icons/react';
import { useEffect, useRef, type ReactElement } from 'react';
import { documentHighlights } from '../../domain/evidence';

/** Exact source selection carries both its document identity and quotation. */
export interface SourceSelection {
  quote: string;
  source: 'original' | 'revised';
}

/** Source text is rendered as React text, never as HTML supplied by a file or model. */
export function SourcePanel({
  document,
  revised = '',
  selected,
  onSelect,
}: {
  document: string;
  revised?: string;
  selected: SourceSelection;
  onSelect: (value: SourceSelection) => void;
}): ReactElement {
  const panel = useRef<HTMLDivElement>(null);
  const sourceText = selected.source === 'revised' ? revised : document;
  useEffect(() => {
    if (selected.quote) {
      const element = panel.current?.querySelector<HTMLElement>('[data-selected="true"]');
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [selected]);
  return (
    <aside className="source-panel" aria-label="Source document">
      <div className="source-heading">
        <div>
          <FileText size={19} aria-hidden="true" />
          <h2>Source document</h2>
        </div>
        <span className="small-tag">{sourceText.split(/\s+/u).length} words</span>
      </div>
      {revised && (
        <div className="source-tabs" aria-label="Source version">
          <button
            aria-pressed={selected.source === 'original'}
            onClick={() => onSelect({ source: 'original', quote: '' })}
          >
            Original
          </button>
          <button
            aria-pressed={selected.source === 'revised'}
            onClick={() => onSelect({ source: 'revised', quote: '' })}
          >
            Revised
          </button>
        </div>
      )}
      <div className="source-hint">
        <MagnifyingGlass size={15} aria-hidden="true" /> Select “View in document” to trace a
        finding.
      </div>
      <div
        className="source-paper"
        ref={panel}
        tabIndex={0}
        role="region"
        aria-label={`${selected.source} document text`}
      >
        {documentHighlights(sourceText, selected.quote).map((paragraph, index) => {
          const active = Boolean(paragraph.match);
          return (
            <div
              key={index}
              className={`source-paragraph ${active ? 'source-selected' : ''}`}
              data-selected={active}
              tabIndex={active ? -1 : undefined}
            >
              <span className="line-number" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p>
                {paragraph.before}
                {paragraph.match && <mark>{paragraph.match}</mark>}
                {paragraph.after}
              </p>
            </div>
          );
        })}
      </div>
      <div className="source-footer">
        <span className="status-dot" /> Original wording preserved
      </div>
    </aside>
  );
}
