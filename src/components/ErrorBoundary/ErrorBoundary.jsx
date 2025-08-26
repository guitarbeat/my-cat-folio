/**
 * @module ErrorBoundary
 * @description A React error boundary component that catches JavaScript errors
 * anywhere in the child component tree and displays a fallback UI with
 * enhanced error handling and recovery options.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStandardizedError } from '../../utils/errorHandler';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      standardizedError: null,
      retryCount: 0,
      maxRetries: 3
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Create standardized error object
    const standardizedError = createStandardizedError(error, 'React Component Error', {
      isRetryable: true,
      affectsUserData: false,
      isCritical: false,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo,
      standardizedError
    });

    // Log the error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry() {
    const { retryCount, maxRetries } = this.state;

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1,
        hasError: false,
        error: null,
        errorInfo: null,
        standardizedError: null
      }));
    } else {
      // If max retries reached, reload the page
      window.location.reload();
    }
  }

  handleRefresh() {
    window.location.reload();
  }

  handleGoHome() {
    window.location.href = '/';
  }

  render() {
    const {
      hasError,
      error,
      errorInfo,
      standardizedError,
      retryCount,
      maxRetries
    } = this.state;

    if (hasError) {
      const canRetry = retryCount < maxRetries;
      const errorMessage = standardizedError?.userMessage ||
        "We're sorry, but something unexpected happened. You can try refreshing the page or contact support if the problem persists.";

      return (
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.icon}>⚠️</div>
            <h2 className={styles.title}>Something went wrong</h2>

            <p className={styles.message}>
              {errorMessage}
            </p>

            {canRetry && (
              <p className={styles.retryInfo}>
                Attempt {retryCount + 1} of {maxRetries}
              </p>
            )}

            <div className={styles.actionButtons}>
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className={styles.retryButton}
                >
                  <span className={styles.retryIcon}>↻</span>
                  Try Again
                </button>
              )}

              <button
                onClick={this.handleRefresh}
                className={styles.refreshButton}
              >
                <span className={styles.refreshIcon}>🔄</span>
                Refresh Page
              </button>

              <button
                onClick={this.handleGoHome}
                className={styles.homeButton}
              >
                <span className={styles.homeIcon}>🏠</span>
                Go Home
              </button>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className={styles.errorDetails}>
                <summary>Error Details (Development)</summary>
                <div className={styles.errorContent}>
                  <h4>Error:</h4>
                  <pre>{error.toString()}</pre>

                  {errorInfo && (
                    <>
                      <h4>Component Stack:</h4>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}

                  {standardizedError && (
                    <>
                      <h4>Error Analysis:</h4>
                      <ul>
                        <li><strong>Type:</strong> {standardizedError.errorType}</li>
                        <li><strong>Severity:</strong> {standardizedError.severity}</li>
                        <li><strong>Context:</strong> {standardizedError.context}</li>
                        <li><strong>Retryable:</strong> {standardizedError.isRetryable ? 'Yes' : 'No'}</li>
                        <li><strong>Timestamp:</strong> {standardizedError.timestamp}</li>
                      </ul>
                    </>
                  )}
                </div>
              </details>
            )}

            {/* Contact support information */}
            <div className={styles.supportInfo}>
              <p>
                If this problem persists, please contact support with the following information:
              </p>
              <p className={styles.errorId}>
                Error ID: {standardizedError?.timestamp || Date.now()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.displayName = 'ErrorBoundary';

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

export default ErrorBoundary;
