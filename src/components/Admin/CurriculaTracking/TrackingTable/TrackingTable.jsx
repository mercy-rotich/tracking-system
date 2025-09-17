import React from 'react';
import './TrackingTable.css';

const TrackingTable = ({ 
  curricula, 
  onStageAction, 
  onViewDetails, 
  isLoading,
  onEditTracking,      
  onAssignTracking,    
  onToggleStatus       
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'tracking-badge-success';
      case 'under_review': return 'tracking-badge-primary';
      case 'pending_approval': return 'tracking-badge-warning';
      case 'on_hold': return 'tracking-badge-warning';
      case 'rejected': return 'tracking-badge-danger';
      default: return 'tracking-badge-neutral';
    }
  }

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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getProgress = (curriculum) => {
    const stages = ['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection'];
    const currentIndex = stages.indexOf(curriculum.currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
                    Institution
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-users"></i>
                    People
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
                    <i className="fas fa-calendar"></i>
                    Timeline
                  </div>
                </th>
                <th className="tracking-table-th">
                  <div className="tracking-th-content">
                    <i className="fas fa-file-alt"></i>
                    Details
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
                      <div className="tracking-curriculum-title" title={curriculum.title}>
                        {truncateText(curriculum.title, 40)}
                      </div>
                      <div className="tracking-curriculum-id">
                        <i className="fas fa-hashtag"></i>
                        {curriculum.trackingId}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem' }}>
                        <div>
                          <strong>Code:</strong> {curriculum.proposedCurriculumCode}
                        </div>
                        <div>
                          <strong>Duration:</strong> {curriculum.proposedDurationSemesters} semesters
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Institution Info */}
                  <td className="tracking-table-td">
                    <div className="tracking-school-dept-info">
                      <div className="tracking-school-name">
                        <i className="fas fa-university" style={{ marginRight: '0.25rem', color: 'var(--tracking-secondary)' }}></i>
                        {curriculum.school}
                      </div>
                      <div className="tracking-department-name">
                        <i className="fas fa-building" style={{ marginRight: '0.25rem', color: 'var(--tracking-text-muted)' }}></i>
                        {curriculum.department}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem' }}>
                        <strong>Level:</strong> {curriculum.academicLevel}
                      </div>
                    </div>
                  </td>

                  {/* People Information */}
                  <td className="tracking-table-td">
                    <div className="tracking-people-info">
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: '500', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                          <i className="fas fa-user-plus" style={{ marginRight: '0.25rem', color: 'var(--tracking-primary)' }}></i>
                          Initiated by:
                        </div>
                        <div style={{ color: 'var(--tracking-text-secondary)', marginLeft: '1rem' }}>
                          {curriculum.initiatedByName || 'Not specified'}
                        </div>
                        {curriculum.initiatedByEmail && (
                          <div style={{ color: 'var(--tracking-text-muted)', fontSize: '0.6875rem', marginLeft: '1rem' }}>
                            📧 {curriculum.initiatedByEmail}
                          </div>
                        )}
                      </div>
                      
                      {curriculum.currentAssigneeName && (
                        <div style={{ fontSize: '0.75rem' }}>
                          <div style={{ fontWeight: '500', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                            <i className="fas fa-user-check" style={{ marginRight: '0.25rem', color: 'var(--tracking-warning)' }}></i>
                            Assigned to:
                          </div>
                          <div style={{ color: 'var(--tracking-text-secondary)', marginLeft: '1rem' }}>
                            {curriculum.currentAssigneeName}
                          </div>
                          {curriculum.currentAssigneeEmail && (
                            <div style={{ color: 'var(--tracking-text-muted)', fontSize: '0.6875rem', marginLeft: '1rem' }}>
                              📧 {curriculum.currentAssigneeEmail}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Current Stage */}
                  <td className="tracking-table-td">
                    <div className="tracking-current-stage">
                      <span className="tracking-badge tracking-badge-primary">
                        {getStageName(curriculum.currentStage)}
                      </span>
                      <div className="tracking-stage-duration" style={{ marginTop: '0.25rem' }}>
                        {curriculum.daysInCurrentStage} days in stage
                      </div>
                      {curriculum.currentStageDisplayName && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem' }}>
                          {curriculum.currentStageDisplayName}
                        </div>
                      )}
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
                      <div className="tracking-progress-bar" style={{ height: '6px', marginTop: '0.5rem' }}>
                        <div 
                          className="tracking-progress-fill" 
                          style={{ width: `${getProgress(curriculum)}%` }}
                        ></div>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem', textAlign: 'center' }}>
                        <span className={`tracking-badge tracking-badge-sm ${
                          curriculum.priority === 'high' ? 'tracking-badge-danger' :
                          curriculum.priority === 'medium' ? 'tracking-badge-warning' :
                          'tracking-badge-neutral'
                        }`}>
                          <i className="fas fa-flag"></i>
                          {curriculum.priority?.charAt(0).toUpperCase() + curriculum.priority?.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="tracking-table-td">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span className={`tracking-badge ${getStatusBadge(curriculum.status)}`}>
                        {getStatusLabel(curriculum.status)}
                      </span>
                      {curriculum.statusDisplayName && curriculum.statusDisplayName !== getStatusLabel(curriculum.status) && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--tracking-text-muted)' }}>
                          {curriculum.statusDisplayName}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {curriculum.isActive && (
                          <span className="tracking-badge tracking-badge-sm tracking-badge-success">
                            <i className="fas fa-check"></i>
                            Active
                          </span>
                        )}
                        {curriculum.isCompleted && (
                          <span className="tracking-badge tracking-badge-sm tracking-badge-success">
                            <i className="fas fa-check-circle"></i>
                            Completed
                          </span>
                        )}
                        {curriculum.isIdeationStage && (
                          <span className="tracking-badge tracking-badge-sm tracking-badge-primary">
                            <i className="fas fa-lightbulb"></i>
                            Ideation
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Timeline */}
                  <td className="tracking-table-td">
                    <div className="tracking-timeline-info">
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <i className="fas fa-play" style={{ marginRight: '0.25rem', color: 'var(--tracking-primary)' }}></i>
                        <strong>Created:</strong> {formatDate(curriculum.submittedDate)}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <i className="fas fa-clock" style={{ marginRight: '0.25rem', color: 'var(--tracking-warning)' }}></i>
                        <strong>Updated:</strong> {formatDate(curriculum.lastUpdated)}
                      </div>
                      {curriculum.expectedCompletionDate && (
                        <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <i className="fas fa-flag-checkered" style={{ marginRight: '0.25rem', color: 'var(--tracking-success)' }}></i>
                          <strong>Expected:</strong> {formatDate(curriculum.expectedCompletionDate)}
                        </div>
                      )}
                      {curriculum.actualCompletionDate && (
                        <div style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '0.25rem', color: 'var(--tracking-success)' }}></i>
                          <strong>Completed:</strong> {formatDate(curriculum.actualCompletionDate)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Additional Details */}
                  <td className="tracking-table-td">
                    <div className="tracking-details-info">
                      {curriculum.initialNotes && (
                        <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: '500', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                            <i className="fas fa-sticky-note" style={{ marginRight: '0.25rem', color: 'var(--tracking-accent)' }}></i>
                            Initial Notes:
                          </div>
                          <div style={{ 
                            color: 'var(--tracking-text-secondary)', 
                            fontStyle: 'italic',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--tracking-bg-secondary)',
                            borderRadius: '4px',
                            fontSize: '0.6875rem'
                          }}>
                            {truncateText(curriculum.initialNotes, 60)}
                          </div>
                        </div>
                      )}
                      
                      {curriculum.recentSteps && (
                        <div style={{ fontSize: '0.75rem' }}>
                          <div style={{ fontWeight: '500', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                            <i className="fas fa-history" style={{ marginRight: '0.25rem', color: 'var(--tracking-secondary)' }}></i>
                            Recent Steps:
                          </div>
                          <div style={{ 
                            color: 'var(--tracking-text-secondary)', 
                            fontSize: '0.6875rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.05)',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            borderRadius: '4px'
                          }}>
                            {truncateText(curriculum.recentSteps, 60)}
                          </div>
                        </div>
                      )}

                      {curriculum.proposedEffectiveDate && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--tracking-text-muted)', marginTop: '0.5rem' }}>
                          <strong>Effective:</strong> {formatDate(curriculum.proposedEffectiveDate)}
                        </div>
                      )}
                    </div>
                  </td>

                  {/*  Actions Column */}
                  <td className="tracking-table-td tracking-text-center">
                    <div className="tracking-table-actions tracking-table-row-actions">
                      {/* Primary Action: View Details */}
                      <button
                        className="tracking-btn tracking-btn-outline tracking-btn-sm"
                        onClick={() => onViewDetails(curriculum)}
                        title="View Full Details"
                      >
                        <i className="fas fa-eye"></i>
                        Details
                      </button>
                      
                      {/* Workflow Actions for Active Trackings */}
                      {(['under_review', 'pending_approval'].includes(curriculum.status)) && (
                        <>
                          <button
                            className="tracking-btn tracking-btn-success tracking-btn-sm"
                            onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'approve')}
                            title="Approve Stage"
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          
                          <button
                            className="tracking-btn tracking-btn-warning tracking-btn-sm"
                            onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'hold')}
                            title="Put on Hold"
                          >
                            <i className="fas fa-pause"></i>
                            Hold
                          </button>
                          
                          <button
                            className="tracking-btn tracking-btn-danger tracking-btn-sm"
                            onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'reject')}
                            title="Reject"
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                        </>
                      )}
                      
                      {/* Resume Action for On Hold */}
                      {curriculum.status === 'on_hold' && (
                        <button
                          className="tracking-btn tracking-btn-primary tracking-btn-sm"
                          onClick={() => onStageAction(curriculum.id, curriculum.currentStage, 'resume')}
                          title="Resume"
                        >
                          <i className="fas fa-play"></i>
                          Resume
                        </button>
                      )}

                      {/*  Management Actions */}
                      <div style={{ 
                        marginTop: '0.5rem', 
                        padding: '0.5rem 0', 
                        borderTop: '1px solid var(--tracking-border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        {/* Edit Tracking */}
                        <button
                          className="tracking-btn tracking-btn-outline tracking-btn-sm"
                          onClick={() => onEditTracking && onEditTracking(curriculum)}
                          title="Edit tracking information"
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        >
                          <i className="fas fa-edit"></i>
                          Edit Tracking
                        </button>

                        {/* Assign Tracking */}
                        <button
                          className="tracking-btn tracking-btn-outline tracking-btn-sm"
                          onClick={() => onAssignTracking && onAssignTracking(curriculum)}
                          title="Assign to user"
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        >
                          <i className="fas fa-user-plus"></i>
                          Assign User
                        </button>

                        {/* Toggle Status */}
                        <button
                          className={`tracking-btn tracking-btn-sm ${
                            curriculum.isActive ? 'tracking-btn-warning' : 'tracking-btn-success'
                          }`}
                          onClick={() => onToggleStatus && onToggleStatus(curriculum)}
                          title={curriculum.isActive ? "Deactivate tracking" : "Activate tracking"}
                          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                        >
                          <i className={`fas fa-${curriculum.isActive ? 'pause' : 'play'}`}></i>
                          {curriculum.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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
              Showing {curricula.length} curriculum{curricula.length !== 1 ? 's' : ''} with complete tracking information
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