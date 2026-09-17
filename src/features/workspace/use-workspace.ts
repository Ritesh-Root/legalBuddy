/** Own the current in-memory document, results, and cancellation lifecycle. */
import { useEffect, useRef, useState } from 'react';
import type { Analysis, ReaderContext, WorkspaceTab } from '../../domain/types';
import {
  SAMPLE_ANALYSIS,
  SAMPLE_COMPARISON,
  SAMPLE_CONTEXT,
  SAMPLE_DOCUMENT,
  SAMPLE_REVISED,
} from '../../domain/sample';
import { createSessionClient, type SessionClient } from './session-client';

const EMPTY_CONTEXT: ReaderContext = {
  role: 'Freelancer',
  jurisdiction: '',
  concern: '',
  language: 'English',
};

/** Shared workspace state never uses localStorage, cookies, or a document database. */
export function useWorkspace(): Workspace {
  const [assistance] = useState(() => createSessionClient());
  const [sessionKey, setSessionKey] = useState(0);
  const [tab, setTab] = useState<WorkspaceTab>('review');
  const [document, setDocument] = useState('');
  const [name, setName] = useState('Your document');
  const [context, setContext] = useState<ReaderContext>(EMPTY_CONTEXT);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [comparison, setComparison] = useState<Analysis | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState<Analysis | null>(null);
  const [revised, setRevised] = useState('');
  const [sample, setSample] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
      assistance.clear();
    },
    [assistance],
  );

  function clear(): void {
    assistance.clear();
    setSessionKey((value) => value + 1);
    controller.current?.abort();
    controller.current = null;
    setDocument('');
    setRevised('');
    setAnalysis(null);
    setComparison(null);
    setQuestionText('');
    setQuestionAnswer(null);
    setSample(false);
    setBusy(false);
    setError('');
    setTab('review');
    setName('Your document');
    setContext(EMPTY_CONTEXT);
  }

  function exploreSample(): void {
    clear();
    setDocument(SAMPLE_DOCUMENT);
    setRevised(SAMPLE_REVISED);
    setContext(SAMPLE_CONTEXT);
    setName('Freelance design agreement');
    setAnalysis(SAMPLE_ANALYSIS);
    setComparison(SAMPLE_COMPARISON);
    setSample(true);
  }

  async function review(text: string, title: string, reader: ReaderContext): Promise<void> {
    controller.current?.abort();
    const pending = new AbortController();
    controller.current = pending;
    setBusy(true);
    setError('');
    try {
      const result = await assistance.request(
        {
          action: 'review',
          document: text,
          revised: '',
          question: '',
          context: reader,
          consent: true,
        },
        pending.signal,
      );
      if (pending.signal.aborted) return;
      setDocument(text);
      setName(title);
      setContext(reader);
      setAnalysis(result);
      setQuestionText('');
      setQuestionAnswer(null);
      setTab('review');
    } catch (failure) {
      if (!pending.signal.aborted)
        setError(
          failure instanceof Error ? failure.message : 'The review failed. Please try again.',
        );
    } finally {
      if (controller.current === pending) setBusy(false);
    }
  }

  return {
    assist: assistance.request,
    sessionKey,
    tab,
    setTab,
    document,
    name,
    context,
    analysis,
    comparison,
    setComparison,
    questionText,
    questionAnswer,
    setQuestionResult(question: string, answer: Analysis) {
      setQuestionText(question);
      setQuestionAnswer(answer);
    },
    revised,
    setRevised,
    sample,
    busy,
    error,
    clear,
    exploreSample,
    review,
  };
}

/** One explicit state contract keeps panels aligned with the workspace owner. */
export interface Workspace {
  assist: SessionClient['request'];
  sessionKey: number;
  tab: WorkspaceTab;
  setTab: (tab: WorkspaceTab) => void;
  document: string;
  name: string;
  context: ReaderContext;
  analysis: Analysis | null;
  comparison: Analysis | null;
  setComparison: (analysis: Analysis) => void;
  questionText: string;
  questionAnswer: Analysis | null;
  setQuestionResult: (question: string, answer: Analysis) => void;
  revised: string;
  setRevised: (text: string) => void;
  sample: boolean;
  busy: boolean;
  error: string;
  clear: () => void;
  exploreSample: () => void;
  review: (text: string, title: string, reader: ReaderContext) => Promise<void>;
}
