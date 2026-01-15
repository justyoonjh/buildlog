import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-slate-50 rounded-xl m-4 border border-slate-200 dashed">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-xs break-keep">
            일시적인 오류일 수 있습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
          </p>

          <div className="bg-slate-800 text-slate-200 text-xs p-3 rounded mb-6 text-left w-full max-w-sm overflow-auto max-h-32">
            {this.state.error?.toString()}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={16} />
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
