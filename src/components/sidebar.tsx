/** Workspace navigation remains keyboard-accessible on desktop and mobile. */
import {
  ArrowSquareOutIcon as ArrowSquareOut,
  ArrowsLeftRightIcon as ArrowsLeftRight,
  ChatCircleTextIcon as ChatCircleText,
  FileTextIcon as FileText,
  NotePencilIcon as NotePencil,
  PlusIcon as Plus,
  ShieldCheckIcon as ShieldCheck,
} from '@phosphor-icons/react';
import type { ReactElement } from 'react';
import type { Workspace } from '../features/workspace/use-workspace';
import { Brand } from './brand';

const navigation = [
  { id: 'review', label: 'Document review', icon: FileText },
  { id: 'compare', label: 'Compare versions', icon: ArrowsLeftRight },
  { id: 'ask', label: 'Ask a question', icon: ChatCircleText },
  { id: 'brief', label: 'Your lawyer brief', icon: NotePencil },
] as const;

/** Navigation buttons change workspace panels without losing the current document. */
export function Sidebar({ workspace }: { workspace: Workspace }): ReactElement {
  return (
    <aside className="sidebar">
      <button
        className="brand-link"
        aria-label="legalBuddy home"
        onClick={() => workspace.setTab('review')}
      >
        <Brand />
      </button>
      <p className="sidebar-caption">AI for Legal Assistance &amp; Access</p>
      <button className="button new-document" onClick={workspace.clear}>
        <Plus size={17} aria-hidden="true" /> New document
      </button>
      <p className="eyebrow nav-label">YOUR WORKSPACE</p>
      <nav aria-label="Workspace">
        <ul className="navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <button
                aria-current={workspace.tab === id ? 'page' : undefined}
                onClick={() => workspace.setTab(id)}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
                {id === 'brief' && workspace.analysis && (
                  <span className="nav-dot" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-bottom">
        <div className="privacy-note">
          <ShieldCheck size={23} aria-hidden="true" />
          <p>
            <strong>Your words stay yours.</strong>
            <span>No account. No saved documents. Clear your workspace anytime.</span>
          </p>
        </div>
        <a
          className="repo-link"
          href="https://github.com/Ritesh-Root/legalBuddy"
          target="_blank"
          rel="noreferrer"
        >
          Built in the open <ArrowSquareOut size={14} aria-hidden="true" />
        </a>
        <div className="sidebar-footer">
          <span>HACK2SKILL · PROMPTWARS</span>
          <span>V 1.0</span>
        </div>
      </div>
    </aside>
  );
}
