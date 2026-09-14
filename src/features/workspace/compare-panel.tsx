/** Compare an explicitly supplied revision without silently replacing the original. */
import {
  ArrowRightIcon as ArrowRight,
  ArrowsLeftRightIcon as ArrowsLeftRight,
  FileArrowUpIcon as FileArrowUp,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { Workspace } from './use-workspace';
import { MAX_DOCUMENT_CHARACTERS } from '../../domain/types';
import { AnalysisReport } from '../review/review-panel';
import { readDocumentFile } from '../documents/file-reader';

/** The result stays tied to the revision that generated it, even if the draft is edited. */
export default function ComparePanel({ workspace }: { workspace: Workspace }): ReactElement {
  const [draft, setDraft] = useState(workspace.revised);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function compare(): Promise<void> {
    const pending = new AbortController();
    controller.current = pending;
    setBusy(true);
    setError('');
    try {
      const result = await workspace.assist(
        {
          action: 'compare',
          document: workspace.document,
          revised: draft,
          question: '',
          context: workspace.context,
          consent: true,
        },
        pending.signal,
      );
      if (!pending.signal.aborted) {
        workspace.setRevised(draft);
        workspace.setComparison(result);
      }
    } catch (failure) {
      if (!pending.signal.aborted)
        setError(
          failure instanceof Error ? failure.message : 'Comparison failed. Please try again.',
        );
    } finally {
      if (!pending.signal.aborted) setBusy(false);
    }
  }

  async function addRevision(file: File | undefined): Promise<void> {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setDraft(await readDocumentFile(file));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The file could not be read.');
    } finally {
      setBusy(false);
      if (upload.current) upload.current.value = '';
    }
  }

  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">A SECOND LOOK</span>
          <h1>Small edits. Real differences.</h1>
          <p>Understand what changed, and what still needs a conversation.</p>
        </div>
        <ArrowsLeftRight size={34} weight="light" aria-hidden="true" />
      </div>
      {!workspace.sample && (
        <form
          className="comparison-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (consent) void compare();
          }}
        >
          <div className="section-heading compact">
            <label htmlFor="revised-document">Add the revised version</label>
            <button
              type="button"
              className="text-button"
              disabled={busy}
              onClick={() => upload.current?.click()}
            >
              <FileArrowUp size={18} aria-hidden="true" /> Upload revision
            </button>
            <input
              className="visually-hidden"
              ref={upload}
              type="file"
              tabIndex={-1}
              aria-label="Upload revised document"
              accept=".txt,.md,.pdf"
              onChange={(event) => {
                void addRevision(event.target.files?.[0]);
              }}
            />
          </div>
          <textarea
            id="revised-document"
            required
            minLength={80}
            maxLength={MAX_DOCUMENT_CHARACTERS}
            rows={6}
            value={draft}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Paste the updated agreement. Your original stays available alongside it."
          />
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              required
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              I agree to send both versions and my context to Google Gemini for comparison.
            </span>
          </label>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="entry-actions">
            <span>Original: {workspace.name}</span>
            <button
              className="button primary"
              disabled={busy || !consent || draft.trim().length < 80}
            >
              {busy ? 'Comparing the wording…' : 'Compare versions'}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
          {busy && <p role="status">Reading both versions and checking the cited changes…</p>}
        </form>
      )}
      {workspace.comparison && (
        <>
          <div className="comparison-label">
            <span>ORIGINAL</span>
            <ArrowRight size={16} aria-hidden="true" />
            <span>REVISED</span>
            <p>
              {workspace.sample
                ? 'Fictional sample comparison'
                : 'Report for the last compared revision'}
            </p>
          </div>
          <AnalysisReport
            key={workspace.revised}
            analysis={workspace.comparison}
            document={workspace.document}
            revised={workspace.revised}
          />
        </>
      )}
    </>
  );
}
