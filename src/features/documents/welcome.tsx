/** Dashboard introduction that keeps the consent-first document form in reach. */
import { CheckIcon as Check } from '@phosphor-icons/react';
import type { CSSProperties, ReactElement } from 'react';
import type { Workspace } from '../workspace/use-workspace';
import { DocumentEntry } from './document-entry';
import { GreetingClock, useDashboardClock } from '../../components/greeting';

/** Greeting, challenge widget, and board columns introduce the reading task. */
export function Welcome({ workspace }: { workspace: Workspace }): ReactElement {
  const { date } = useDashboardClock();
  return (
    <>
      <section className="dash-hero">
        <article className="greeting-card">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="tiny-line" /> LESS LEGAL JARGON. MORE UNDERSTANDING.
            </span>
            <p className="greeting-kicker">Good morning</p>
            <h1>Before you sign.</h1>
            <p>Have a fruitful day — understand the fine print first.</p>
            <GreetingClock />
            <div className="hero-benefits">
              <span>
                <Check size={15} aria-hidden="true" /> Plain-language explanations
              </span>
              <span>
                <Check size={15} aria-hidden="true" /> Evidence you can trace
              </span>
            </div>
          </div>
          <img
            className="hero-art"
            src="/illustrations/consult.jpg"
            width={640}
            height={360}
            alt="Two people sitting together and reviewing a contract clause"
          />
        </article>
        <aside className="challenge-card">
          <PromptWarsBanner />
          <p className="challenge-title">AI for Legal Assistance &amp; Access</p>
          <p className="challenge-meta">Hack2skill · {date}</p>
        </aside>
      </section>
      <DocumentEntry workspace={workspace} />
      <div className="board welcome-board">
        <section className="board-col" aria-label="Open">
          <h2>Open</h2>
          <article className="task-card task-card-active">
            <p className="task-id">#01 Sample walkthrough</p>
            <p>Freelance design agreement — payment, ownership, and liability in plain language.</p>
            <p className="task-meta">Fictional · no API key</p>
          </article>
          <article className="task-card task-card-dashed">
            <p className="task-id">#02 Your document</p>
            <p>Paste or upload an agreement above. Analysis starts only after you consent.</p>
          </article>
        </section>
        <section className="board-col" aria-label="Description">
          <h2>Description</h2>
          <article className="task-card">
            <p className="task-id">How legalBuddy reads</p>
            <p>
              Gemini explains the wording you supplied. Every quotation is checked against the
              document before anything is shown.
            </p>
            <ul className="desc-list">
              <li>Review clauses and obligations</li>
              <li>Compare a revision</li>
              <li>Ask a grounded question</li>
              <li>Download a lawyer brief</li>
            </ul>
          </article>
        </section>
        <section className="board-col status-col" aria-label="Status">
          <h2>Status</h2>
          <article className="status-widget">
            <p className="status-kicker">Not legal advice</p>
            <div className="status-ring" style={{ '--progress': '0.72' } as CSSProperties}>
              <strong>Prep</strong>
              <span>for a lawyer</span>
            </div>
            <p className="status-due">Information and preparation only</p>
            <img
              className="justice-art"
              src="/illustrations/justice.jpg"
              width={220}
              height={294}
              alt="Scales of justice on a law book with a gavel"
            />
          </article>
        </section>
      </div>
      <p className="scope-note">
        A clearer starting point for a conversation with a lawyer. legalBuddy provides information
        and preparation, not legal advice.
      </p>
    </>
  );
}

const BINARY = Array.from({ length: 16 }, (_, row) =>
  Array.from({ length: 30 }, (_, col) => {
    const v = (row * 19 + col * 7 + row * col) % 5;
    if (v === 0) return '1';
    if (v === 1) return '0';
    return ' ';
  }).join(''),
).join('\n');

/** Official PromptWars Virtual mark, drawn in CSS so contest copy stays sharp. */
function PromptWarsBanner(): ReactElement {
  return (
    <div
      className="pw-banner"
      role="img"
      aria-label="PromptWars: Virtual. Build, deploy and win from anywhere."
    >
      <span className="pw-binary" aria-hidden="true">
        {BINARY}
      </span>
      <header className="pw-top">
        <span className="pw-gdev">
          <GoogleMark />
          Google for Developers
        </span>
        <span className="pw-i12g">
          <I12gMark />
          I12G
        </span>
        <span className="pw-bwai">
          <span>
            {'{'} Build
            <SparkleIcon className="pw-bwai-spark" />
          </span>
          <span>with AI {'}'}</span>
        </span>
      </header>
      <div className="pw-stage">
        <div className="pw-title-row">
          <PuzzleIcon />
          <div className="pw-name-wrap">
            <p className="pw-name">PromptWars</p>
            <SparkleIcon className="pw-spark" />
          </div>
        </div>
        <div className="pw-cta">
          <span className="pw-virtual">
            Virtual
            <CursorIcon />
          </span>
          <p className="pw-tagline">
            Build, deploy &amp; win
            <br />
            from anywhere
          </p>
        </div>
      </div>
      <footer className="pw-foot">
        <span className="pw-globe-row">
          <ArrowIcon />
          <GlobeIcon />
        </span>
        <XMark />
      </footer>
    </div>
  );
}

function GoogleMark(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function I12gMark(): ReactElement {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1.1" fill="currentColor" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1.1" fill="currentColor" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1.1" fill="currentColor" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1.1" fill="currentColor" />
    </svg>
  );
}

function PuzzleIcon(): ReactElement {
  return (
    <svg className="pw-puzzle" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="1.5" y="1.5" width="12" height="12" rx="2.6" />
      <rect x="18.5" y="1.5" width="12" height="12" rx="2.6" />
      <rect x="1.5" y="18.5" width="12" height="12" rx="2.6" />
      <rect x="18.5" y="18.5" width="12" height="12" rx="2.6" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0.6 14.6 9.4 23.4 12 14.6 14.6 12 23.4 9.4 14.6 0.6 12 9.4 9.4Z" />
    </svg>
  );
}

function CursorIcon(): ReactElement {
  return (
    <svg className="pw-cursor" viewBox="0 0 18 22" aria-hidden="true">
      <path
        fill="#fff"
        stroke="#111"
        strokeLinejoin="round"
        strokeWidth="1.3"
        d="M1.6 1.4 1.6 17.8 6.1 13.9 9.3 20.6 11.6 19.6 8.3 12.7 14.7 12.7Z"
      />
    </svg>
  );
}

function ArrowIcon(): ReactElement {
  return (
    <svg className="pw-arrow" viewBox="0 0 42 18" aria-hidden="true">
      <path d="M2 9h28M24 3.2 33 9l-9 5.8" />
    </svg>
  );
}

function GlobeIcon(): ReactElement {
  return (
    <svg className="pw-globe" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="14.5" />
      <ellipse cx="24" cy="24" rx="6.2" ry="14.5" />
      <path d="M9.5 24h29" />
      <path d="M12.2 17.2h23.6" />
      <path d="M12.2 30.8h23.6" />
    </svg>
  );
}

function XMark(): ReactElement {
  return (
    <svg className="pw-x" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M5 5 23 23M23 5 5 23" />
    </svg>
  );
}
