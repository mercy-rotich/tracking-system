import React from 'react';

const AlertItem = ({ 
  id,
  type, 
  title, 
  description, 
  icon, 
  actionText, 
  onAction, 
  onDismiss 
}) => {
  const getAlertClass = (type) => {
    switch (type) {
      case 'critical':
        return 'alert-critical';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-default';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getActionButtonClass = (type) => {
    switch (type) {
      case 'critical':
        return 'btn-link-red';
      case 'warning':
        return 'btn-link-yellow';
      case 'info':
        return 'btn-link-blue';
      default:
        return 'btn-link';
    }
  };

  return (
    <div className={`alert-item ${getAlertClass(type)}`}>
      <div className="alert-content">
        <div className="alert-icon-container">
          <i className={`${icon} ${getIconColor(type)}`}></i>
        </div>
        <div className="alert-text">
          <h4 className="alert-title">{title}</h4>
          <p className="alert-description">{description}</p>
          <div className="alert-actions">
            <button 
              className={`btn-link ${getActionButtonClass(type)}`}
              onClick={() => onAction(id, actionText)}
            >
              {actionText}
            </button>
            <button 
              className="btn-link-dismiss"
              onClick={() => onDismiss(id)}
              title="Dismiss alert"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;