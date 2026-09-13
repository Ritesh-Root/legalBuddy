/** A short editorial introduction makes the legal reading task approachable. */
import {
  ArrowDownRightIcon as ArrowDownRight,
  ArrowUpRightIcon as ArrowUpRight,
  CheckIcon as Check,
  QuotesIcon as Quotes,
} from '@phosphor-icons/react';
import type { ReactElement } from 'react';
import type { Workspace } from '../workspace/use-workspace';
import { DocumentEntry } from './document-entry';

/** Show an actual sample clause and its interpretation without claiming live inference. */
export function Welcome({ workspace }: { workspace: Workspace }): ReactElement {
  return (
    <>
      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-line" /> LESS LEGAL JARGON. MORE UNDERSTANDING.
          </span>
          <h1>
            A little clarity.
            <br />
            <em>Before you sign.</em>
          </h1>
          <p>
            Understand your documents, spot what deserves a closer look, and take your next step
            with better questions.
          </p>
          <div className="hero-benefits">
            <span>
              <Check size={15} aria-hidden="true" /> Plain-language explanations
            </span>
            <span>
              <Check size={15} aria-hidden="true" /> Evidence you can trace
            </span>
          </div>
        </div>
        <div className="illustration" aria-label="Illustrative explanation of a contract clause">
          <div className="paper-preview">
            <div className="paper-top">
              <span>THE AGREEMENT</span>
              <span>§ 03</span>
            </div>
            <Quotes size={26} aria-hidden="true" />
            <p>
              All intellectual property rights transfer to the Client <mark>upon creation</mark>…
            </p>
            <div className="paper-rule" />
            <span className="paper-foot">FROM OUR FICTIONAL SAMPLE</span>
          </div>
          <ArrowDownRight
            className="annotation-arrow"
            size={42}
            weight="light"
            aria-hidden="true"
          />
          <div className="annotation">
            <span className="annotation-number">01</span>
            <div>
              <strong>In everyday language</strong>
              <p>
                You could hand over ownership
                <br />
                before you’ve been paid.
              </p>
            </div>
            <ArrowUpRight size={19} aria-hidden="true" />
          </div>
          <span className="illustration-caption">THE FINE PRINT, IN PLAIN SIGHT.</span>
        </div>
      </section>
      <DocumentEntry workspace={workspace} />
      <p className="scope-note">
        A clearer starting point for a conversation with a lawyer. Margin provides information and
        preparation, not legal advice.
      </p>
    </>
  );
}
