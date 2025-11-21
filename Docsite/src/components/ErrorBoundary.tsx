import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-red-900 mb-2">
                    Something went wrong
                  </h1>
                  <p className="text-red-800 mb-4">
                    The documentation site encountered an error. Please try refreshing the page.
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4">
                      <summary className="text-sm font-medium text-red-700 cursor-pointer mb-2">
                        Error Details (Development Only)
                      </summary>
                      <pre className="text-xs bg-red-100 p-3 rounded overflow-auto max-h-64">
                        <div className="font-semibold mb-2">Error:</div>
                        <div className="mb-4">{this.state.error.toString()}</div>
                        {this.state.errorInfo && (
                          <>
                            <div className="font-semibold mb-2">Stack Trace:</div>
                            <div>{this.state.errorInfo.componentStack}</div>
                          </>
                        )}
                      </pre>
                    </details>
                  )}
                  <button
                    onClick={() => {
                      window.location.href = '/FeatureDocsite/';
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Go to Homepage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

