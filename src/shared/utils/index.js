/**
 * @module shared/utils
 * @description Consolidated exports for all shared utilities.
 * Provides a single import point for all utility functions and classes.
 */

// * Core utilities
export * from './coreUtils';
export * from './validationUtils';
export * from './authUtils';

// * Component utilities
export * from './componentUtils';

// * API utilities
export * from './apiUtils';

// * Re-export commonly used utilities for convenience
export {
    shuffleArray,
    generatePairs,
    buildComparisonsMap,
    validateImageUrl,
    preloadImage,
    getFallbackImageUrl,
    compressImageFile,
    initializeSorterPairs,
    getPreferencesMap,
    computeRating,
    performanceMonitor,
    PerformanceMonitor,
    devLog,
    throttle,
    debounce,
    safeRequestAnimationFrame,
    batchDOMUpdates
} from './coreUtils';

export {
    validateUsername,
    validateCatName,
    validateDescription,
    validateTournamentSize,
    validateRating,
    validateEmail,
    validateForm,
    validateName,
    validateGeneralDescription
} from './validationUtils';

export {
    isUserAdmin,
    hasRole,
    getUserRole,
    getAuthConfig,
    USER_ROLES
} from './authUtils';

export {
    useFormState,
    useLoadingState,
    useErrorState,
    useAsyncOperation,
    useDebounce,
    useThrottle,
    useClickOutside,
    useKeyboardHandler,
    useFocusManager,
    useVisibilityManager,
    useLocalStorage,
    useMediaQuery,
    usePrevious,
    useForceUpdate
} from './componentUtils';

export {
    handleApiResponse,
    apiRequest,
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete,
    createApiClient,
    createSupabaseApiClient,
    createCacheManager,
    createRequestInterceptor,
    createResponseInterceptor,
    createErrorInterceptor
} from './apiUtils';

// * Default export with all utilities
export default {
    // Core utilities
    ...require('./coreUtils'),
    ...require('./validationUtils'),
    ...require('./authUtils'),
    ...require('./componentUtils'),
    ...require('./apiUtils')
};
