import React from 'react';

const InteractionHint = ({ show, onDismiss }) => {
  if (!show) return null;

  return (
    <div className="global-interaction-hint">
      <div className="global-interaction-hint-content">
        <div className="global-interaction-hint-text">
          <i className="fas fa-lightbulb"></i>
          <span>💡 Tip: Click on any school card below to view its academic programs</span>
        </div>
        <button 
          className="global-interaction-hint-close"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          title="Dismiss hint"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default InteractionHint;
