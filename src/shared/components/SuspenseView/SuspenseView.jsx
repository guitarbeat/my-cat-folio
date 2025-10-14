import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

export default function SuspenseView({ text, children }) {
  return (
    <Suspense fallback={<div className="loading-placeholder">{text}</div>}>
      {children}
    </Suspense>
  );
}

SuspenseView.propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};
