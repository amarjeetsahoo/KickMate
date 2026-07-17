import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback UI to render when an error is caught */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component.
 * Catches render errors in child components and displays a user-friendly
 * fallback UI instead of crashing the entire application.
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            padding: '24px',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '3rem' }} aria-hidden="true">⚠️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Something went wrong
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
            An unexpected error occurred. Please try refreshing the page or resetting the view.
          </p>
          <button
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{ padding: '10px 24px', marginTop: '8px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
