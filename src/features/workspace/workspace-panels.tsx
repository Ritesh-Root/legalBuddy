/** Retain visited panels in memory so navigation never discards a reader's work. */
import { lazy, useEffect, useState, type ReactElement } from 'react';
import type { Analysis, WorkspaceTab } from '../../domain/types';
import type { Workspace } from './use-workspace';
import { ReviewPanel } from '../review/review-panel';

const ComparePanel = lazy(() => import('./compare-panel'));
const QuestionPanel = lazy(() => import('./question-panel'));
const BriefPanel = lazy(() => import('./brief-panel'));

/** Lazy-load a panel on its first visit and keep its form/results until workspace reset. */
export function WorkspacePanels({
  workspace,
  analysis,
}: {
  workspace: Workspace;
  analysis: Analysis;
}): ReactElement {
  const [visited, setVisited] = useState<WorkspaceTab[]>(['review']);
  useEffect(() => {
    setVisited((current) =>
      current.includes(workspace.tab) ? current : [...current, workspace.tab],
    );
  }, [workspace.tab]);
  return (
    <>
      <div hidden={workspace.tab !== 'review'}>
        <ReviewPanel workspace={workspace} analysis={analysis} />
      </div>
      {visited.includes('compare') && (
        <div hidden={workspace.tab !== 'compare'}>
          <ComparePanel workspace={workspace} />
        </div>
      )}
      {visited.includes('ask') && (
        <div hidden={workspace.tab !== 'ask'}>
          <QuestionPanel workspace={workspace} />
        </div>
      )}
      {visited.includes('brief') && (
        <div hidden={workspace.tab !== 'brief'}>
          <BriefPanel workspace={workspace} analysis={analysis} />
        </div>
      )}
    </>
  );
}
