/** Compose the reading report, obligations, uncertainty, and original document. */
import {
  ArrowRightIcon as ArrowRight,
  CheckCircleIcon as CheckCircle,
  InfoIcon as Info,
} from '@phosphor-icons/react';
import { useState, type CSSProperties, type ReactElement } from 'react';
import type { Analysis } from '../../domain/types';
import type { Workspace } from '../workspace/use-workspace';
import { FindingList } from './finding-list';
import { Obligations } from './obligations';
import { SourcePanel, type SourceSelection } from './source-panel';

/** A reusable report layout also powers version comparison. */
export function AnalysisReport({
  analysis,
  document,
  revised = '',
}: {
  analysis: Analysis;
  document: string;
  revised?: string;
}): ReactElement {
  const [selected, setSelected] = useState<SourceSelection>({ quote: '', source: 'original' });
  const priority = analysis.findings.filter((finding) => finding.attention === 'priority').length;
  const progress = analysis.findings.length
    ? Math.max(0.12, priority / analysis.findings.length)
    : 0.12;
  return (
    <div className="board report-board">
      <section className="board-col" aria-label="Open">
        <h2>Open</h2>
        <FindingList analysis={analysis} onSelect={setSelected} />
      </section>
      <section className="board-col" aria-label="Description">
        <h2>Description</h2>
        <div className="overview">
          <span className="eyebrow">THE SHORT VERSION</span>
          <h2>{analysis.title}</h2>
          <p>{analysis.summary}</p>
          <div className="evidence-status">
            <CheckCircle size={17} aria-hidden="true" /> Quotations matched to source text
          </div>
        </div>
        <SourcePanel
          document={document}
          revised={revised}
          selected={selected}
          onSelect={setSelected}
        />
      </section>
      <section className="board-col status-col" aria-label="Status">
        <h2>Status</h2>
        <article className="status-widget">
          <p className="status-kicker">In progress</p>
          <div className="status-ring" style={{ '--progress': String(progress) } as CSSProperties}>
            <strong>{priority}</strong>
            <span>to discuss first</span>
          </div>
          <p className="status-due">
            {analysis.findings.length} points · {analysis.obligations.length} commitments
          </p>
        </article>
        <Obligations analysis={analysis} onSelect={setSelected} />
        <section className="next-steps">
          <h2>Useful next steps</h2>
          <ul>
            {analysis.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
        <section className="uncertainty">
          <h2>
            <Info size={19} aria-hidden="true" /> What this review can’t establish
          </h2>
          <ul>
            {analysis.missingInformation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            AI can misinterpret wording or miss a clause. Check the full document and discuss
            important decisions with a qualified lawyer.
          </p>
        </section>
      </section>
    </div>
  );
}

/** Surface review priorities without presenting a misleading legal safety score. */
export function ReviewPanel({
  workspace,
  analysis,
}: {
  workspace: Workspace;
  analysis: Analysis;
}): ReactElement {
  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">YOUR DOCUMENT, EXPLAINED</span>
          <h1>Read between the lines.</h1>
          <p>
            {workspace.name} <span>·</span> {workspace.context.role}
          </p>
        </div>
        <button className="button secondary" onClick={() => workspace.setTab('brief')}>
          Prepare my brief <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="review-stats">
        <div>
          <strong>{analysis.findings.length}</strong>
          <span>points to understand</span>
        </div>
        <div>
          <strong>
            {analysis.findings.filter((finding) => finding.attention === 'priority').length}
          </strong>
          <span>to discuss first</span>
        </div>
        <div>
          <strong>{analysis.obligations.length}</strong>
          <span>commitments identified</span>
        </div>
        <p>
          A reading guide.
          <br />A more informed next step.
        </p>
      </div>
      <AnalysisReport analysis={analysis} document={workspace.document} />
    </>
  );
}
