/**
 * Input validation utilities for the cat names application
 * Provides consistent validation across all user inputs
 */

/**
 * Validates a username
 * @param {string} username - The username to validate
 * @returns {Object} Validation result with success and error message
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { success: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < 2) {
    return { success: false, error: 'Username must be at least 2 characters long' };
  }

  if (trimmed.length > 50) {
    return { success: false, error: 'Username must be less than 50 characters' };
  }

  // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return { success: false, error: 'Username can only contain letters, numbers, spaces, hyphens, and underscores' };
  }

  return { success: true, value: trimmed };
};

/**
 * Validates a cat name
 * @param {string} name - The cat name to validate
 * @returns {Object} Validation result with success and error message
 */
export const validateCatName = (name) => {
  if (!name || typeof name !== 'string') {
    return { success: false, error: 'Cat name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 1) {
    return { success: false, error: 'Cat name cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { success: false, error: 'Cat name must be less than 100 characters' };
  }

  return { success: true, value: trimmed };
};

/**
 * Validates a description
 * @param {string} description - The description to validate
 * @returns {Object} Validation result with success and error message
 */
export const validateDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { success: false, error: 'Description is required' };
  }

  const trimmed = description.trim();

  if (trimmed.length < 10) {
    return { success: false, error: 'Description must be at least 10 characters long' };
  }

  if (trimmed.length > 500) {
    return { success: false, error: 'Description must be less than 500 characters' };
  }

  return { success: true, value: trimmed };
};

/**
 * Validates tournament size preference
 * @param {number} size - The tournament size to validate
 * @returns {Object} Validation result with success and error message
 */
export const validateTournamentSize = (size) => {
  if (typeof size !== 'number' || isNaN(size)) {
    return { success: false, error: 'Tournament size must be a number' };
  }

  if (size < 2) {
    return { success: false, error: 'Tournament size must be at least 2' };
  }

  if (size > 64) {
    return { success: false, error: 'Tournament size must be 64 or less' };
  }

  // Check if it's a power of 2
  if ((size & (size - 1)) !== 0) {
    return { success: false, error: 'Tournament size must be a power of 2 (2, 4, 8, 16, 32, 64)' };
  }

  return { success: true, value: size };
};

/**
 * Validates a rating value
 * @param {number} rating - The rating to validate
 * @returns {Object} Validation result with success and error message
 */
export const validateRating = (rating) => {
  if (typeof rating !== 'number' || isNaN(rating)) {
    return { success: false, error: 'Rating must be a number' };
  }

  if (rating < 0) {
    return { success: false, error: 'Rating cannot be negative' };
  }

  if (rating > 3000) {
    return { success: false, error: 'Rating cannot exceed 3000' };
  }

  return { success: true, value: rating };
};

/**
 * Validates email format (if needed for future features)
 * @param {string} email - The email to validate
 * @returns {Object} Validation result with success and error message
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return { success: false, error: 'Please enter a valid email address' };
  }

  return { success: true, value: trimmed };
};

/**
 * Generic validation wrapper for form fields
 * @param {Object} validations - Object with field names and validation functions
 * @param {Object} values - Object with field values to validate
 * @returns {Object} Validation result with success and errors
 */
export const validateForm = (validations, values) => {
  const errors = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(validations)) {
    const result = validator(values[field]);
    if (!result.success) {
      errors[field] = result.error;
      isValid = false;
    }
  }

  return {
    success: isValid,
    errors,
    values: isValid ? values : null
  };
};
