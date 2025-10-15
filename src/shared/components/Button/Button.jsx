/**
 * @module Button
 * @description Unified button component system replacing 8+ button variants.
 * Provides consistent styling, accessibility, and behavior across the app.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/**
 * Unified Button component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, danger, ghost)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.type - HTML button type
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.rest - Additional props
 * @returns {JSX.Element} Button component
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) => {
  const buttonClasses = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    loading && styles['btn--loading'],
    disabled && styles['btn--disabled'],
    className
  ].filter(Boolean).join(' ');

  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className={styles.loader} aria-hidden="true">
          <span className={styles.loader__spinner} />
        </span>
      )}
      <span className={loading ? styles['btn__content--loading'] : styles.btn__content}>
        {children}
      </span>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  onClick: PropTypes.func
};

Button.displayName = 'Button';

export default Button;
