# Enhanced Error Handling System

This document describes the comprehensive error handling system implemented in the Meow Namester application.

## Overview

The error handling system provides:
- **Centralized error management** with consistent error types and severity levels
- **User-friendly error messages** that don't expose technical details
- **Automatic error logging** with context and debugging information
- **Retry mechanisms** for recoverable errors
- **Error boundaries** to catch React component errors
- **Global error handling** for unhandled errors and promise rejections

## Components

### 1. Error Handler Utility (`src/utils/errorHandler.js`)

The core utility that provides:
- Error type classification (NETWORK, AUTHENTICATION, DATABASE, etc.)
- Severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- User-friendly error messages
- Error logging and reporting
- Retry logic with exponential backoff

### 2. Error Boundary (`src/components/ErrorBoundary/ErrorBoundary.jsx`)

React error boundary that:
- Catches JavaScript errors in component trees
- Provides retry, refresh, and go home options
- Shows detailed error information in development
- Handles multiple retry attempts

### 3. Error Display (`src/components/ErrorDisplay/ErrorDisplay.jsx`)

Reusable component for showing errors to users:
- Severity-based styling and icons
- Expandable error details
- Retry and dismiss actions
- Mobile-responsive design

### 4. useErrorHandler Hook (`src/hooks/useErrorHandler.js`)

Custom React hook that provides:
- Error state management
- Error handling utilities
- Retry operations
- Error execution wrappers

## Usage Examples

### Basic Error Handling

```jsx
import useErrorHandler from '../hooks/useErrorHandler';

function MyComponent() {
  const { handleError, errors, isError } = useErrorHandler();

  const handleApiCall = async () => {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      handleError(error, 'API Call', {
        isRetryable: true,
        affectsUserData: false
      });
    }
  };

  return (
    <div>
      {isError && <ErrorDisplay errors={errors} />}
      {/* Your component content */}
    </div>
  );
}
```

### With Retry Logic

```jsx
const { executeWithErrorHandling, retryOperation } = useErrorHandler();

// Automatic retry on error
const result = await executeWithErrorHandling(
  () => apiCall(),
  { 
    context: 'API Operation',
    retryOnError: true,
    additionalInfo: { userId: 123 }
  }
);

// Manual retry
const handleRetry = () => {
  retryOperation(() => apiCall());
};
```

### Error Boundary Usage

```jsx
import { ErrorBoundary } from '../components';

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <MyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Error Types

| Type | Description | Examples |
|------|-------------|----------|
| `NETWORK` | Network-related errors | Fetch failures, timeouts |
| `AUTHENTICATION` | Auth and permission errors | Invalid tokens, expired sessions |
| `DATABASE` | Database operation errors | Connection failures, query errors |
| `VALIDATION` | Input validation errors | Invalid form data, missing fields |
| `RUNTIME` | JavaScript runtime errors | Type errors, reference errors |
| `UNKNOWN` | Unclassified errors | Generic errors |

## Severity Levels

| Level | Description | User Impact | Action Required |
|-------|-------------|-------------|-----------------|
| `LOW` | Minor issues | Minimal | Usually none |
| `MEDIUM` | Moderate issues | Some disruption | May need user action |
| `HIGH` | Significant issues | Major disruption | User action required |
| `CRITICAL` | Critical failures | App unusable | Immediate attention |

## Configuration

### Environment Variables

```bash
# Enable detailed error logging in development
NODE_ENV=development

# Production error reporting (implement as needed)
VITE_ERROR_REPORTING_URL=your-error-service-url
```

### Custom Error Messages

You can customize user-friendly messages by modifying the `USER_FRIENDLY_MESSAGES` object in `errorHandler.js`.

## Best Practices

### 1. Always Provide Context

```jsx
// Good
handleError(error, 'User Profile Update', {
  isRetryable: true,
  affectsUserData: true
});

// Bad
handleError(error);
```

### 2. Use Appropriate Severity

```jsx
// Critical - app breaking
handleError(error, 'App Initialization', { isCritical: true });

// High - user data affected
handleError(error, 'Save Operation', { affectsUserData: true });

// Medium - recoverable
handleError(error, 'Data Fetch', { isRetryable: true });

// Low - informational
handleError(error, 'Analytics', { isRetryable: false });
```

### 3. Implement Retry Logic

```jsx
// For network operations
const result = await executeWithErrorHandling(
  () => fetchData(),
  { retryOnError: true, maxRetries: 3 }
);
```

### 4. Handle Errors Gracefully

```jsx
// Show user-friendly messages
if (isError) {
  return <ErrorDisplay errors={errors} onRetry={handleRetry} />;
}

// Don't crash the app
try {
  // Risky operation
} catch (error) {
  handleError(error, 'Operation', { isRetryable: true });
  // Fallback behavior
}
```

## Mobile Considerations

The error handling system is designed to work well on mobile devices:

- **Responsive design** for error displays
- **Touch-friendly** buttons and interactions
- **Optimized layouts** for small screens
- **Accessibility features** for mobile users

## Testing

### Unit Tests

```jsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components';

test('ErrorBoundary catches errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### Integration Tests

```jsx
test('Error handling with API calls', async () => {
  const { result } = renderHook(() => useErrorHandler());
  
  // Simulate API error
  await act(async () => {
    try {
      await result.current.executeWithErrorHandling(
        () => Promise.reject(new Error('API Error'))
      );
    } catch (error) {
      // Error should be handled
    }
  });

  expect(result.current.isError).toBe(true);
  expect(result.current.errors).toHaveLength(1);
});
```

## Troubleshooting

### Common Issues

1. **Errors not showing**: Check if `showUserFeedback` is enabled
2. **Retry not working**: Verify `isRetryable` is set to true
3. **Error boundary not catching**: Ensure component is wrapped properly
4. **Mobile display issues**: Check responsive CSS and touch interactions

### Debug Mode

In development, errors show detailed information:
- Error stack traces
- Component hierarchies
- Error context and metadata
- Retry attempt counts

## Future Enhancements

- **Error analytics** and reporting
- **Automatic error recovery** strategies
- **User feedback collection** for errors
- **Performance monitoring** integration
- **A/B testing** for error messages

## Support

For questions or issues with the error handling system:
1. Check this documentation
2. Review error logs in browser console
3. Test with different error scenarios
4. Contact the development team