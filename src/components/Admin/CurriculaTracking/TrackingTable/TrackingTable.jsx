import React from 'react';
import './TrackingTable.css';

const TrackingTable = ({ curricula, onStageAction, onViewDetails, isLoading }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'tracking-badge-success';
      case 'under_review': return 'tracking-badge-primary';
      case 'pending_approval': return 'tracking-badge-warning';
      case 'on_hold': return 'tracking-badge-warning';
      case 'rejected': return 'tracking-badge-danger';
      default: return 'tracking-badge-neutral';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'under_review': return 'Under Review';
      case 'pending_approval': return 'Pending Approval';
      case 'on_hold': return 'On Hold';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStageName = (stage) => {
    const stageNames = {
      initiation: 'Initiation',
      school_board: 'School Board',
      dean_committee: 'Dean Committee',
      senate: 'Senate',
      qa_review: 'QA Review',
      vice_chancellor: 'Vice Chancellor',
      cue_review: 'CUE Review',
      site_inspection: 'Site Inspection'
    };
    return stageNames[stage] || stage;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--tracking-priority-high)';
      case 'medium': return 'var(--tracking-priority-medium)';
      case 'low': return 'var(--tracking-priority-low)';
      default: return 'var(--tracking-text-muted)';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getProgress = (curriculum) => {
    const stages = ['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection'];
    const currentIndex = stages.indexOf(curriculum.currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="tracking-table-loading tracking-card">
        <div className="tracking-card-body tracking-text-center tracking-p-8">
          <i className="fas fa-spinner tracking-icon tracking-btn-loading" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
          <p>Loading curriculum data...</p>
        </div>
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="tracking-table-empty tracking-card">
        <div className="tracking-card-body tracking-text-center tracking-p-8">
          <i className="fas fa-table" style={{ fontSize: '3rem', color: 'var(--tracking-text-muted)', marginBottom: '1rem' }}></i>
          <h3>No Curricula Found</h3>
          <p style={{ color: 'var(--tracking-text-secondary)' }}>
            No curricula match your current filters or there are no curricula in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-table-section tracking-mb-8">
      <div className="tracking-table-container">
        <div className="tracking-card-header">
          <h3 className="tracking-section-title">
            <i className="fas fa-table tracking-icon"></i>
            Curriculum Tracking Table
          </h3>
          <div className="tracking-table-actions tracking-header-actions">
            <button className="tracking-btn tracking-btn-outline tracking-btn-sm">
              <i className="fas fa-download"></i>
              Export
            </button>
            <button className="tracking-btn tracking-btn-outline tracking-btn-sm">
              <i className="fas fa-print"></i>
              Print
            </button>
          </div>
        </div>

        <div className="tracking-table-wrapper">
          <table className="tracking-table">
            <thead className="tracking-table-header">
              <tr>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-book"></i>
                    Curriculum
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-university"></i>
                    School & Department
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-route"></i>
                    Current Stage
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-chart-line"></i>
                    Progress
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-info-circle"></i>
                    Status
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-flag"></i>
                    Priority
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-calendar"></i>
                    Timeline
                  </div>
                </th>
                <th className="tracking-table-th tracking-text-center">
                  <div className="tracking-th-content tracking-justify-center">
                    <i className="fas fa-cogs"></i>
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {curricula.map(curriculum => (
                <tr key={curriculum.id} className="tracking-table-row">
                  {/* Curriculum Info */}
                  <td className="tracking-table-td">
                    <div className="tracking-curriculum-info">
                      <div className="tracking-curriculum-title">
                        {curriculum.title}
                      </div>
                      <div className="tracking-curriculum-id">
                        <i className="fas fa-hashtag"></i>
                        {curriculum.trackingId}
                      </div>
                    </div>
                  </td>

                  {/* School & Department */}
                  <td className="tracking-table-td">
                    <div className="tracking-school-dept-info">
                      <div className="tracking-school-name">
                        {curriculum.school}
                      </div>
                      <div className="tracking-department-name">
                        {curriculum.department}
                      </div>
                    </div>
                  </td>

                  {/* Current Stage */}
                  <td className="tracking-table-td">
                    <div className="tracking-current-stage">
                      <span className="tracking-badge tracking-badge-primary">
                        {getStageName(curriculum.currentStage)}
                      </span>
                      <div className="tracking-stage-duration">
                        {curriculum.daysInCurrentStage} days
                      </div>
                    </div>
                  </td>

                  {/* Progress */}
                  <td className="tracking-table-td">
                    <div className="tracking-progress-info">
                      <div className="tracking-progress-header">
                        <span className="tracking-progress-percentage">
                          {Math.round(getProgress(curriculum))}%
                        </span>
                        <span className="tracking-progress-total">
                          {curriculum.totalDays}d total
                        </span>
                      </div>
                      <div className="tracking-progress-bar" style={{ height: '6px' }}>
                        <div 
                          className="tracking-progress-fill" 
                          style={{ width: `${getProgress(curriculum)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="tracking-table-td">
                    <span className={`tracking-badge ${getStatusBadge(curriculum.status)}`}>
                      {getStatusLabel(curriculum.status)}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="tracking-table-td">
                    <div className="tracking-priority-info">
                      <span 
                        className="tracking-priority"
                        style={{ color: getPriorityColor(curriculum.priority) }}
                      >
                        <i className="fas fa-flag"></i>
                        {curriculum.priority.charAt(0).toUpperCase() + curriculum.priority.slice(1)}
                      </span>
                    </div>
                  </td>

                  {/* Timeline */}
                  <td className="tracking-table-td">
                    <div className="tracking-timeline-info">
                      <div className="tracking-timeline-start">
                        <i className="fas fa-play"></i>
                        Started: {formatDate(curriculum.submittedDate)}
                      </div>
                      <div className="tracking-timeline-end">
                        <i className="fas fa-flag-checkered"></i>
                        Est. Complete: {formatDate(curriculum.estimatedCompletion)}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="tracking-table-td tracking-text-center">
                    <div className="tracking-table-actions tracking-table-row-actions">
                      <button
                        className="tracking-btn tracking-btn-outline tracking-btn-sm"
                        onClick={() => onViewDetails(curriculum)}
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      
                      {(['under_review', 'pending_approval'].includes(curriculum.status)) && (
                        <>
                          <button
                            className="tracking-btn tracking-btn-success tracking-btn-sm"
                            onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'approve')}
                            title="Approve Stage"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          
                          <button
                            className="tracking-btn tracking-btn-warning tracking-btn-sm"
                            onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'hold')}
                            title="Put on Hold"
                          >
                            <i className="fas fa-pause"></i>
                          </button>
                          
                          <button
                            className="tracking-btn tracking-btn-danger tracking-btn-sm"
                            onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'reject')}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                      
                      {curriculum.status === 'on_hold' && (
                        <button
                          className="tracking-btn tracking-btn-primary tracking-btn-sm"
                          onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'resume')}
                          title="Resume"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="tracking-card-footer">
          <div className="tracking-table-summary">
            <span className="tracking-table-summary-text">
              Showing {curricula.length} curriculum{curricula.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="tracking-table-pagination">
            <div className="tracking-pagination-controls">
              <button className="tracking-btn tracking-btn-outline tracking-btn-sm" disabled>
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              <span className="tracking-badge tracking-badge-neutral">
                Page 1 of 1
              </span>
              <button className="tracking-btn tracking-btn-outline tracking-btn-sm" disabled>
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingTable;