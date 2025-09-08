import React from 'react';
import './TrackingStats.css';

const TrackingStats = ({ stats, curricula = [] }) => {
  
  const calculateEnhancedStats = () => {
    if (!curricula || curricula.length === 0) {
      return {
        byStage: {},
        bySchool: {},
        byPriority: { high: 0, medium: 0, low: 0 },
        byAcademicLevel: {},
        averageDays: 0,
        overdueCount: 0,
        activeAssignments: new Set(),
        initiatedBy: new Set()
      };
    }

    const byStage = {};
    const bySchool = {};
    const byPriority = { high: 0, medium: 0, low: 0 };
    const byAcademicLevel = {};
    const activeAssignments = new Set();
    const initiatedBy = new Set();
    let totalDays = 0;
    let overdueCount = 0;

    curricula.forEach(curriculum => {
      
      const stage = curriculum.currentStage || 'unknown';
      byStage[stage] = (byStage[stage] || 0) + 1;

      
      const school = curriculum.school || 'Unknown';
      bySchool[school] = (bySchool[school] || 0) + 1;

    
      const priority = curriculum.priority || 'medium';
      byPriority[priority] = (byPriority[priority] || 0) + 1;

      
      const level = curriculum.academicLevel || 'Unknown';
      byAcademicLevel[level] = (byAcademicLevel[level] || 0) + 1;

      // Days calculation
      if (curriculum.totalDays) {
        totalDays += curriculum.totalDays;
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

    return {
      byStage,
      bySchool,
      byPriority,
      byAcademicLevel,
      averageDays: curricula.length > 0 ? Math.round(totalDays / curricula.length) : 0,
      overdueCount,
      activeAssignments,
      initiatedBy
    };
  };

  const enhancedStats = calculateEnhancedStats();

  const statCards = [
    {
      key: 'total',
      title: 'Total Curricula',
      value: stats.total,
      icon: 'fas fa-book',
      color: 'tracking-badge-secondary',
      bgColor: 'rgba(26, 58, 110, 0.1)',
      description: `${Object.keys(enhancedStats.bySchool).length} schools involved`
    },
    {
      key: 'inProgress',
      title: 'In Progress',
      value: stats.inProgress,
      icon: 'fas fa-clock',
      color: 'tracking-badge-primary',
      bgColor: 'rgba(0, 214, 102, 0.1)',
      description: `${enhancedStats.activeAssignments.size} active assignees`
    },
    {
      key: 'onHold',
      title: 'On Hold',
      value: stats.onHold,
      icon: 'fas fa-pause-circle',
      color: 'tracking-badge-warning',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Requiring attention'
    },
    {
      key: 'completed',
      title: 'Completed',
      value: stats.completed,
      icon: 'fas fa-check-circle',
      color: 'tracking-badge-success',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      description: 'Successfully approved'
    },
    {
      key: 'overdue',
      title: 'Overdue',
      value: stats.overdue || enhancedStats.overdueCount,
      icon: 'fas fa-exclamation-triangle',
      color: 'tracking-badge-danger',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      description: 'Past expected completion'
    },
    {
      key: 'averageDays',
      title: 'Average Duration',
      value: enhancedStats.averageDays,
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

  const getPriorityStats = () => {
    return [
      { 
        label: 'High Priority', 
        value: enhancedStats.byPriority.high, 
        color: '#ef4444',
        percentage: stats.total > 0 ? Math.round((enhancedStats.byPriority.high / stats.total) * 100) : 0
      },
      { 
        label: 'Medium Priority', 
        value: enhancedStats.byPriority.medium, 
        color: '#f59e0b',
        percentage: stats.total > 0 ? Math.round((enhancedStats.byPriority.medium / stats.total) * 100) : 0
      },
      { 
        label: 'Low Priority', 
        value: enhancedStats.byPriority.low, 
        color: '#6b7280',
        percentage: stats.total > 0 ? Math.round((enhancedStats.byPriority.low / stats.total) * 100) : 0
      }
    ];
  };

  const getTopSchools = () => {
    return Object.entries(enhancedStats.bySchool)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([school, count]) => ({
        school,
        count,
        percentage: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
      }));
  };

  const getStageDistribution = () => {
    const stageNames = {
      initiation: 'Initiation',
      school_board: 'School Board',
      dean_committee: 'Dean Committee',
      senate: 'Senate',
      qa_review: 'QA Review',
      vice_chancellor: 'Vice Chancellor',
      cue_review: 'CUE Review',
      site_inspection: 'Site Inspection'
    };

    return Object.entries(enhancedStats.byStage)
      .map(([stage, count]) => ({
        stage: stageNames[stage] || stage,
        count,
        percentage: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  return (
    <div className="tracking-stats">
      {/* Main Statistics Cards */}
      <div className="tracking-grid tracking-grid-auto">
        {statCards.map(stat => (
          <div key={stat.key} className="tracking-card tracking-stat-card">
            <div className="tracking-card-body">
              <div className="tracking-flex tracking-items-center tracking-justify-between tracking-mb-4">
                <div className="tracking-stat-info">
                  <h3 className="tracking-stat-title">{stat.title}</h3>
                  <div className="tracking-stat-value">
                    {stat.value}{stat.suffix || ''}
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
              
              {/* Progress indicator for some stats */}
              {stat.key === 'inProgress' && stats.total > 0 && (
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
              
              {stat.key === 'overdue' && (stats.overdue > 0 || enhancedStats.overdueCount > 0) && (
                <div className="tracking-mt-2">
                  <span className="tracking-badge tracking-badge-danger">
                    <i className="fas fa-exclamation-circle"></i>
                    Requires Immediate Attention
                  </span>
                </div>
              )}

              {stat.key === 'completed' && stats.total > 0 && (
                <div className="tracking-progress-container">
                  <div className="tracking-progress-bar">
                    <div 
                      className="tracking-progress-fill" 
                      style={{ 
                        width: `${(stats.completed / stats.total) * 100}%`,
                        background: 'var(--tracking-success)'
                      }}
                    ></div>
                  </div>
                  <div className="tracking-progress-text">
                    <span style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      {Math.round((stats.completed / stats.total) * 100)}% completion rate
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/*  Analytics Section */}
      {curricula.length > 0 && (
        <div className="tracking-grid tracking-grid-auto" style={{ marginTop: '2rem' }}>
          {/* Priority Distribution */}
          <div className="tracking-card">
            <div className="tracking-card-header">
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem' }}>
                <i className="fas fa-flag" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                Priority Distribution
              </h4>
            </div>
            <div className="tracking-card-body">
              {getPriorityStats().map((priority, index) => (
                <div key={index} style={{ marginBottom: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {priority.label}
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: priority.color
                    }}>
                      {priority.value} ({priority.percentage}%)
                    </span>
                  </div>
                  <div className="tracking-progress-bar" style={{ height: '6px' }}>
                    <div 
                      className="tracking-progress-fill" 
                      style={{ 
                        width: `${priority.percentage}%`,
                        background: priority.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Schools */}
          <div className="tracking-card">
            <div className="tracking-card-header">
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem' }}>
                <i className="fas fa-university" style={{ marginRight: '0.5rem', color: 'var(--tracking-secondary)' }}></i>
                Top Schools
              </h4>
            </div>
            <div className="tracking-card-body">
              {getTopSchools().map((school, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < getTopSchools().length - 1 ? '1px solid var(--tracking-border-light)' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {school.school}
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

          {/* Stage Distribution */}
          <div className="tracking-card">
            <div className="tracking-card-header">
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem' }}>
                <i className="fas fa-route" style={{ marginRight: '0.5rem', color: 'var(--tracking-accent)' }}></i>
                Current Stages
              </h4>
            </div>
            <div className="tracking-card-body">
              {getStageDistribution().map((stage, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: index < getStageDistribution().length - 1 ? '1px solid var(--tracking-border-light)' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                      {stage.stage}
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

          {/* Key Metrics */}
          <div className="tracking-card">
            <div className="tracking-card-header">
              <h4 style={{ margin: 0, color: 'var(--tracking-text-primary)', fontSize: '1rem' }}>
                <i className="fas fa-chart-bar" style={{ marginRight: '0.5rem', color: 'var(--tracking-success)' }}></i>
                Key Metrics
              </h4>
            </div>
            <div className="tracking-card-body">
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

                {stats.total > 0 && (
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
                      {Math.round((stats.completed / stats.total) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingStats;