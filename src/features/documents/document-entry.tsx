/** A consent-first entry form for pasted text or locally extracted document files. */
import {
  ArrowRightIcon as ArrowRight,
  FileArrowUpIcon as FileArrowUp,
  FileTextIcon as FileText,
  LockKeyIcon as LockKey,
  SparkleIcon as Sparkle,
} from '@phosphor-icons/react';
import { useRef, useState, type ReactElement } from 'react';
import type { Workspace } from '../workspace/use-workspace';
import { MAX_DOCUMENT_CHARACTERS, type ReaderContext } from '../../domain/types';
import { ContextFields } from './context-fields';
import { readDocumentFile } from './file-reader';

/** Retain a reader's input after provider failure so retrying never requires re-upload. */
export function DocumentEntry({ workspace }: { workspace: Workspace }): ReactElement {
  const [text, setText] = useState('');
  const [name, setName] = useState('Pasted document');
  const [reader, setReader] = useState<ReaderContext>(workspace.context);
  const [consent, setConsent] = useState(false);
  const [fileError, setFileError] = useState('');
  const [reading, setReading] = useState(false);
  const upload = useRef<HTMLInputElement>(null);

  async function addFile(file: File | undefined): Promise<void> {
    if (!file) return;
    setReading(true);
    setFileError('');
    try {
      setText(await readDocumentFile(file));
      setName(file.name);
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : 'The file could not be read. Try pasting its text.',
      );
    } finally {
      setReading(false);
      if (upload.current) upload.current.value = '';
    }
  }

  return (
    <section className="entry-card" aria-labelledby="entry-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / YOUR DOCUMENT</span>
          <h2 id="entry-title">Start with the fine print.</h2>
        </div>
        <span className="small-tag">No sign-up needed</span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (consent && !reading) void workspace.review(text, name, reader);
        }}
      >
        <div className="input-toolbar">
          <label htmlFor="document-text">
            <FileText size={17} aria-hidden="true" /> Paste your document
          </label>
          <button
            type="button"
            className="text-button"
            disabled={reading || workspace.busy}
            onClick={() => upload.current?.click()}
          >
            <FileArrowUp size={17} aria-hidden="true" />{' '}
            {reading ? 'Reading file…' : 'Upload a file'}
          </button>
          <input
            ref={upload}
            className="visually-hidden"
            type="file"
            tabIndex={-1}
            accept=".txt,.md,.pdf"
            aria-label="Upload legal document"
            onChange={(event) => {
              void addFile(event.target.files?.[0]);
            }}
          />
        </div>
        <textarea
          id="document-text"
          minLength={80}
          maxLength={MAX_DOCUMENT_CHARACTERS}
          required
          rows={7}
          value={text}
          disabled={workspace.busy || reading}
          onChange={(event) => {
            setText(event.target.value);
            setName('Pasted document');
          }}
          placeholder="Paste a contract, rental agreement, offer letter, or policy here. We’ll help you understand what it says — and what to ask about."
          aria-describedby="document-help"
        />
        <div className="input-meta" id="document-help">
          <span>Text-based PDF, TXT or MD · Up to 2 MB / 30 PDF pages</span>
          <span>{text.length.toLocaleString()} / 40,000 characters</span>
        </div>
        {fileError && (
          <p className="error-message" role="alert">
            {fileError}
          </p>
        )}
        <ContextFields value={reader} onChange={setReader} />
        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            required
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            I agree to send this text and context to Google Gemini for analysis. Remove sensitive
            details first.{' '}
            <a href="/privacy.html" target="_blank" rel="noreferrer">
              How processing works
            </a>
          </span>
        </label>
        {workspace.error && (
          <p className="error-message" role="alert">
            {workspace.error}
          </p>
        )}
        <div className="entry-actions">
          <span>
            <LockKey size={15} aria-hidden="true" /> No document storage
          </span>
          <button
            className="button primary"
            type="submit"
            disabled={workspace.busy || reading || !consent || text.trim().length < 80}
          >
            {workspace.busy ? (
              <>
                <span className="spinner" /> Reading your document…
              </>
            ) : (
              <>
                Make it clear <ArrowRight size={17} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
        {workspace.busy && (
          <p className="processing-note" role="status">
            Reading clauses and checking source quotations. This can take up to 45 seconds.
          </p>
        )}
      </form>
      <div className="sample-entry">
        <span className="sample-icon">
          <Sparkle size={22} aria-hidden="true" />
        </span>
        <div>
          <strong>Just looking around?</strong>
          <p>Try a fictional freelance agreement. No upload required.</p>
        </div>
        <button type="button" className="text-button" onClick={workspace.exploreSample}>
          Explore the sample <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
