import * as React from "react";
import { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { recordApplicationDiagnostic } from "../../utils/applicationDiagnostics";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in application view:", error, errorInfo);
    recordApplicationDiagnostic({
      level: "error",
      source: "ErrorBoundary",
      title: "Uncaught error in application view",
      details: error.message,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMsg: "" });
  };

  private handleHardReset = () => {
    // Clear local storage completely in case persistence layer got corrupted
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-elevated rounded-xl border border-status-error/20 shadow-lg min-h-[400px]">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-status-error/20 text-status-error">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-content-primary tracking-tight">
            View rendering failed
          </h2>
          <p className="mb-6 max-w-sm text-sm text-content-secondary">
            A component crashed within this specific view. The application shell
            remains active.
          </p>
          <div className="mb-8 rounded-md bg-surface-canvas p-4 text-xs font-mono text-content-secondary text-left w-full max-w-2xl overflow-auto border border-surface-elevated h-32">
            {this.state.errorMsg}
          </div>
          <div className="flex gap-4">
            <button type="button"
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded bg-brand-indigo px-4 py-2 text-sm font-medium text-content-primary transition-colors hover:bg-brand-indigo"
            >
              <RefreshCw className="h-4 w-4" />
              Reset View
            </button>
            <button type="button"
              onClick={this.handleHardReset}
              className="flex items-center gap-2 rounded border border-status-error/50 bg-status-error/10 px-4 py-2 text-sm font-medium text-status-error transition-colors hover:bg-status-error/20"
            >
              Clear Storage & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
