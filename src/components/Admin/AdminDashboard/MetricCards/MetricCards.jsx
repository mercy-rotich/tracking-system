import React from 'react';
import MetricCard from './MetricCard';
import './MetricCards.css'

const MetricsCards = () => {
  const metrics = [
    {
      id: 1,
      title: 'Total Curricula',
      value: '156',
      trend: { type: 'increase', value: '12% this month' },
      icon: 'fas fa-book',
      color: 'green',
      borderColor: 'border-green-500'
    },
    {
      id: 2,
      title: 'Pending Reviews',
      value: '24',
      trend: { type: 'warning', value: '8 overdue' },
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
      {metrics.map(metric => (
        <MetricCard key={metric.id} {...metric} />
      ))}
    </div>
  );
};

export default MetricsCards;