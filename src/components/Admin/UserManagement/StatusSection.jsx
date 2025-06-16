import React from 'react';


const StatusSection = ({ stats }) => {
  const statsData = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'fas fa-users',
      color: 'green'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: 'fas fa-user-check',
      color: 'blue'
    },
    {
      title: 'Deans',
      value: stats.deans,
      icon: 'fas fa-crown',
      color: 'gold'
    },
    {
      title: 'Pending Access',
      value: stats.pendingAccess,
      icon: 'fas fa-user-clock',
      color: 'red'
    }
  ];

  return (
    <div className="user-management-stats-section">
      {statsData.map((stat, index) => (
        <div key={index} className="user-management-stat-card">
          <div className="user-management-stat-card-header">
            <h3>{stat.title}</h3>
            <div className={`user-management-stat-icon user-management-stat-icon-${stat.color}`}>
              <i className={stat.icon}></i>
            </div>
          </div>
          <div className="user-management-stat-number">{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatusSection;