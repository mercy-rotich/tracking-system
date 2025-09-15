import React, { useState } from 'react';
import './TrackingStats.css';

const TrackingStats = ({ stats, curricula = [], currentView, currentDataSource }) => {
  const [expandedSection, setExpandedSection] = useState(null);

 
  const calculateEnhancedStats = () => {
    if (!curricula || curricula.length === 0) {
      return {
        byStage: {},
        bySchool: {},
        byPriority: { high: 0, medium: 0, low: 0 },
        byAcademicLevel: {},
        byDepartment: {},
        averageDays: 0,
        overdueCount: 0,
        activeAssignments: new Set(),
        initiatedBy: new Set(),
        byStatus: {},
        completionRate: 0,
        avgDaysInCurrentStage: 0
      };
    }

    const byStage = {};
    const bySchool = {};
    const byDepartment = {};
    const byPriority = { high: 0, medium: 0, low: 0 };
    const byAcademicLevel = {};
    const byStatus = {};
    const activeAssignments = new Set();
    const initiatedBy = new Set();
    let totalDays = 0;
    let totalDaysInStage = 0;
    let overdueCount = 0;

    curricula.forEach(curriculum => {
      // Stage distribution
      const stage = curriculum.currentStage || 'unknown';
      byStage[stage] = (byStage[stage] || 0) + 1;

      // School distribution
      const school = curriculum.school || 'Unknown';
      bySchool[school] = (bySchool[school] || 0) + 1;

      // Department distribution
      const department = curriculum.department || 'Unknown';
      byDepartment[department] = (byDepartment[department] || 0) + 1;

      // Status distribution
      const status = curriculum.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Priority distribution
      const priority = curriculum.priority || 'medium';
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      // Academic level distribution
      const level = curriculum.academicLevel || 'Unknown';
      byAcademicLevel[level] = (byAcademicLevel[level] || 0) + 1;

      // Days calculation
      if (curriculum.totalDays) {
        totalDays += curriculum.totalDays;
      }

      if (curriculum.daysInCurrentStage) {
        totalDaysInStage += curriculum.daysInCurrentStage;
      }

      // Overdue check
      if (curriculum.expectedCompletionDate && !curriculum.isCompleted) {
        const expected = new Date(curriculum.expectedCompletionDate);
        const now = new Date();
        if (now > expected) {
          overdueCount++;
        }
      }

      // Active assignments
      if (curriculum.currentAssigneeName) {
        activeAssignments.add(curriculum.currentAssigneeName);
      }

      // Initiated by
      if (curriculum.initiatedByName) {
        initiatedBy.add(curriculum.initiatedByName);
      }
    });

    const completedCount = byStatus.completed || 0;
    const totalCount = curricula.length;

    return {
      byStage,
      bySchool,
      byDepartment,
      byPriority,
      byAcademicLevel,
      byStatus,
      averageDays: curricula.length > 0 ? Math.round(totalDays / curricula.length) : 0,
      avgDaysInCurrentStage: curricula.length > 0 ? Math.round(totalDaysInStage / curricula.length) : 0,
      overdueCount,
      activeAssignments,
      initiatedBy,
      completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    };
  };

  const enhancedStats = calculateEnhancedStats();

  
  const statCards = [
    {
      key: 'total',
      title: 'Total Curricula',
      value: stats.total || curricula.length,
      icon: 'fas fa-book',
      color: 'tracking-badge-secondary',
      bgColor: 'rgba(26, 58, 110, 0.1)',
      description: `${Object.keys(enhancedStats.bySchool).length} schools • ${Object.keys(enhancedStats.byDepartment).length} departments`,
      trend: currentView !== 'all' ? `Filtered view: ${currentView.replace('-', ' ')}` : null
    },
    {
      key: 'myInitiated',
      title: 'My Initiated',
      value: stats.myInitiated || 0,
      icon: 'fas fa-user-plus',
      color: 'tracking-badge-primary',
      bgColor: 'rgba(0, 214, 102, 0.1)',
      description: 'Trackings I started',
      visible: currentView === 'all' || currentView === 'my-initiated'
    },
    {
      key: 'myAssigned',
      title: 'My Assigned',
      value: stats.myAssigned || 0,
      icon: 'fas fa-user-check',
      color: 'tracking-badge-warning',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Trackings assigned to me',
      visible: currentView === 'all' || currentView === 'my-assigned'
    },
    {
      key: 'inProgress',
      title: 'In Progress',
      value: stats.inProgress || enhancedStats.byStatus.under_review || 0,
      icon: 'fas fa-clock',
      color: 'tracking-badge-primary',
      bgColor: 'rgba(0, 214, 102, 0.1)',
      description: `${enhancedStats.activeAssignments.size} active assignees`,
      trend: enhancedStats.avgDaysInCurrentStage > 0 ? `Avg ${enhancedStats.avgDaysInCurrentStage}d in stage` : null
    },
    {
      key: 'onHold',
      title: 'On Hold',
      value: stats.onHold || enhancedStats.byStatus.on_hold || 0,
      icon: 'fas fa-pause-circle',
      color: 'tracking-badge-warning',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Requiring attention',
      urgent: (stats.onHold || enhancedStats.byStatus.on_hold || 0) > 0
    },
    {
      key: 'completed',
      title: 'Completed',
      value: stats.completed || enhancedStats.byStatus.completed || 0,
      icon: 'fas fa-check-circle',
      color: 'tracking-badge-success',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      description: 'Successfully approved',
      trend: `${enhancedStats.completionRate}% completion rate`
    },
    {
      key: 'overdue',
      title: 'Overdue',
      value: stats.overdue || enhancedStats.overdueCount,
      icon: 'fas fa-exclamation-triangle',
      color: 'tracking-badge-danger',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      description: 'Past expected completion',
      urgent: (stats.overdue || enhancedStats.overdueCount) > 0
    },
    {
      key: 'averageDays',
      title: 'Average Duration',
      value: stats.averageDays || enhancedStats.averageDays,
      icon: 'fas fa-calendar-day',
      color: 'tracking-badge-neutral',
      bgColor: 'rgba(107, 114, 128, 0.1)',
      description: 'Days in system',
      suffix: 'd'
    }
  ];

  const getStatColor = (colorClass) => {
    switch (colorClass) {
      case 'tracking-badge-secondary': return '#1a3a6e';
      case 'tracking-badge-primary': return '#00D666';
      case 'tracking-badge-warning': return '#f59e0b';
      case 'tracking-badge-success': return '#10b981';
      case 'tracking-badge-danger': return '#ef4444';
      case 'tracking-badge-neutral': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getTopItems = (distribution, limit = 5) => {
    return Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([item, count]) => ({
        item,
        count,
        percentage: curricula.length > 0 ? Math.round((count / curricula.length) * 100) : 0
      }));
  };

  return (
    <div className="tracking-stats">
      

      {/* Main Statistics Cards */}
      <div className="tracking-grid tracking-grid-auto">
        {statCards
          .filter(stat => stat.visible !== false)
          .map(stat => (
          <div key={stat.key} className="tracking-card tracking-stat-card">
            <div className="tracking-card-body">
              <div className="tracking-flex tracking-items-center tracking-justify-between tracking-mb-4">
                <div className="tracking-stat-info">
                  <h3 className="tracking-stat-title">{stat.title}</h3>
                  <div className="tracking-stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                    <span>{stat.value}{stat.suffix || ''}</span>
                    {stat.urgent && (
                      <i className="fas fa-exclamation-circle" style={{ 
                        fontSize: '1rem', 
                        color: 'var(--tracking-danger)',
                        animation: 'tracking-pulse-danger 2s infinite'
                      }}></i>
                    )}
                  </div>
                  {stat.description && (
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--tracking-text-muted)', 
                      marginTop: '0.25rem' 
                    }}>
                      {stat.description}
                    </div>
                  )}
                  {stat.trend && (
                    <div style={{ 
                      fontSize: '0.6875rem', 
                      color: 'var(--tracking-primary)', 
                      marginTop: '0.25rem',
                      fontWeight: '600'
                    }}>
                      {stat.trend}
                    </div>
                  )}
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
                    color: getStatColor(stat.color)
                  }}></i>
                </div>
              </div>
              
              {/*  progress indicators */}
              {stat.key === 'inProgress' && curricula.length > 0 && (
                <div className="tracking-progress-container">
                  <div className="tracking-progress-bar">
                    <div 
                      className="tracking-progress-fill" 
                      style={{ width: `${(stat.value / curricula.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="tracking-progress-text">
                    <span style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {Math.round((stat.value / curricula.length) * 100)}% of total curricula
                    </span>
                  </div>
                </div>
              )}
              
              {stat.key === 'completed' && curricula.length > 0 && (
                <div className="tracking-progress-container">
                  <div className="tracking-progress-bar">
                    <div 
                      className="tracking-progress-fill" 
                      style={{ 
                        width: `${(stat.value / curricula.length) * 100}%`,
                        background: 'var(--tracking-success)'
                      }}
                    ></div>
                  </div>
                  <div className="tracking-progress-text">
                    <span style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {Math.round((stat.value / curricula.length) * 100)}% completion rate
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      {curricula.length > 0 && (
        <div className="tracking-grid tracking-grid-auto" style={{ marginTop: '2rem' }}>
          {/* Stage Distribution */}
          <div className="tracking-card">
            <div className="tracking-card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('stages')}>
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-route" style={{ color: 'var(--tracking-primary)' }}></i>
                Current Stages
                <span className="tracking-badge tracking-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                  {Object.keys(enhancedStats.byStage).length}
                </span>
              </h4>
              <i className={`fas fa-chevron-${expandedSection === 'stages' ? 'up' : 'down'}`} style={{ color: 'var(--tracking-text-muted)' }}></i>
            </div>
            <div className="tracking-card-body" style={{ display: expandedSection === 'stages' ? 'block' : 'none' }}>
              {getTopItems(enhancedStats.byStage).map((stage, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < getTopItems(enhancedStats.byStage).length - 1 ? '1px solid var(--tracking-border-light)' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {stage.item.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {stage.percentage}% of active
                    </div>
                  </div>
                  <span className="tracking-badge tracking-badge-secondary">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* School Distribution */}
          <div className="tracking-card">
            <div className="tracking-card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('schools')}>
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-university" style={{ color: 'var(--tracking-secondary)' }}></i>
                Schools
                <span className="tracking-badge tracking-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                  {Object.keys(enhancedStats.bySchool).length}
                </span>
              </h4>
              <i className={`fas fa-chevron-${expandedSection === 'schools' ? 'up' : 'down'}`} style={{ color: 'var(--tracking-text-muted)' }}></i>
            </div>
            <div className="tracking-card-body" style={{ display: expandedSection === 'schools' ? 'block' : 'none' }}>
              {getTopItems(enhancedStats.bySchool).map((school, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < getTopItems(enhancedStats.bySchool).length - 1 ? '1px solid var(--tracking-border-light)' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {school.item}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {school.percentage}% of total
                    </div>
                  </div>
                  <span className="tracking-badge tracking-badge-primary">
                    {school.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="tracking-card">
            <div className="tracking-card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('priority')}>
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-flag" style={{ color: 'var(--tracking-accent)' }}></i>
                Priority Distribution
              </h4>
              <i className={`fas fa-chevron-${expandedSection === 'priority' ? 'up' : 'down'}`} style={{ color: 'var(--tracking-text-muted)' }}></i>
            </div>
            <div className="tracking-card-body" style={{ display: expandedSection === 'priority' ? 'block' : 'none' }}>
              {Object.entries(enhancedStats.byPriority).map(([priority, count], index) => {
                const percentage = curricula.length > 0 ? Math.round((count / curricula.length) * 100) : 0;
                const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#6b7280';
                
                return (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                        {priority} Priority
                      </span>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600',
                        color: priorityColor
                      }}>
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="tracking-progress-bar" style={{ height: '6px' }}>
                      <div 
                        className="tracking-progress-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          background: priorityColor
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="tracking-card">
            <div className="tracking-card-header" style={{ cursor: 'pointer' }} onClick={() => toggleSection('metrics')}>
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-chart-bar" style={{ color: 'var(--tracking-success)' }}></i>
                Key Metrics
              </h4>
              <i className={`fas fa-chevron-${expandedSection === 'metrics' ? 'up' : 'down'}`} style={{ color: 'var(--tracking-text-muted)' }}></i>
            </div>
            <div className="tracking-card-body" style={{ display: expandedSection === 'metrics' ? 'block' : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    <i className="fas fa-users" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                    Active Assignees
                  </span>
                  <span className="tracking-badge tracking-badge-primary">
                    {enhancedStats.activeAssignments.size}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    <i className="fas fa-user-plus" style={{ marginRight: '0.5rem', color: 'var(--tracking-secondary)' }}></i>
                    Unique Initiators
                  </span>
                  <span className="tracking-badge tracking-badge-secondary">
                    {enhancedStats.initiatedBy.size}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    <i className="fas fa-graduation-cap" style={{ marginRight: '0.5rem', color: 'var(--tracking-accent)' }}></i>
                    Academic Levels
                  </span>
                  <span className="tracking-badge tracking-badge-warning">
                    {Object.keys(enhancedStats.byAcademicLevel).length}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    <i className="fas fa-building" style={{ marginRight: '0.5rem', color: 'var(--tracking-neutral)' }}></i>
                    Departments
                  </span>
                  <span className="tracking-badge tracking-badge-neutral">
                    {Object.keys(enhancedStats.byDepartment).length}
                  </span>
                </div>

                {curricula.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      <i className="fas fa-percentage" style={{ marginRight: '0.5rem', color: 'var(--tracking-success)' }}></i>
                      Success Rate
                    </span>
                    <span className="tracking-badge tracking-badge-success">
                      {enhancedStats.completionRate}%
                    </span>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    <i className="fas fa-clock" style={{ marginRight: '0.5rem', color: 'var(--tracking-info)' }}></i>
                    Avg Days in Stage
                  </span>
                  <span className="tracking-badge tracking-badge-info">
                    {enhancedStats.avgDaysInCurrentStage}d
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Update Indicator */}
      <div className="tracking-update-indicator" style={{
        marginTop: '1rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--tracking-text-muted)',
        padding: '0.5rem',
        backgroundColor: 'var(--tracking-bg-secondary)',
        borderRadius: '4px',
        border: '1px solid var(--tracking-border)'
      }}>
        <i className="fas fa-sync-alt" style={{ marginRight: '0.25rem', color: 'var(--tracking-primary)' }}></i>
        Last updated: {new Date().toLocaleString()} • 
        Data source: <strong>{currentDataSource.replace('-', ' ')}</strong> • 
        {curricula.length} records loaded
      </div>
    </div>
  );
};

export default TrackingStats;