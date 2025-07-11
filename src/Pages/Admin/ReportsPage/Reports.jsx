import React from 'react';
import ReportsFilterSection from '../../../components/Admin/ReportsAndAnalytics/ReportsFilterSection';
import ReportsQuickAnalytics from '../../../components/Admin/ReportsAndAnalytics/ReportsQuickAnalytics';
import ReportsGrid from '../../../components/Admin/ReportsAndAnalytics/ReportsGrid';
import RecentReports from '../../../components/Admin/ReportsAndAnalytics/RecentReports';
import './Reports.css';

const Reports = () => {
  const handleApplyFilters = (filters) => {
    console.log('Filters applied:', filters);
    alert('Filters applied successfully!');
  };

  const handleResetFilters = () => {
    console.log('Filters reset');
    alert('Filters reset!');
  };

  const handleViewReport = (reportName) => {
    console.log('Viewing report:', reportName);
    alert(`Opening ${reportName}...`);
  };

  const handleExportReport = (reportName) => {
    console.log('Report exported:', reportName);
    alert('Report exported successfully!');
  };

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-overview">
        {/* Dashboard Header */}
        <div className="report-dashboard-header">
          <div className="report-header-content">
            <div className="report-header-text">
              <h1 className="report-dashboard-title">Reports & Analytics</h1>
              <p className="report-dashboard-subtitle">Comprehensive curriculum tracking insights and reporting</p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <ReportsFilterSection
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Quick Analytics */}
        <ReportsQuickAnalytics />

        {/* Reports Grid */}
        <ReportsGrid 
          onViewReport={handleViewReport}
          onExportReport={handleExportReport}
        />

        {/* Recent Reports */}
        <RecentReports />
      </div>
    </div>
  );
};

export default Reports;