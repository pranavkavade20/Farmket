import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, send to error monitoring (Sentry, etc.)
    console.error('[ErrorBoundary caught error]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="rounded-3xl bg-surface border border-border-subtle p-8 max-w-md w-full shadow-xl flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-danger-muted border border-danger/20 flex items-center justify-center text-danger mb-5 shadow-inner">
              <AlertTriangle className="h-8 w-8 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2 tracking-tight">
              Something went wrong
            </h2>
            <p className="text-sm text-foreground-secondary mb-8 leading-relaxed font-medium">
              We encountered an unexpected issue while loading this section. You can try refreshing the view or return home.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={this.handleReset} variant="outline" className="gap-2 flex-1 rounded-xl">
                <RotateCcw className="h-4 w-4" /> Try again
              </Button>
              <Button onClick={() => (window.location.href = '/')} variant="primary" className="gap-2 flex-1 rounded-xl">
                <Home className="h-4 w-4" /> Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
