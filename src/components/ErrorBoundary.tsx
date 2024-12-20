import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  isDarkMode: boolean;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={`error-boundary p-4 ${this.props.isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <h1 className="text-2xl font-bold mb-4">Sorry.. there was an error</h1>
          <p className="mb-4">Something went wrong. Please try refreshing the page or contact support if the problem persists.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 