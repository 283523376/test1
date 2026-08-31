"use client";

import { Component, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Client-side error boundary for interactive widgets. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Alert tone="error" className="my-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Something went wrong.</p>
              <p className="mt-1 text-sm">{this.state.error.message}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => this.setState({ error: null })}
              className="shrink-0"
            >
              Try again
            </Button>
          </div>
        </Alert>
      );
    }
    return this.props.children;
  }
}
