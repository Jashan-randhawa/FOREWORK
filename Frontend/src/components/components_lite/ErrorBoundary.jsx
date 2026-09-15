import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              An unexpected error occurred while loading this page. You can try refreshing or returning to the homepage.
            </p>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <details className="text-left text-xs bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-32">
                <summary className="font-semibold text-gray-700 cursor-pointer">Error details</summary>
                <pre className="mt-2 text-red-600 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
