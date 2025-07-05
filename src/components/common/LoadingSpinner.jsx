import React from 'react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  subtext = null, 
  size = 'large',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl', 
    large: 'text-4xl'
  };

  return (
    <div className={`user-management-loading-container ${className}`}>
      <div className="user-management-loading-spinner">
        <i className={`fas fa-spinner ${sizeClasses[size]}`}></i>
        <div className="user-management-loading-text">{message}</div>
        {subtext && (
          <div className="user-management-loading-subtext">{subtext}</div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;