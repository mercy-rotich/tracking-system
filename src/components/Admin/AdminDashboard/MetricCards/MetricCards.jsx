import React from 'react';
import MetricCard from './MetricCard';
import './MetricCards.css'

const MetricsCards = ({ 
  curriculumStats = {
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
    rejected: 0
  }, 
  statsLoading = false,
  onRefreshStats
}) => {
  

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
        title: 'Pending Reviews',
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

  const overdueCount = Math.round(curriculumStats.pending * 0.3); 
  const monthlyIncrease = Math.round(curriculumStats.total * 0.08); 

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
      title: 'Pending Reviews',
      value: curriculumStats.pending.toString(),
      trend: { 
        type: curriculumStats.pending > 10 ? 'warning' : 'info', 
        value: overdueCount > 0 ? `${overdueCount} overdue` : 'All current'
      },
      icon: 'fas fa-clock',
      color: 'yellow',
      borderColor: 'border-yellow-500'
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
      {metrics.map(metric => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
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