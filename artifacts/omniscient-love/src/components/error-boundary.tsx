import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/**
 * A safety net around the whole app.
 *
 * If any component throws an error, React would normally unmount everything
 * and leave her staring at a blank white screen. This catches that and shows
 * something calm and human instead.
 *
 * This has to be a class component. Error boundaries are the one thing React
 * hooks still cannot do.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you would send the error to a logging
    // service. For a gift app, the console is plenty.
    console.error('Something broke:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
        <p className="t-title text-[var(--petal)]">Something went wrong.</p>
        <p className="t-body mt-4">
          Not your fault. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="tappable mt-8 rounded-full bg-[var(--candle)] px-7 font-semibold text-[var(--ink)]"
        >
          Reload
        </button>
      </div>
    );
  }
}
