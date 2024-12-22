import { Component, ErrorInfo, ReactNode } from 'react';

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
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={`p-4 ${this.props.isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
          <h1 className="text-2xl font-bold mb-4">Oops, there was an error</h1>
          <p>Something went wrong. Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 