import React from 'react';
import './TrackingStats.css';

const TrackingStats = ({ stats }) => {
  const statCards = [
    {
      key: 'total',
      title: 'Total Curricula',
      value: stats.total,
      icon: 'fas fa-book',
      color: 'tracking-badge-secondary',
      bgColor: 'rgba(26, 58, 110, 0.1)'
    },
    {
      key: 'inProgress',
      title: 'In Progress',
      value: stats.inProgress,
      icon: 'fas fa-clock',
      color: 'tracking-badge-primary',
      bgColor: 'rgba(0, 214, 102, 0.1)'
    },
    {
      key: 'onHold',
      title: 'On Hold',
      value: stats.onHold,
      icon: 'fas fa-pause-circle',
      color: 'tracking-badge-warning',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      key: 'completed',
      title: 'Completed',
      value: stats.completed,
      icon: 'fas fa-check-circle',
      color: 'tracking-badge-success',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      key: 'overdue',
      title: 'Overdue',
      value: stats.overdue,
      icon: 'fas fa-exclamation-triangle',
      color: 'tracking-badge-danger',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div className="tracking-stats">
      <div className="tracking-grid tracking-grid-auto">
        {statCards.map(stat => (
          <div key={stat.key} className="tracking-card tracking-stat-card">
            <div className="tracking-card-body">
              <div className="tracking-flex tracking-items-center tracking-justify-between tracking-mb-4">
                <div className="tracking-stat-info">
                  <h3 className="tracking-stat-title">{stat.title}</h3>
                  <div className="tracking-stat-value">{stat.value}</div>
                </div>
                <div 
                  className="tracking-stat-icon"
                  style={{ 
                    backgroundColor: stat.bgColor,
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className={`${stat.icon}`} style={{ 
                    fontSize: '1.5rem',
                    color: stat.color.includes('secondary') ? '#1a3a6e' :
                           stat.color.includes('primary') ? '#00D666' :
                           stat.color.includes('warning') ? '#f59e0b' :
                           stat.color.includes('success') ? '#10b981' :
                           stat.color.includes('danger') ? '#ef4444' : '#6b7280'
                  }}></i>
                </div>
              </div>
              
              {/* Progress indicator for some stats */}
              {stat.key === 'inProgress' && (
                <div className="tracking-progress-container">
                  <div className="tracking-progress-bar">
                    <div 
                      className="tracking-progress-fill" 
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="tracking-progress-text">
                    <span style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {Math.round((stats.inProgress / stats.total) * 100)}% of total curricula
                    </span>
                  </div>
                </div>
              )}
              
              {stat.key === 'overdue' && stats.overdue > 0 && (
                <div className="tracking-mt-2">
                  <span className="tracking-badge tracking-badge-danger">
                    <i className="fas fa-exclamation-circle"></i>
                    Requires Attention
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingStats;