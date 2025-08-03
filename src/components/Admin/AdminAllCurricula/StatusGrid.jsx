// Enhanced StatusGrid.jsx with detailed breakdown

import React, { useState } from 'react';

const StatCard = ({ title, value, icon, className, subtitle, onClick, breakdown }) => (
  <div 
    className={`stat-card ${className} ${onClick ? 'clickable' : ''}`}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="stat-header">
      <div>
        <span className="stat-title">{title}</span>
        {subtitle && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '0.25rem' 
          }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className={`stat-icon ${className}`}>
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <h3 className="stat-value">{value}</h3>
    
    {/* Show breakdown if available */}
    {breakdown && breakdown.length > 0 && (
      <div style={{ 
        marginTop: '0.75rem', 
        paddingTop: '0.75rem', 
        borderTop: '1px solid var(--border-light)' 
      }}>
        {breakdown.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)',
            marginBottom: '0.25rem'
          }}>
            <span>{item.label}:</span>
            <span style={{ fontWeight: '600' }}>{item.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StatsGrid = ({ stats }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate the breakdown for in-progress items
  const inProgressBreakdown = [
    { label: 'Pending Review', value: stats.pending || 0 },
    { label: 'Under Review', value: stats.underReview || 0 },
    { label: 'Draft', value: stats.draft || 0 }
  ].filter(item => item.value > 0); // Only show non-zero items

  const totalInProgress = (stats.pending || 0) + (stats.underReview || 0) + (stats.draft || 0);

  return (
    <div className="stats-grid">
      <StatCard 
        title="Total Curricula" 
        value={stats.total || 0} 
        icon="fa-book" 
        className="total" 
      />
      
      <StatCard 
        title="Approved" 
        value={stats.approved || 0} 
        icon="fa-check-circle" 
        className="approved" 
        subtitle="Active and ready"
      />
      
      {/* Enhanced card showing breakdown */}
      <StatCard 
        title="In Progress" 
        value={totalInProgress} 
        icon="fa-clock" 
        className="pending" 
        subtitle={`Click to ${showBreakdown ? 'hide' : 'show'} breakdown`}
        onClick={() => setShowBreakdown(!showBreakdown)}
        breakdown={showBreakdown ? inProgressBreakdown : null}
      />
      
      <StatCard 
        title="Rejected" 
        value={stats.rejected || 0} 
        icon="fa-times-circle" 
        className="rejected" 
        subtitle="Declined or inactive"
      />

      {/* Optional: Show individual breakdown cards when expanded */}
      {showBreakdown && inProgressBreakdown.length > 0 && (
        <>
          {stats.pending > 0 && (
            <StatCard 
              title="Pending Review" 
              value={stats.pending} 
              icon="fa-hourglass-start" 
              className="pending" 
              subtitle="Awaiting initial review"
            />
          )}
          
          {stats.underReview > 0 && (
            <StatCard 
              title="Under Review" 
              value={stats.underReview} 
              icon="fa-search" 
              className="pending" 
              subtitle="Currently being reviewed"
            />
          )}
          
          {stats.draft > 0 && (
            <StatCard 
              title="Draft" 
              value={stats.draft} 
              icon="fa-edit" 
              className="pending" 
              subtitle="Still in preparation"
            />
          )}
        </>
      )}
    </div>
  );
};

export default StatsGrid;