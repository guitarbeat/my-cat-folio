/**
 * @module useForm
 * @description Unified form handling hook with validation and error management.
 * Standardizes form submission patterns across the app.
 */

import { useState, useCallback } from 'react';

/**
 * Hook for form state management and validation
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules for each field
 * @param {Function} onSubmit - Form submission handler
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, validationRules = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update form field value
   * @param {string} name - Field name
   * @param {*} value - Field value
   */
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // * Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  /**
   * Handle input change
   * @param {Event} event - Input change event
   */
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  /**
   * Handle input blur
   * @param {Event} event - Input blur event
   */
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // * Validate field on blur
    validateField(name, values[name]);
  }, [values]);

  /**
   * Validate a single field
   * @param {string} name - Field name
   * @param {*} value - Field value
   * @returns {string} Error message or empty string
   */
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, values);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }));
        return error;
      }
    }

    // * Clear error if validation passes
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    return '';
  }, [validationRules, values]);

  /**
   * Validate all fields
   * @returns {boolean} Whether all fields are valid
   */
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const fieldError = validateField(name, values[name]);
      if (fieldError) {
        newErrors[name] = fieldError;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!onSubmit) return;

    // * Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // * Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values, { setErrors, setValues });
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred while submitting the form'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, values, validateForm]);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Set form errors (useful for server-side validation)
   * @param {Object} newErrors - Error object
   */
  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  /**
   * Get field props for input components
   * @param {string} name - Field name
   * @param {Object} props - Additional props
   * @returns {Object} Field props
   */
  const getFieldProps = useCallback((name, props = {}) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : '',
    ...props
  }), [values, handleChange, handleBlur, touched, errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    resetForm,
    setFormErrors,
    getFieldProps
  };
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return '';
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return '';
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return '';
  },

  email: (message = 'Please enter a valid email address') => (value) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return message;
    }
    return '';
  },

  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return '';
  },

  min: (min, message) => (value) => {
    if (value && Number(value) < min) {
      return message || `Must be at least ${min}`;
    }
    return '';
  },

  max: (max, message) => (value) => {
    if (value && Number(value) > max) {
      return message || `Must be no more than ${max}`;
    }
    return '';
  }
};
