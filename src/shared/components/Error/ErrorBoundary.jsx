import React from 'react';
import PropTypes from 'prop-types';

/**
 * Minimal React error boundary implementation that mirrors the key ergonomics
 * of the previously used `react-error-boundary` helper. It supports
 * reset-driven recovery, an optional `onReset` callback, and an
 * optionally-supplied `resetKeys` array to automatically clear captured
 * errors when external state changes.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    const { onError } = this.props;

    if (typeof onError === 'function') {
      onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps) {
    const { resetKeys } = this.props;
    const { error } = this.state;

    if (!error) {
      return;
    }

    if (Array.isArray(resetKeys) && Array.isArray(prevProps.resetKeys)) {
      const hasChanges =
        resetKeys.length !== prevProps.resetKeys.length ||
        resetKeys.some((key, index) => !Object.is(key, prevProps.resetKeys[index]));

      if (hasChanges) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary() {
    const { onReset } = this.props;

    this.setState({ error: null });

    if (typeof onReset === 'function') {
      onReset();
    }
  }

  renderFallback(error) {
    const { FallbackComponent } = this.props;

    if (typeof FallbackComponent === 'function') {
      return FallbackComponent({
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    if (React.isValidElement(FallbackComponent)) {
      return React.cloneElement(FallbackComponent, {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    return null;
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (error) {
      return this.renderFallback(error);
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  FallbackComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element,
    PropTypes.elementType,
  ]).isRequired,
  children: PropTypes.node,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  resetKeys: PropTypes.arrayOf(PropTypes.any),
};

ErrorBoundary.defaultProps = {
  children: null,
  onError: undefined,
  onReset: undefined,
  resetKeys: undefined,
};

export default ErrorBoundary;
