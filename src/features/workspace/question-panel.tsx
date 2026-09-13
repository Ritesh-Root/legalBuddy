/** Document Q&A keeps the answer and its source evidence in the same reading space. */
import {
  ArrowRightIcon as ArrowRight,
  ChatCircleTextIcon as ChatCircleText,
  QuotesIcon as Quotes,
} from '@phosphor-icons/react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { Analysis } from '../../domain/types';
import type { Workspace } from './use-workspace';
import { requestAssistance } from './client';
import { SAMPLE_QUESTIONS, sampleAnswer } from './sample-answers';
import { FindingList } from '../review/finding-list';
import { SourcePanel, type SourceSelection } from '../review/source-panel';

/** Only selected guided questions receive curated answers when the sample is active. */
export default function QuestionPanel({ workspace }: { workspace: Workspace }): ReactElement {
  const [question, setQuestion] = useState('');
  const [answeredQuestion, setAnsweredQuestion] = useState('');
  const [answer, setAnswer] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SourceSelection>({ quote: '', source: 'original' });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function ask(prompt: string): Promise<void> {
    setQuestion(prompt);
    setError('');
    if (workspace.sample) {
      setAnsweredQuestion(prompt);
      setAnswer(sampleAnswer(prompt));
      return;
    }
    const pending = new AbortController();
    controller.current = pending;
    setBusy(true);
    try {
      const result = await requestAssistance(
        {
          action: 'ask',
          document: workspace.document,
          revised: '',
          question: prompt,
          context: workspace.context,
          consent: true,
        },
        pending.signal,
      );
      if (!pending.signal.aborted) {
        setAnswer(result);
        setAnsweredQuestion(prompt);
      }
    } catch (failure) {
      if (!pending.signal.aborted)
        setError(failure instanceof Error ? failure.message : 'The answer could not be generated.');
    } finally {
      if (!pending.signal.aborted) setBusy(false);
    }
  }

  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">STAY CURIOUS</span>
          <h1>There’s no small question.</h1>
          <p>Answers grounded in your document, with the wording to back them up.</p>
        </div>
        <ChatCircleText size={35} weight="light" aria-hidden="true" />
      </div>
      <div className="report-grid">
        <div className="report-content">
          <section className="question-card">
            <h2>What would you like to understand?</h2>
            <div className="suggested-questions">
              {SAMPLE_QUESTIONS.map((prompt) => (
                <button
                  key={prompt}
                  disabled={busy}
                  onClick={() => {
                    if (workspace.sample) void ask(prompt);
                    else setQuestion(prompt);
                  }}
                >
                  {prompt}
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              ))}
            </div>
            {workspace.sample ? (
              <p className="muted small">
                Choose a guided question above to see a sample answer. Start a new document for live
                questions.
              </p>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask(question);
                }}
              >
                <label htmlFor="document-question">Your question</label>
                <textarea
                  id="document-question"
                  required
                  minLength={8}
                  maxLength={600}
                  rows={3}
                  value={question}
                  disabled={busy}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="e.g. What does this say about ending the agreement?"
                />
                <p className="small muted">
                  Asking sends this question, your original document, and reader context to Google
                  Gemini under your review consent.
                </p>
                <button className="button primary" disabled={busy || question.trim().length < 8}>
                  {busy ? 'Reading for an answer…' : 'Ask about this document'}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </form>
            )}
            {busy && <p role="status">Looking for support in the document…</p>}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </section>
          {answer && (
            <div aria-live="polite">
              <section className="answer-card">
                <span className="eyebrow">
                  {workspace.sample ? 'CURATED SAMPLE ANSWER' : 'DOCUMENT-GROUNDED ANSWER'}
                </span>
                <h2>
                  <Quotes size={22} aria-hidden="true" />
                  {answeredQuestion}
                </h2>
                <p>{answer.answer}</p>
                <p className="small muted">
                  Check the source and verify interpretations with a qualified lawyer.
                </p>
              </section>
              <FindingList key={answeredQuestion} analysis={answer} onSelect={setSelected} />
              <section className="uncertainty">
                <h2>What the document cannot answer</h2>
                <ul>
                  {answer.missingInformation.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3>Useful next steps</h3>
                <ul>
                  {answer.nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
        <SourcePanel document={workspace.document} selected={selected} onSelect={setSelected} />
      </div>
    </>
  );
}
