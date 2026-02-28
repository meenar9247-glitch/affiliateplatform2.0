import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // Log error to service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button 
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details style={styles.details}>
                <summary>Error Details</summary>
                <pre style={styles.pre}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
  },
  content: {
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    maxWidth: '500px',
  },
  title: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '20px',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  button: {
    padding: '12px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  details: {
    marginTop: '20px',
    textAlign: 'left',
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
  },
  pre: {
    fontSize: '12px',
    color: '#666',
    overflow: 'auto',
    maxHeight: '200px',
  },
};

export default ErrorBoundary;
