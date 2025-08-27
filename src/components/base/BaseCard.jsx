import React from 'react';
import PropTypes from 'prop-types';
import styles from './BaseCard.module.css';

/**
 * @module BaseCard
 * @description Reusable base card component with consistent styling and behavior.
 * Provides flexible content areas and common card patterns.
 */

const BaseCard = ({
  children,
  title,
  subtitle,
  header,
  footer,
  size = 'medium',
  variant = 'default',
  onClick,
  disabled = false,
  selected = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  ...props
}) => {
  const handleClick = (event) => {
    if (onClick && !disabled) {
      onClick(event);
    }
  };

  const cardClasses = [
    styles.card,
    styles[size],
    styles[variant],
    selected && styles.selected,
    disabled && styles.disabled,
    onClick && !disabled && styles.clickable,
    className
  ].filter(Boolean).join(' ');

  const headerClasses = [styles.header, headerClassName].filter(Boolean).join(' ');
  const contentClasses = [styles.content, contentClassName].filter(Boolean).join(' ');
  const footerClasses = [styles.footer, footerClassName].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      aria-selected={selected}
      {...props}
    >
      {/* * Custom Header */}
      {header && (
        <div className={headerClasses}>
          {header}
        </div>
      )}

      {/* * Default Header with Title/Subtitle */}
      {!header && (title || subtitle) && (
        <div className={headerClasses}>
          {title && (
            <h3 className={styles.title}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* * Content */}
      <div className={contentClasses}>
        {children}
      </div>

      {/* * Footer */}
      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  );
};

BaseCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  header: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated', 'flat']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  footerClassName: PropTypes.string
};

export default BaseCard;
