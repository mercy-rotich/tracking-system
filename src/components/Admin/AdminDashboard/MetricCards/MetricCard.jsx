import React from 'react';

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color, 
  borderColor 
}) => {
  const getTrendIcon = (type) => {
    switch (type) {
      case 'increase':
        return 'fas fa-arrow-up';
      case 'warning': 
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-user-check';
      case 'success':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const getTrendClass = (type) => {
    switch (type) {
      case 'increase':
      case 'success':
        return 'trend-positive';
      case 'warning':
        return 'trend-warning';
      case 'info':
        return 'trend-info';
      default:
        return 'trend-neutral';
    }
  };

  return (
    <div className={`metric-card ${borderColor}`}>
      <div className="metric-content">
        <div className="metric-text">
          <div className="metric-label">{title}</div>
          <div className="metric-value">{value}</div>
          <div className={`metric-trend ${getTrendClass(trend.type)}`}>
            <i className={getTrendIcon(trend.type)}></i>
            {trend.value}
          </div>
        </div>
        <div className={`metric-icon ${color}`}>
          <i className={icon}></i>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;