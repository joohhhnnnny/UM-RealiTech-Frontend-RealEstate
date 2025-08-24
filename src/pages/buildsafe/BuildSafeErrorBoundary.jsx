import React from 'react';
import { RiErrorWarningLine, RiRefreshLine } from 'react-icons/ri';

class BuildSafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('BuildSafe Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service if needed
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
          <div className="card bg-base-200 shadow-xl max-w-2xl w-full">
            <div className="card-body text-center">
              <div className="flex justify-center mb-4">
                <RiErrorWarningLine className="w-16 h-16 text-error" />
              </div>
              
              <h2 className="card-title justify-center text-error mb-4">
                BuildSafe Encountered an Error
              </h2>
              
              <p className="text-base-content/70 mb-6">
                We apologize for the inconvenience. The BuildSafe module encountered an unexpected error. 
                This might be due to a temporary connection issue with our services.
              </p>

              {/* Error details - only in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-base-300 p-4 rounded-lg mb-6 text-left">
                  <details className="text-sm">
                    <summary className="font-semibold cursor-pointer">
                      Technical Details (Development Mode)
                    </summary>
                    <div className="mt-2 text-xs font-mono">
                      <p className="text-error font-semibold">{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <pre className="whitespace-pre-wrap mt-2 text-base-content/60">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="btn btn-primary"
                  onClick={this.handleRetry}
                  disabled={this.state.retryCount >= 3}
                >
                  <RiRefreshLine className="w-4 h-4 mr-2" />
                  {this.state.retryCount >= 3 ? 'Too Many Retries' : 'Try Again'}
                </button>
                
                <button 
                  className="btn btn-outline"
                  onClick={this.handleReload}
                >
                  <RiRefreshLine className="w-4 h-4 mr-2" />
                  Reload Page
                </button>
                
                <button 
                  className="btn btn-ghost"
                  onClick={() => window.history.back()}
                >
                  Go Back
                </button>
              </div>

              {this.state.retryCount > 0 && (
                <div className="alert alert-info mt-4">
                  <div>
                    <strong>Troubleshooting Tips:</strong>
                    <ul className="text-sm mt-2 text-left">
                      <li>• Check your internet connection</li>
                      <li>• Clear your browser cache and reload</li>
                      <li>• Try accessing BuildSafe again in a few minutes</li>
                      <li>• If the problem persists, contact support</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Render children if no error
    return this.props.children;
  }
}

export default BuildSafeErrorBoundary;
