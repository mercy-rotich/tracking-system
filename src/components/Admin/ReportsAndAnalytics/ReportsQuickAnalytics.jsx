import React from 'react';

const ReportsQuickAnalytics = () => {
  const analyticsData = [
    { number: 127, label: 'Total Curricula', color: 'green' },
    { number: 34, label: 'In Review', color: 'blue' },
    { number: 89, label: 'Approved', color: 'gold' },
    { number: 4, label: 'Rejected', color: 'red' }
  ];

  return (
    <div className="report-quick-analytics">
      <h2 className="report-analytics-title">
        <i className="fas fa-chart-line"></i>
        Quick Analytics Overview
      </h2>
      <div className="report-analytics-grid">
        {analyticsData.map((item, index) => (
          <div key={index} className={`report-analytics-card report-${item.color}`}>
            <div className={`report-analytics-number report-${item.color}`}>{item.number}</div>
            <div className="report-analytics-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsQuickAnalytics;