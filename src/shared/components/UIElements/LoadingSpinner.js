import React from 'react';

import './LoadingSpinner.css';

function LoadingSpinner(props) {
  return (
    <div className={`${props.asOverlay && 'loading-spinner__overlay'}`}>
      <div className="lds-dual-ring" />
    </div>
  );
}

export default LoadingSpinner;
