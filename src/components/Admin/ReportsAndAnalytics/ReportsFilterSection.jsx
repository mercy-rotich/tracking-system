import React, { useState } from 'react';

const ReportsFilterSection = ({ onApplyFilters, onResetFilters }) => {
  const [filters, setFilters] = useState({
    academicYear: '',
    school: '',
    status: '',
    reportType: ''
  });

  const [isApplying, setIsApplying] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsApplying(false);
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      academicYear: '',
      school: '',
      status: '',
      reportType: ''
    });
    onResetFilters();
  };

  return (
    <div className="report-filters-section">
      <h2 className="report-filters-title">
        <i className="fas fa-filter"></i>
        Filter Reports
      </h2>
      <div className="report-filters-grid">
        <div className="report-filter-group">
          <label className="report-filter-label">Academic Year</label>
          <select 
            className="report-filter-select"
            value={filters.academicYear}
            onChange={(e) => handleFilterChange('academicYear', e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2023/2024">2023/2024</option>
            <option value="2022/2023">2022/2023</option>
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">School/Faculty</label>
          <select 
            className="report-filter-select"
            value={filters.school}
            onChange={(e) => handleFilterChange('school', e.target.value)}
          >
            <option value="">All Schools</option>
            <option value="engineering">School of Engineering</option>
            <option value="business">School of Business</option>
            <option value="education">School of Education</option>
            <option value="medicine">School of Medicine</option>
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Status</label>
          <select 
            className="report-filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="review">In Review</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Report Type</label>
          <select 
            className="report-filter-select"
            value={filters.reportType}
            onChange={(e) => handleFilterChange('reportType', e.target.value)}
          >
            <option value="">All Reports</option>
            <option value="summary">Summary Reports</option>
            <option value="detailed">Detailed Analytics</option>
            <option value="progress">Progress Tracking</option>
          </select>
        </div>
      </div>
      <div className="report-filter-actions">
        <button 
          className="report-btn report-btn-primary"
          onClick={handleApplyFilters}
          disabled={isApplying}
        >
          <i className={`fas ${isApplying ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
          {isApplying ? 'Applying...' : 'Apply Filters'}
        </button>
        <button className="report-btn report-btn-outline" onClick={handleResetFilters}>
          <i className="fas fa-undo"></i>
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ReportsFilterSection;