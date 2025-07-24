import React from 'react';
import './TrackingFilters.css';

const TrackingFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  schools, 
  departments, 
  stages, 
  statuses 
}) => {
  const stageLabels = {
    initiation: 'Initiation',
    school_board: 'School Board',
    dean_committee: 'Dean Committee',
    senate: 'Senate',
    qa_review: 'QA Review',
    vice_chancellor: 'Vice Chancellor',
    cue_review: 'CUE Review',
    site_inspection: 'Site Inspection'
  };

  const statusLabels = {
    under_review: 'Under Review',
    pending_approval: 'Pending Approval',
    on_hold: 'On Hold',
    completed: 'Completed'
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="tracking-filters tracking-card">
      <div className="tracking-card-header">
        <h3 className="tracking-section-title">
          <i className="fas fa-filter tracking-icon"></i>
          Filter Curricula
        </h3>
        {hasActiveFilters && (
          <button
            className="tracking-btn tracking-btn-outline tracking-btn-sm"
            onClick={onClearFilters}
          >
            <i className="fas fa-times"></i>
            Clear Filters
          </button>
        )}
      </div>
      
      <div className="tracking-card-body">
        <div className="tracking-filters-grid">
          {/* Search Input */}
          <div className="tracking-form-group">
            <label className="tracking-form-label">Search</label>
            <div className="tracking-search-container">
              <i className="fas fa-search tracking-search-icon"></i>
              <input
                type="text"
                className="tracking-form-control tracking-search-input"
                placeholder="Search by title or tracking ID..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* School Filter */}
          <div className="tracking-form-group">
            <label className="tracking-form-label">School</label>
            <select
              className="tracking-form-control tracking-select"
              value={filters.school}
              onChange={(e) => onFilterChange('school', e.target.value)}
            >
              <option value="">All Schools</option>
              {schools.map(school => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="tracking-form-group">
            <label className="tracking-form-label">Department</label>
            <select
              className="tracking-form-control tracking-select"
              value={filters.department}
              onChange={(e) => onFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="tracking-form-group">
            <label className="tracking-form-label">Current Stage</label>
            <select
              className="tracking-form-control tracking-select"
              value={filters.stage}
              onChange={(e) => onFilterChange('stage', e.target.value)}
            >
              <option value="">All Stages</option>
              {stages.map(stage => (
                <option key={stage} value={stage}>
                  {stageLabels[stage] || stage}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="tracking-form-group">
            <label className="tracking-form-label">Status</label>
            <select
              className="tracking-form-control tracking-select"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {statusLabels[status] || status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="tracking-active-filters">
            <div className="tracking-flex" style={{ flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--tracking-text-secondary)' }}>
                Active filters:
              </span>
              
              {filters.search && (
                <span className="tracking-badge tracking-badge-primary">
                  Search: {filters.search}
                  <button
                    onClick={() => onFilterChange('search', '')}
                    style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.school && (
                <span className="tracking-badge tracking-badge-secondary">
                  School: {filters.school}
                  <button
                    onClick={() => onFilterChange('school', '')}
                    style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.department && (
                <span className="tracking-badge tracking-badge-neutral">
                  Department: {filters.department}
                  <button
                    onClick={() => onFilterChange('department', '')}
                    style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.stage && (
                <span className="tracking-badge tracking-badge-warning">
                  Stage: {stageLabels[filters.stage] || filters.stage}
                  <button
                    onClick={() => onFilterChange('stage', '')}
                    style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
              
              {filters.status && (
                <span className="tracking-badge tracking-badge-success">
                  Status: {statusLabels[filters.status] || filters.status}
                  <button
                    onClick={() => onFilterChange('status', '')}
                    style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingFilters;