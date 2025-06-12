import React from 'react';

const StatCard = ({ title, value, icon, className }) => (
  <div className={`stat-card ${className}`}>
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <div className={`stat-icon ${className}`}>
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <h3 className="stat-value">{value}</h3>
  </div>
);

const StatsGrid = ({ stats }) => {
  return (
    <div className="stats-grid">
      <StatCard 
        title="Total Curricula" 
        value={stats.total} 
        icon="fa-book" 
        className="total" 
      />
      <StatCard 
        title="Approved" 
        value={stats.approved} 
        icon="fa-check-circle" 
        className="approved" 
      />
      <StatCard 
        title="Pending Review" 
        value={stats.pending} 
        icon="fa-clock" 
        className="pending" 
      />
      <StatCard 
        title="Rejected" 
        value={stats.rejected} 
        icon="fa-times-circle" 
        className="rejected" 
      />
    </div>
  );
};

export default StatsGrid;