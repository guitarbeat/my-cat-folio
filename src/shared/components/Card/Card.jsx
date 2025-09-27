/**
 * @module Card
 * @description Reusable card component with flexible styling options
 */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  shadow = 'medium',
  border = false,
  background = 'solid',
  as: Component = 'div',
  ...props
}) {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    styles[`shadow-${shadow}`],
    border ? styles.bordered : '',
    background !== 'solid' ? styles[`background-${background}`] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={cardClasses} {...props}>
      {children}
    </Component>
  );
}

Card.displayName = 'Card';

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'filled']),
  padding: PropTypes.oneOf(['none', 'small', 'medium', 'large', 'xl']),
  shadow: PropTypes.oneOf(['none', 'small', 'medium', 'large', 'xl']),
  border: PropTypes.bool,
  background: PropTypes.oneOf(['solid', 'glass', 'gradient', 'transparent']),
  as: PropTypes.elementType
};

export default Card;