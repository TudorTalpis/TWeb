import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="rounded-lg border bg-card p-4 text-left text-xs">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-muted-foreground">{this.state.error.message}</pre>
              </details>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh page
              </Button>
              <Button onClick={this.handleReset}>Go home</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
