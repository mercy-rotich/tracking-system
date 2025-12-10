import React from 'react';

const SchoolCard = ({ 
  school, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  return (
    <div className="admin-school-item">
      <div 
        className={`admin-school-header ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
      >
        <div className="admin-school-info">
          <div className="admin-school-icon">
            <i className={`fas fa-${school.icon || 'university'}`}></i>
          </div>
          <div className="admin-school-details">
            <h3>{school.name}</h3>
            {school.code && (
              <span className="admin-school-code">{school.code}</span>
            )}
            <div className="admin-school-meta">
              {school.stats.programs} Academic levels • {school.stats.departments} departments • {school.stats.total} curricula
            </div>

            <div className="admin-school-interaction-hint">
              <i className="fas fa-mouse-pointer"></i>
              <span>{isExpanded ? 'Click to collapse academic programs' : 'Click to view academic programs'}</span>
            </div>
            
            <div className="admin-school-status-summary">
              {school.stats.statusStats.approved > 0 && (
                <span className="status-mini approved">{school.stats.statusStats.approved} approved</span>
              )}
              {school.stats.statusStats.pending > 0 && (
                <span className="status-mini pending">{school.stats.statusStats.pending} pending</span>
              )}
              {school.stats.statusStats.draft > 0 && (
                <span className="status-mini draft">{school.stats.statusStats.draft} draft</span>
              )}
              {school.stats.statusStats.rejected > 0 && (
                <span className="status-mini rejected">{school.stats.statusStats.rejected} rejected</span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-school-actions">
          <div className="admin-school-stats">
            <span className="admin-stat-badge">{school.stats.total}</span>
          </div>
          
          <div className="admin-school-expand-area">
            <div className="admin-expand-button">
              <span className="admin-expand-text">
                {isExpanded ? 'Hide' : 'View'}
              </span>
              <i className={`fas fa-chevron-down admin-expand-icon ${isExpanded ? 'expanded' : ''}`}></i>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="admin-school-expanded-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default SchoolCard;
