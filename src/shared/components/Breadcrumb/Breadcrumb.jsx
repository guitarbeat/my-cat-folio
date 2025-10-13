import React from 'react';
import PropTypes from 'prop-types';
import './Breadcrumb.css';

function Breadcrumb({ items, separator = '›' }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.id || index} className="breadcrumb__item">
              {!isLast ? (
                <>
                  <a
                    href={item.href || '#'}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.onClick) {
                        item.onClick();
                      }
                    }}
                    className="breadcrumb__link"
                    aria-label={item.ariaLabel || `Go to ${item.label}`}
                  >
                    {item.icon && (
                      <span className="breadcrumb__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </a>
                  <span className="breadcrumb__separator" aria-hidden="true">
                    {separator}
                  </span>
                </>
              ) : (
                <span
                  className="breadcrumb__current"
                  aria-current="page"
                  aria-label={`Current page: ${item.label}`}
                >
                  {item.icon && (
                    <span className="breadcrumb__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumb.displayName = 'Breadcrumb';

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      onClick: PropTypes.func,
      icon: PropTypes.node,
      ariaLabel: PropTypes.string
    })
  ).isRequired,
  separator: PropTypes.string
};

export default Breadcrumb;
