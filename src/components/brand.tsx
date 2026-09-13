/** Consistent wordmark and graphic glyphs for the reading workspace. */
import { BookOpenTextIcon as BookOpenText } from '@phosphor-icons/react';
import type { ReactElement } from 'react';

/** The book symbol reinforces the app's role as a reader, not a legal authority. */
export function Brand(): ReactElement {
  return (
    <div className="brand">
      <span className="brand-mark">
        <BookOpenText size={25} weight="bold" aria-hidden="true" />
      </span>
      <span>
        margin<span className="brand-period">.</span>
      </span>
    </div>
  );
}
