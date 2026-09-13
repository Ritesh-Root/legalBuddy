/** Prepare and download an evidence-linked lawyer briefing entirely in the browser. */
import {
  DownloadSimpleIcon as DownloadSimple,
  NotePencilIcon as NotePencil,
  ArrowUpRightIcon as ArrowUpRight,
} from '@phosphor-icons/react';
import type { ReactElement } from 'react';
import { createBrief } from '../../domain/brief';
import type { Analysis } from '../../domain/types';
import type { Workspace } from './use-workspace';

function downloadBrief(content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'margin-lawyer-brief.md';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** The brief is a preparation tool and never a legal opinion or filing. */
export default function BriefPanel({
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
          <span className="eyebrow">YOUR NEXT CONVERSATION</span>
          <h1>Go in with better questions.</h1>
          <p>A clear starting point to share with a qualified lawyer.</p>
        </div>
        <button
          className="button primary"
          onClick={() => downloadBrief(createBrief(analysis, workspace.context, workspace.sample))}
        >
          <DownloadSimple size={18} aria-hidden="true" /> Download brief
        </button>
      </div>
      <div className="brief-grid">
        <article className="brief-paper">
          <div className="brief-paper-heading">
            <span className="eyebrow">MARGIN / PREPARATION NOTES</span>
            <NotePencil size={28} weight="light" aria-hidden="true" />
          </div>
          <h2>Your legal conversation brief</h2>
          <div className="brief-context">
            <div>
              <span>Document</span>
              <strong>{workspace.name}</strong>
            </div>
            <div>
              <span>Reading as</span>
              <strong>{workspace.context.role}</strong>
            </div>
            <div>
              <span>Jurisdiction</span>
              <strong>{workspace.context.jurisdiction || 'Not specified'}</strong>
            </div>
            <div>
              <span>Main concern</span>
              <strong>{workspace.context.concern || 'General understanding'}</strong>
            </div>
          </div>
          <h3>The situation in a few words</h3>
          <p>{analysis.summary}</p>
          <h3>Questions worth taking with you</h3>
          <ol className="brief-questions">
            {analysis.findings.map((finding) => (
              <li key={finding.title}>
                <strong>{finding.question}</strong>
                <p>{finding.title}</p>
              </li>
            ))}
          </ol>
          <div className="brief-disclaimer">
            {workspace.sample && (
              <strong>
                Fictional sample · Curated walkthrough
                <br />
              </strong>
            )}
            AI-assisted preparation is not legal advice. Verify the interpretation and share the
            full agreement with your lawyer.
          </div>
        </article>
        <aside className="brief-side">
          <section>
            <span className="eyebrow">BEFORE YOU MEET</span>
            <h2>A little preparation helps.</h2>
            <div className="preparation-list">
              {analysis.nextSteps.map((step) => (
                <label key={step}>
                  <input type="checkbox" />
                  <span>{step}</span>
                </label>
              ))}
            </div>
          </section>
          <section className="bring-along">
            <h3>Bring the whole picture</h3>
            <p>
              The full agreement, any revised versions, emails about the terms, and dates that may
              matter.
            </p>
            <button className="text-button" onClick={() => workspace.setTab('review')}>
              Return to the document <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </section>
          <p className="muted small">
            Your download includes the review, source quotations, obligations, and missing
            information. It is created on your device.
          </p>
        </aside>
      </div>
    </>
  );
}
