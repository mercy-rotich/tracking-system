import React from 'react';

const BottleneckItem = ({ 
  id,
  committee, 
  description, 
  severity, 
  icon, 
  action, 
  onSendReminder 
}) => {
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bottleneck-critical';
      case 'warning':
        return 'bottleneck-warning';
      case 'info':
        return 'bottleneck-info';
      default:
        return 'bottleneck-default';
    }
  };

  const getActionButtonClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'btn btn-danger';
      case 'warning':
        return 'btn btn-warning';
      case 'info':
        return 'btn btn-info';
      default:
        return 'btn btn-primary';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'cue':
        return 'Follow Up';
      default:
        return 'Send Reminder';
    }
  };

  return (
    <div className={`bottleneck-item ${getSeverityClass(severity)}`}>
      <div className="bottleneck-content">
        <div className="bottleneck-info">
          <i className={icon}></i>
          <div className="bottleneck-text">
            <div className="committee-name">{committee}</div>
            <div className="committee-description">{description}</div>
          </div>
        </div>
        <button 
          className={getActionButtonClass(severity)}
          onClick={() => onSendReminder(action, id)}
        >
          {getActionText(action)}
        </button>
      </div>
    </div>
  );
};

export default BottleneckItem;