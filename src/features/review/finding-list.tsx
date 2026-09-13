/** Prioritized findings connect everyday explanations to inspectable evidence. */
import {
  ArrowUpRightIcon as ArrowUpRight,
  CaretDownIcon as CaretDown,
  ChatCircleTextIcon as ChatCircleText,
} from '@phosphor-icons/react';
import { useState, type ReactElement } from 'react';
import type { Analysis, Finding } from '../../domain/types';
import type { SourceSelection } from './source-panel';

const labels = { priority: 'Discuss first', review: 'Worth clarifying', info: 'Good to know' };

function FindingItem({
  finding,
  index,
  onSelect,
}: {
  finding: Finding;
  index: number;
  onSelect: (value: SourceSelection) => void;
}): ReactElement {
  return (
    <details className={`finding finding-${finding.attention}`} open={index === 0}>
      <summary>
        <span className="finding-number">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <span className={`attention attention-${finding.attention}`}>
            <span />
            {labels[finding.attention]}
          </span>
          <h3>{finding.title}</h3>
        </div>
        <CaretDown size={18} className="finding-caret" aria-hidden="true" />
      </summary>
      <div className="finding-body">
        <p>{finding.explanation}</p>
        <blockquote>{finding.quote}</blockquote>
        <button
          className="text-button evidence-link"
          onClick={() => onSelect({ quote: finding.quote, source: finding.source })}
        >
          View in {finding.source === 'revised' ? 'revised ' : ''}document{' '}
          <ArrowUpRight size={15} aria-hidden="true" />
        </button>
        <div className="lawyer-question">
          <ChatCircleText size={18} aria-hidden="true" />
          <div>
            <strong>A question to take forward</strong>
            <p>{finding.question}</p>
          </div>
        </div>
      </div>
    </details>
  );
}

/** Filters carry text labels and pressed state so priority never relies on color alone. */
export function FindingList({
  analysis,
  onSelect,
}: {
  analysis: Analysis;
  onSelect: (value: SourceSelection) => void;
}): ReactElement {
  const [filter, setFilter] = useState<'all' | Finding['attention']>('all');
  const findings = analysis.findings.filter(
    (finding) => filter === 'all' || finding.attention === filter,
  );
  return (
    <section className="findings-section" aria-labelledby="findings-heading">
      <div className="section-heading compact">
        <h2 id="findings-heading">What deserves your attention</h2>
        <span className="count-label">{analysis.findings.length} points</span>
      </div>
      <div className="filter-row" aria-label="Filter findings">
        {(['all', 'priority', 'review', 'info'] as const).map((value) => (
          <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {value === 'all' ? 'All points' : labels[value]}
          </button>
        ))}
      </div>
      <div className="findings-list">
        {findings.map((finding, index) => (
          <FindingItem
            key={`${finding.title}-${finding.quote}`}
            finding={finding}
            index={index}
            onSelect={onSelect}
          />
        ))}
        {findings.length === 0 && (
          <p className="empty-note">
            No findings in this category. This does not establish that the agreement is risk-free.
          </p>
        )}
      </div>
    </section>
  );
}
