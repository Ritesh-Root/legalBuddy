/** A single private workspace connects review, comparison, questions, and preparation. */
import { Suspense, useEffect, useState, type ReactElement } from 'react';
import {
  ArrowRightIcon as ArrowRight,
  LockKeyIcon as LockKey,
  SparkleIcon as Sparkle,
} from '@phosphor-icons/react';
import { Sidebar } from './components/sidebar';
import { useWorkspace, type Workspace } from './features/workspace/use-workspace';
import { Welcome } from './features/documents/welcome';
import { WorkspacePanels } from './features/workspace/workspace-panels';
const titles = {
  review: 'Document review',
  compare: 'Compare versions',
  ask: 'Ask a question',
  brief: 'Your lawyer brief',
};

function ActivePanel({ workspace }: { workspace: Workspace }): ReactElement {
  if (!workspace.analysis) {
    return (
      <>
        <div hidden={workspace.tab !== 'review'}>
          <Welcome workspace={workspace} />
        </div>
        {workspace.tab !== 'review' && (
          <section className="empty-panel">
            <span className="eyebrow">ONE DOCUMENT. A CLEARER PICTURE.</span>
            <h1>{titles[workspace.tab]}</h1>
            <p>
              Start with a document review to{' '}
              {workspace.tab === 'compare'
                ? 'compare its wording with a revision'
                : workspace.tab === 'ask'
                  ? 'ask questions with source evidence'
                  : 'prepare your questions and commitments'}
              .
            </p>
            <button className="button primary" onClick={() => workspace.setTab('review')}>
              Add a document <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button className="text-button" onClick={workspace.exploreSample}>
              Or explore the sample
            </button>
          </section>
        )}
      </>
    );
  }
  return <WorkspacePanels workspace={workspace} analysis={workspace.analysis} />;
}

/** No session content is persisted; reloading or clearing discards the workspace. */
export function App(): ReactElement {
  const workspace = useWorkspace();
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/health', { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (
          typeof body === 'object' &&
          body !== null &&
          'aiConfigured' in body &&
          typeof body.aiConfigured === 'boolean'
        )
          setConfigured(body.aiConfigured);
      })
      .catch(() => {
        if (!controller.signal.aborted) setConfigured(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    document.title = `${titles[workspace.tab]} · legalBuddy`;
  }, [workspace.tab]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar workspace={workspace} />
      <div className="main-shell">
        <header className="topbar">
          <div>
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{titles[workspace.tab]}</strong>
          </div>
          <a href="/privacy.html" className="private-status" target="_blank" rel="noreferrer">
            <LockKey size={15} aria-hidden="true" /> In-memory workspace
          </a>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {workspace.sample && (
            <div className="sample-banner">
              <Sparkle size={18} aria-hidden="true" />
              <p>
                <strong>Sample walkthrough</strong> Fictional document and curated explanations. No
                live AI call.
              </p>
              <button onClick={workspace.clear}>
                Use my own document <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          )}
          {configured === false && !workspace.sample && (
            <div className="configuration-note" role="status">
              Live AI is temporarily unavailable. The sample walkthrough is ready to explore.
            </div>
          )}
          <Suspense
            fallback={
              <p role="status" className="loading-panel">
                Opening your workspace…
              </p>
            }
          >
            <ActivePanel key={workspace.sessionKey} workspace={workspace} />
          </Suspense>
        </main>
        <footer className="main-footer">
          <span>Understand the words. Own your next step.</span>
          <a href="/privacy.html" target="_blank" rel="noreferrer">
            Privacy & limitations <ArrowRight size={13} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </div>
  );
}
