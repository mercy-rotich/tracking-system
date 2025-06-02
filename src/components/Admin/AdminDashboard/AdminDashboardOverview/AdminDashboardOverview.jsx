import React from 'react';
import MetricsCards from '../MetricCards/MetricCards';
import WorkflowBottlenecks from '../WorkflowBottlenecks/WorkflowBottlenecks';
import QuickActions from '../QuickActions/QuickActions';
import RecentActivity from '../RecentActivity/RecentActivity';
import SystemAlerts from '../SystemAlerts/SystemAlerts';
import './AdminDashboardOverview.css';

const AdminDashboardOverview = () => {
  const handleCreateUser = () => {
    // TODO: Implement create user modal functionality
    console.log('Opening create user modal...');
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report...');
  };

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-overview">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <p className="dashboard-subtitle">Complete system overview and management</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCreateUser}
              >
                <i className="fas fa-user-plus"></i>
                Create User
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleExportReport}
              >
                <i className="fas fa-download"></i>
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <MetricsCards />

        {/* Workflow Status and Quick Actions */}
        <div className="workflow-section">
          <WorkflowBottlenecks />
          <QuickActions />
        </div>

        {/* Recent Activity and System Alerts */}
        <div className="activity-section">
          <RecentActivity />
          <SystemAlerts />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;