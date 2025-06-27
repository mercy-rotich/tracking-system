
import React from 'react';
import './Analytics.css';

const Analytics = () => {
  const summaryStats = [
    { value: '85%', label: 'Approval Rate', icon: 'fas fa-check-circle' },
    { value: '24', label: 'Avg. Review Days', icon: 'fas fa-clock' },
    { value: '95%', label: 'Quality Score', icon: 'fas fa-star' }
  ];

  const chartData = [
    { school: 'Computing & Informatics', count: 45, color: '#00D666' },
    { school: 'Agriculture & Food Science', count: 42, color: '#f0b41c' },
    { school: 'Engineering & Technology', count: 38, color: '#1a3a6e' }
  ];

  return (
    <div className="user-analytics-page">
      <div className="user-analytics-grid">
        {/* Main Chart */}
        <div className="user-chart-container">
          <h3 className="user-chart-title">Curricula by School</h3>
          <div className="user-chart-placeholder">
            <div className="user-chart-content">
              <i className="fas fa-chart-pie" />
              <span>Interactive Pie Chart</span>
              <div className="user-chart-legend">
                {chartData.map((item, index) => (
                  <div key={index} className="user-legend-item">
                    <div 
                      className="user-legend-color" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.school}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="user-stats-summary">
          {summaryStats.map((stat, index) => (
            <div key={index} className="user-summary-card">
              <div className="user-summary-icon">
                <i className={stat.icon} />
              </div>
              <div className="user-summary-content">
                <div className="user-summary-value">{stat.value}</div>
                <div className="user-summary-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="user-chart-container user-full-width">
        <h3 className="user-chart-title">Monthly Trends</h3>
        <div className="user-chart-placeholder">
          <div className="user-chart-content">
            <i className="fas fa-chart-line" />
            <span>Monthly Progress Chart</span>
            <p>Track curriculum submissions, approvals, and reviews over time</p>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="user-analytics-details">
        <div className="user-detail-card">
          <h4>Recent Activity</h4>
          <div className="user-activity-list">
            <div className="user-activity-item">
              <i className="fas fa-plus-circle" />
              <span>5 new curricula submitted this week</span>
            </div>
            <div className="user-activity-item">
              <i className="fas fa-check" />
              <span>12 curricula approved in the last 7 days</span>
            </div>
            <div className="user-activity-item">
              <i className="fas fa-clock" />
              <span>3 curricula pending review</span>
            </div>
          </div>
        </div>

        <div className="user-detail-card">
          <h4>Top Performing Schools</h4>
          <div className="user-performance-list">
            {chartData.map((school, index) => (
              <div key={index} className="user-performance-item">
                <div className="user-performance-rank">#{index + 1}</div>
                <div className="user-performance-info">
                  <span className="user-performance-name">{school.school}</span>
                  <span className="user-performance-count">{school.count} curricula</span>
                </div>
                <div className="user-performance-bar">
                  <div 
                    className="user-performance-fill"
                    style={{ 
                      width: `${(school.count / Math.max(...chartData.map(s => s.count))) * 100}%`,
                      backgroundColor: school.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;