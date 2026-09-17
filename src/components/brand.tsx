/** Hack2skill wordmark plus the legalBuddy product name. */
import type { ReactElement } from 'react';

/** Contest host mark sits above the product so the workspace stays identifiable. */
export function Brand(): ReactElement {
  return (
    <div className="brand">
      <img
        className="brand-logo"
        src="/brand/h2s-logo.svg"
        width={132}
        height={52}
        alt="Hack2skill"
      />
      <span className="brand-product">legalBuddy</span>
    </div>
  );
}
