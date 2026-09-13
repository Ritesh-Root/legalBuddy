/** Preserve an accessible recovery path for unexpected rendering failures. */
import { Component, type ReactNode } from 'react';

/** A failed panel can be recovered by reloading the in-memory workspace. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  override render(): ReactNode {
    if (this.state.failed)
      return (
        <main className="recovery">
          <h1>Let’s start with a fresh page.</h1>
          <p>Something interrupted this workspace. Reloading clears its in-memory documents.</p>
          <button className="button primary" onClick={() => location.reload()}>
            Reload workspace
          </button>
        </main>
      );
    return this.props.children;
  }
}
