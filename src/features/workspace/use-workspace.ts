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
import { requestAssistance } from './client';

/** Shared workspace state never uses localStorage, cookies, or a document database. */
export function useWorkspace(): Workspace {
  const [sessionKey, setSessionKey] = useState(0);
  const [tab, setTab] = useState<WorkspaceTab>('review');
  const [document, setDocument] = useState('');
  const [name, setName] = useState('Your document');
  const [context, setContext] = useState<ReaderContext>({
    role: 'Freelancer',
    jurisdiction: '',
    concern: '',
  });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [comparison, setComparison] = useState<Analysis | null>(null);
  const [revised, setRevised] = useState('');
  const [sample, setSample] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  function clear(): void {
    setSessionKey((value) => value + 1);
    controller.current?.abort();
    controller.current = null;
    setDocument('');
    setRevised('');
    setAnalysis(null);
    setComparison(null);
    setSample(false);
    setBusy(false);
    setError('');
    setTab('review');
    setName('Your document');
    setContext({ role: 'Freelancer', jurisdiction: '', concern: '' });
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
      const result = await requestAssistance(
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
    sessionKey,
    tab,
    setTab,
    document,
    name,
    context,
    analysis,
    comparison,
    setComparison,
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
  sessionKey: number;
  tab: WorkspaceTab;
  setTab: (tab: WorkspaceTab) => void;
  document: string;
  name: string;
  context: ReaderContext;
  analysis: Analysis | null;
  comparison: Analysis | null;
  setComparison: (analysis: Analysis) => void;
  revised: string;
  setRevised: (text: string) => void;
  sample: boolean;
  busy: boolean;
  error: string;
  clear: () => void;
  exploreSample: () => void;
  review: (text: string, title: string, reader: ReaderContext) => Promise<void>;
}
