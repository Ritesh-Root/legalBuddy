/** Turn explicit contract duties into a readable, evidence-linked checklist. */
import {
  ArrowUpRightIcon as ArrowUpRight,
  CheckSquareIcon as CheckSquare,
} from '@phosphor-icons/react';
import type { ReactElement } from 'react';
import type { Analysis } from '../../domain/types';
import type { SourceSelection } from './source-panel';

/** Show who and when without calculating deadlines from incomplete dates. */
export function Obligations({
  analysis,
  onSelect,
}: {
  analysis: Analysis;
  onSelect: (selection: SourceSelection) => void;
}): ReactElement {
  return (
    <section className="obligations-section">
      <div className="section-heading compact">
        <h2>
          <CheckSquare size={20} aria-hidden="true" /> Commitments to keep in view
        </h2>
      </div>
      {analysis.obligations.length === 0 ? (
        <p className="empty-note">
          No explicit obligations were extracted. Check the original document for omissions.
        </p>
      ) : (
        <ul className="obligation-list">
          {analysis.obligations.map((item) => (
            <li key={`${item.task}-${item.quote}`}>
              <div>
                <h3>{item.task}</h3>
                <p>
                  {item.owner} <span>·</span> {item.timing}
                </p>
              </div>
              <button
                className="icon-button"
                aria-label={`View evidence: ${item.task}`}
                onClick={() => onSelect({ quote: item.quote, source: item.source })}
              >
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
