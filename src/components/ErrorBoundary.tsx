import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application view:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMsg: '' });
  };

  private handleHardReset = () => {
    // Clear local storage completely in case persistence layer got corrupted
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-[#0b1220] rounded-xl border border-red-500/20 shadow-lg min-h-[400px]">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white tracking-tight">View rendering failed</h2>
          <p className="mb-6 max-w-sm text-sm text-gray-400">
            A component crashed within this specific view. The application shell remains active.
          </p>
          <div className="mb-8 rounded-md bg-[#06080e] p-4 text-xs font-mono text-gray-400 text-left w-full max-w-2xl overflow-auto border border-gray-800 h-32">
            {this.state.errorMsg}
          </div>
          <div className="flex gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              <RefreshCw className="h-4 w-4" />
              Reset View
            </button>
            <button
              onClick={this.handleHardReset}
              className="flex items-center gap-2 rounded border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
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
