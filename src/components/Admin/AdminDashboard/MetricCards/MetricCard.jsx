
import React from 'react';

// Enhanced MetricCard component - reusable across different contexts
const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color, 
  borderColor,
  onClick // Added for potential interactivity
}) => {
  const getTrendIcon = (type) => {
    switch (type) {
      case 'increase':
        return 'fas fa-arrow-up';
      case 'decrease':
        return 'fas fa-arrow-down';
      case 'warning': 
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      case 'success':
        return 'fas fa-check-circle';
      case 'clock':
        return 'fas fa-clock';
      case 'times':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const getTrendClass = (type) => {
    switch (type) {
      case 'increase':
      case 'success':
        return 'trend-positive';
      case 'decrease':
      case 'warning':
        return 'trend-warning';
      case 'info':
        return 'trend-info';
      case 'clock':
        return 'trend-pending';
      case 'times':
        return 'trend-danger';
      default:
        return 'trend-neutral';
    }
  };

  return (
    <div 
      className={`metric-card ${borderColor}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="metric-content">
        <div className="metric-text">
          <div className="metric-label">{title}</div>
          <div className="metric-value">{value}</div>
          {trend && (
            <div className={`metric-trend ${getTrendClass(trend.type)}`}>
              <i className={getTrendIcon(trend.type)}></i>
              {trend.value}
            </div>
          )}
        </div>
        <div className={`metric-icon ${color}`}>
          <i className={icon}></i>
        </div>
      </div>
    </div>
  );
};

// CurriculaStats component - uses MetricCard with curricula-specific data
const CurriculaStats = ({ stats, onStatClick }) => {
  const metricsData = [
    {
      id: 'total',
      title: 'Total Curricula',
      value: stats.total,
      trend: null, // No trend for total
      icon: 'fas fa-book',
      color: 'curricula-total',
      borderColor: 'border-curricula-total'
    },
    {
      id: 'approved',
      title: 'Approved',
      value: stats.approved,
      trend: { 
        type: 'success', 
        value: `${Math.round((stats.approved / stats.total) * 100)}% of total` 
      },
      icon: 'fas fa-check-circle',
      color: 'curricula-approved',
      borderColor: 'border-curricula-approved'
    },
    {
      id: 'pending',
      title: 'Pending Review',
      value: stats.pending,
      trend: { 
        type: 'clock', 
        value: stats.pending > 0 ? 'Needs attention' : 'All reviewed' 
      },
      icon: 'fas fa-clock',
      color: 'curricula-pending',
      borderColor: 'border-curricula-pending'
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: stats.rejected,
      trend: { 
        type: 'times', 
        value: stats.rejected > 0 ? 'Review needed' : 'None rejected' 
      },
      icon: 'fas fa-times-circle',
      color: 'curricula-rejected',
      borderColor: 'border-curricula-rejected'
    }
  ];

  return (
    <div className="metrics-cards">
      {metricsData.map(metric => (
        <MetricCard 
          key={metric.id} 
          {...metric}
          onClick={() => onStatClick && onStatClick(metric.id)}
        />
      ))}
    </div>
  );
};

export default MetricCard;
