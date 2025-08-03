import React, { useState } from 'react';
import MetricCard from './MetricCard';
import './MetricCards.css'

const MetricsCards = ({ 
  curriculumStats = {
    total: 0,
    approved: 0,
    inProgress: 0, 
    overdue: 0,
    breakdown: {
      pending: 0,
      underReview: 0,
      draft: 0
    }
  }, 
  statsLoading = false,
  onRefreshStats
}) => {
  const [showInProgressBreakdown, setShowInProgressBreakdown] = useState(false);

  if (statsLoading) {
    const loadingMetrics = [
      {
        id: 1,
        title: 'Total Curricula',
        value: '...',
        trend: { type: 'info', value: 'Loading...' },
        icon: 'fas fa-book',
        color: 'green',
        borderColor: 'border-green-500'
      },
      {
        id: 2,
        title: 'In Progress',
        value: '...',
        trend: { type: 'info', value: 'Loading...' },
        icon: 'fas fa-clock',
        color: 'yellow',
        borderColor: 'border-yellow-500'
      },
      {
        id: 3,
        title: 'Active Users',
        value: '89',
        trend: { type: 'info', value: '67 online now' },
        icon: 'fas fa-users',
        color: 'blue',
        borderColor: 'border-blue-500'
      },
      {
        id: 4,
        title: 'System Health',
        value: '98.5%',
        trend: { type: 'success', value: 'All systems operational' },
        icon: 'fas fa-heartbeat',
        color: 'purple',
        borderColor: 'border-purple-500'
      }
    ];

    return (
      <div className="metrics-cards">
        {loadingMetrics.map(metric => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>
    );
  }

  
  const approvalRate = curriculumStats.total > 0 
    ? Math.round((curriculumStats.approved / curriculumStats.total) * 100) 
    : 0;

  const overdueCount = curriculumStats.overdue || 0;
  const monthlyIncrease = Math.round(curriculumStats.total * 0.08);

  //  breakdown for in-progress items
  const inProgressBreakdown = curriculumStats.breakdown ? [
    `${curriculumStats.breakdown.pending || 0} pending`,
    `${curriculumStats.breakdown.underReview || 0} under review`, 
    `${curriculumStats.breakdown.draft || 0} draft`
  ].filter(item => !item.startsWith('0 ')).join(', ') : '';

  const metrics = [
    {
      id: 1,
      title: 'Total Curricula',
      value: curriculumStats.total.toLocaleString(),
      trend: { 
        type: 'increase', 
        value: `+${monthlyIncrease} this month` 
      },
      icon: 'fas fa-book',
      color: 'green',
      borderColor: 'border-green-500'
    },
    {
      id: 2,
      title: 'In Progress',
      value: curriculumStats.inProgress.toString(),
      trend: { 
        type: curriculumStats.inProgress > 10 ? 'warning' : 'info', 
        value: showInProgressBreakdown && inProgressBreakdown 
          ? inProgressBreakdown 
          : `Click to ${showInProgressBreakdown ? 'hide' : 'show'} breakdown`
      },
      icon: 'fas fa-clock',
      color: 'yellow',
      borderColor: 'border-yellow-500',
      onClick: () => setShowInProgressBreakdown(!showInProgressBreakdown)
    },
    {
      id: 3,
      title: 'Approval Rate',
      value: `${approvalRate}%`,
      trend: { 
        type: approvalRate > 70 ? 'success' : 'warning', 
        value: `${curriculumStats.approved} approved`
      },
      icon: 'fas fa-check-circle',
      color: approvalRate > 70 ? 'green' : 'yellow',
      borderColor: approvalRate > 70 ? 'border-green-500' : 'border-yellow-500'
    },
    {
      id: 4,
      title: overdueCount > 0 ? 'Overdue Items' : 'System Health',
      value: overdueCount > 0 ? overdueCount.toString() : '98.5%',
      trend: { 
        type: overdueCount > 0 ? 'warning' : 'success', 
        value: overdueCount > 0 ? 'Need attention' : 'All systems operational' 
      },
      icon: overdueCount > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-heartbeat',
      color: overdueCount > 0 ? 'yellow' : 'purple',
      borderColor: overdueCount > 0 ? 'border-yellow-500' : 'border-purple-500'
    }
  ];

  return (
    <>
      <div className="metrics-cards">
        {metrics.map(metric => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>
      
      {/*breakdown cards when expanded */}
      {showInProgressBreakdown && curriculumStats.breakdown && (
        <div className="metrics-cards" style={{ marginTop: '1rem' }}>
          {curriculumStats.breakdown.pending > 0 && (
            <div className="metric-card border-yellow-500">
              <div className="metric-content">
                <div className="metric-text">
                  <div className="metric-label">Pending Review</div>
                  <div className="metric-value" style={{ fontSize: '1.5rem' }}>
                    {curriculumStats.breakdown.pending}
                  </div>
                  <div className="metric-trend trend-pending">
                    <i className="fas fa-hourglass-start"></i>
                    Awaiting initial review
                  </div>
                </div>
                <div className="metric-icon yellow">
                  <i className="fas fa-hourglass-start"></i>
                </div>
              </div>
            </div>
          )}
          
          {curriculumStats.breakdown.underReview > 0 && (
            <div className="metric-card border-blue-500">
              <div className="metric-content">
                <div className="metric-text">
                  <div className="metric-label">Under Review</div>
                  <div className="metric-value" style={{ fontSize: '1.5rem' }}>
                    {curriculumStats.breakdown.underReview}
                  </div>
                  <div className="metric-trend trend-info">
                    <i className="fas fa-search"></i>
                    Currently being reviewed
                  </div>
                </div>
                <div className="metric-icon blue">
                  <i className="fas fa-search"></i>
                </div>
              </div>
            </div>
          )}
          
          {curriculumStats.breakdown.draft > 0 && (
            <div className="metric-card border-purple-500">
              <div className="metric-content">
                <div className="metric-text">
                  <div className="metric-label">Draft</div>
                  <div className="metric-value" style={{ fontSize: '1.5rem' }}>
                    {curriculumStats.breakdown.draft}
                  </div>
                  <div className="metric-trend trend-neutral">
                    <i className="fas fa-edit"></i>
                    Still in preparation
                  </div>
                </div>
                <div className="metric-icon" style={{ backgroundColor: '#6b7280' }}>
                  <i className="fas fa-edit"></i>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const CurriculaStats = ({ stats, onStatClick }) => {
  const metricsData = [
    {
      id: 'total',
      title: 'Total Curricula',
      value: stats.total,
      trend: null, 
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

export { CurriculaStats };
export default MetricsCards;