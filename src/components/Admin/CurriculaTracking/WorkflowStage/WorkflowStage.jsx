import React, { useState } from 'react';
import './WorkflowStage.css';

const WorkflowStage = ({ 
  stage, 
  curriculum, 
  stageData, 
  isActive, 
  stageNumber,
  onStageAction, 
  onViewDetails, 
  onUploadDocument, 
  onAddNotes 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStageStatus = () => {
    if (!stageData) return 'pending';
    return stageData.status || 'pending';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: 'fas fa-check-circle',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          icon: 'fas fa-clock',
          color: '#00D666',
          bgColor: 'rgba(0, 214, 102, 0.1)',
          borderColor: 'rgba(0, 214, 102, 0.3)'
        };
      case 'on_hold':
        return {
          label: 'On Hold',
          icon: 'fas fa-pause-circle',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: 'fas fa-times-circle',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)'
        };
      default:
        return {
          label: 'Pending',
          icon: 'far fa-circle',
          color: '#9ca3af',
          bgColor: 'rgba(107, 114, 128, 0.1)',
          borderColor: 'rgba(107, 114, 128, 0.2)'
        };
    }
  };

  const status = getStageStatus();
  const statusInfo = getStatusInfo(status);
  const canTakeAction = ['under_review', 'on_hold'].includes(status);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysInStage = () => {
    if (!stageData?.startedDate) return null;
    const start = new Date(stageData.startedDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimelineInfo = () => {
    if (status === 'completed' && stageData?.completedDate) {
      return {
        type: 'completed',
        date: formatDate(stageData.completedDate),
        dateTime: formatDateTime(stageData.completedDate),
        days: null
      };
    }
    
    if (status === 'under_review' && stageData?.startedDate) {
      return {
        type: 'in_progress',
        date: formatDate(stageData.startedDate),
        dateTime: formatDateTime(stageData.startedDate),
        days: getDaysInStage()
      };
    }
    
    if (status === 'pending' && stageData?.estimatedStart) {
      return {
        type: 'estimated',
        date: formatDate(stageData.estimatedStart),
        dateTime: formatDateTime(stageData.estimatedStart),
        days: null
      };
    }
    
    return null;
  };

  const timelineInfo = getTimelineInfo();

  const getAssigneeInfo = () => {
    
    const assignee = stageData?.assignedTo || curriculum.currentAssigneeName;
    const assigneeEmail = curriculum.currentAssigneeEmail;
    
    return { assignee, assigneeEmail };
  };

  const { assignee, assigneeEmail } = getAssigneeInfo();

  const truncateText = (text, maxLength = 60) => {
    if (!text) return null;
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div 
      className={`tracking-stage-card ${
        isActive ? 'tracking-stage-card-active' : ''
      } tracking-stage-card-${status}`}
    >
      {/* Stage Header */}
      <div className="tracking-stage-header">
        <div className="tracking-stage-number">
          {status === 'completed' ? (
            <i className="fas fa-check"></i>
          ) : (
            stageNumber
          )}
        </div>
        
        <div className="tracking-stage-info">
          <div className="tracking-stage-title">
            <i className={stage.icon} style={{ color: stage.color }}></i>
            {stage.title}
          </div>
          <div className="tracking-stage-description">
            {stage.description}
          </div>
        </div>
        
        <div 
          className="tracking-stage-status-indicator"
          style={{ 
            backgroundColor: statusInfo.bgColor,
            color: statusInfo.color,
            border: `2px solid ${statusInfo.borderColor}`
          }}
        >
          <i className={statusInfo.icon}></i>
        </div>
      </div>

      {/* Stage Content */}
      <div className="tracking-stage-content">
        {/* Status Badge */}
        <div className="tracking-stage-status-section">
          <div 
            className="tracking-stage-status-badge"
            style={{ 
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
              border: `1px solid ${statusInfo.borderColor}`
            }}
          >
            <i className={statusInfo.icon}></i>
            {statusInfo.label}
          </div>
          
          {isActive && (
            <div className="tracking-stage-current-badge">
              <i className="fas fa-arrow-right"></i>
              Current Stage
            </div>
          )}
        </div>

        {/* Timeline Information */}
        {timelineInfo && (
          <div className="tracking-stage-timeline">
            <div className="tracking-timeline-item">
              <div className="tracking-timeline-label">
                {timelineInfo.type === 'completed' && (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Completed on
                  </>
                )}
                {timelineInfo.type === 'in_progress' && (
                  <>
                    <i className="fas fa-play-circle"></i>
                    Started on
                  </>
                )}
                {timelineInfo.type === 'estimated' && (
                  <>
                    <i className="fas fa-calendar-alt"></i>
                    Estimated start
                  </>
                )}
              </div>
              <div className="tracking-timeline-date" title={timelineInfo.dateTime}>
                {timelineInfo.date}
                {timelineInfo.days && (
                  <span className="tracking-timeline-duration">
                    ({timelineInfo.days} day{timelineInfo.days !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assignee Information */}
        {assignee && (
          <div className="tracking-stage-assignee">
            <div className="tracking-assignee-label">
              <i className="fas fa-user"></i>
              Assigned to
            </div>
            <div className="tracking-assignee-name" title={assigneeEmail}>
              {assignee}
            </div>
            {assigneeEmail && (
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--tracking-text-muted)', 
                marginTop: '0.25rem',
                wordBreak: 'break-all'
              }}>
                {assigneeEmail}
              </div>
            )}
          </div>
        )}

        {/*  Documents Section */}
        {stageData?.documents && stageData.documents.length > 0 && (
          <div className="tracking-stage-documents">
            <div className="tracking-documents-label">
              <i className="fas fa-paperclip"></i>
              {stageData.documents.length} document{stageData.documents.length !== 1 ? 's' : ''}
            </div>
            <div className="tracking-documents-list">
              {stageData.documents.slice(0, 2).map((doc, index) => (
                <div key={index} className="tracking-document-item" title={doc}>
                  <i className="fas fa-file-alt"></i>
                  <span>{truncateText(doc, 25)}</span>
                </div>
              ))}
              {stageData.documents.length > 2 && (
                <div className="tracking-document-item tracking-document-more">
                  <i className="fas fa-ellipsis-h"></i>
                  <span>+{stageData.documents.length - 2} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/*  Notes/Feedback Preview */}
        {(stageData?.notes || stageData?.feedback || curriculum.initialNotes) && (
          <div className="tracking-stage-notes-preview">
            <div className="tracking-notes-label">
              <i className="fas fa-sticky-note"></i>
              {stageData?.feedback ? 'Feedback' : 'Notes'}
            </div>
            <div className="tracking-notes-content">
              {truncateText(
                stageData?.feedback || stageData?.notes || curriculum.initialNotes,
                80
              )}
            </div>
            {(stageData?.feedback || stageData?.notes) && curriculum.initialNotes && (
              <div style={{ 
                fontSize: '0.6875rem', 
                color: 'var(--tracking-text-muted)', 
                marginTop: '0.25rem',
                borderTop: '1px solid var(--tracking-border-light)',
                paddingTop: '0.25rem'
              }}>
                <strong>Initial:</strong> {truncateText(curriculum.initialNotes, 40)}
              </div>
            )}
          </div>
        )}

        {/* Additional Curriculum Information for Current Stage */}
        {isActive && (
          <div style={{ 
            gridColumn: '1 / -1',
            marginTop: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(0, 214, 102, 0.05)',
            border: '1px solid rgba(0, 214, 102, 0.1)',
            borderRadius: '6px',
            fontSize: '0.75rem'
          }}>
            <div className="tracking-curriculum-quick-info">
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Initiated by:</strong> {curriculum.initiatedByName}
                {curriculum.initiatedByEmail && (
                  <div style={{ color: 'var(--tracking-text-muted)', marginLeft: '0.5rem', fontSize: '0.6875rem' }}>
                    📧 {curriculum.initiatedByEmail}
                  </div>
                )}
              </div>
              
              {curriculum.proposedCurriculumCode && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Code:</strong> {curriculum.proposedCurriculumCode}
                </div>
              )}
              
              {curriculum.proposedDurationSemesters && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Duration:</strong> {curriculum.proposedDurationSemesters} semesters
                </div>
              )}
              
              {curriculum.priority && (
                <div>
                  <strong>Priority:</strong> 
                  <span style={{ 
                    color: curriculum.priority === 'high' ? 'var(--tracking-danger)' :
                           curriculum.priority === 'medium' ? 'var(--tracking-warning)' :
                           'var(--tracking-text-muted)',
                    marginLeft: '0.25rem',
                    fontWeight: '600'
                  }}>
                    {curriculum.priority.charAt(0).toUpperCase() + curriculum.priority.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="tracking-stage-actions">
        {/* Primary Actions */}
        {canTakeAction && (
          <div className="tracking-stage-primary-actions">
            <button
              className="tracking-stage-action-btn tracking-action-approve"
              onClick={() => onStageAction(curriculum.id, stage.key, 'approve')}
              title="Approve this stage"
            >
              <i className="fas fa-check"></i>
              Approve
            </button>
            
            <button
              className="tracking-stage-action-btn tracking-action-hold"
              onClick={() => onStageAction(curriculum.id, stage.key, 'hold')}
              title="Put this stage on hold"
            >
              <i className="fas fa-pause"></i>
              Hold
            </button>
            
            <button
              className="tracking-stage-action-btn tracking-action-reject"
              onClick={() => onStageAction(curriculum.id, stage.key, 'reject')}
              title="Reject this stage"
            >
              <i className="fas fa-times"></i>
              Reject
            </button>
          </div>
        )}

        {/* Secondary Actions */}
        <div className="tracking-stage-secondary-actions">
          <button
            className="tracking-stage-action-btn tracking-action-secondary"
            onClick={() => onViewDetails(curriculum, stage.key)}
            title="View detailed information"
          >
            <i className="fas fa-eye"></i>
            View Details
          </button>
          
          <button
            className="tracking-stage-action-btn tracking-action-secondary"
            onClick={() => onUploadDocument(curriculum, stage.key)}
            title="Upload documents"
          >
            <i className="fas fa-upload"></i>
            Upload
          </button>
          
          <button
            className="tracking-stage-action-btn tracking-action-secondary"
            onClick={() => onAddNotes(curriculum, stage.key)}
            title="Add notes or feedback"
          >
            <i className="fas fa-sticky-note"></i>
            Notes
          </button>
        </div>

        {/* Resume Action for On Hold */}
        {status === 'on_hold' && (
          <div className="tracking-stage-resume-action">
            <button
              className="tracking-stage-action-btn tracking-action-resume"
              onClick={() => onStageAction(curriculum.id, stage.key, 'resume')}
            >
              <i className="fas fa-play"></i>
              Resume Stage
            </button>
          </div>
        )}

        {/* Show More Details Toggle */}
        {(curriculum.curriculumDescription || curriculum.recentSteps || curriculum.proposedEffectiveDate) && (
          <div style={{ marginTop: '0.5rem' }}>
            <button
              className="tracking-stage-action-btn tracking-action-secondary"
              onClick={() => setShowDetails(!showDetails)}
              style={{ width: '100%', fontSize: '0.75rem' }}
            >
              <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i>
              {showDetails ? 'Hide' : 'Show'} Additional Details
            </button>
          </div>
        )}

        {/* Additional Details Section */}
        {showDetails && (
          <div style={{ 
            marginTop: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'var(--tracking-bg-secondary)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            lineHeight: '1.4'
          }}>
            {curriculum.curriculumDescription && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                  <i className="fas fa-file-text" style={{ marginRight: '0.25rem' }}></i>
                  Description:
                </div>
                <div style={{ color: 'var(--tracking-text-secondary)' }}>
                  {truncateText(curriculum.curriculumDescription, 150)}
                </div>
              </div>
            )}

            {curriculum.recentSteps && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                  <i className="fas fa-history" style={{ marginRight: '0.25rem' }}></i>
                  Recent Steps:
                </div>
                <div style={{ color: 'var(--tracking-text-secondary)' }}>
                  {truncateText(curriculum.recentSteps, 150)}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {curriculum.proposedEffectiveDate && (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                    <i className="fas fa-calendar-check" style={{ marginRight: '0.25rem' }}></i>
                    Effective Date:
                  </div>
                  <div style={{ color: 'var(--tracking-text-secondary)' }}>
                    {formatDate(curriculum.proposedEffectiveDate)}
                  </div>
                </div>
              )}

              {curriculum.proposedExpiryDate && (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                    <i className="fas fa-calendar-times" style={{ marginRight: '0.25rem' }}></i>
                    Expiry Date:
                  </div>
                  <div style={{ color: 'var(--tracking-text-secondary)' }}>
                    {formatDate(curriculum.proposedExpiryDate)}
                  </div>
                </div>
              )}

              {curriculum.expectedCompletionDate && (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                    <i className="fas fa-target" style={{ marginRight: '0.25rem' }}></i>
                    Expected Completion:
                  </div>
                  <div style={{ color: 'var(--tracking-text-secondary)' }}>
                    {formatDate(curriculum.expectedCompletionDate)}
                  </div>
                </div>
              )}

              {curriculum.actualCompletionDate && (
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                    <i className="fas fa-check-circle" style={{ marginRight: '0.25rem' }}></i>
                    Actual Completion:
                  </div>
                  <div style={{ color: 'var(--tracking-success)' }}>
                    {formatDate(curriculum.actualCompletionDate)}
                  </div>
                </div>
              )}
            </div>

            {/* Status Flags */}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--tracking-border)' }}>
              <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.5rem' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '0.25rem' }}></i>
                Status Information:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                {curriculum.isActive && (
                  <span style={{ 
                    padding: '0.125rem 0.375rem', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    color: 'var(--tracking-success)',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: '600'
                  }}>
                    <i className="fas fa-check"></i> Active
                  </span>
                )}
                {curriculum.isCompleted && (
                  <span style={{ 
                    padding: '0.125rem 0.375rem', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    color: 'var(--tracking-success)',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: '600'
                  }}>
                    <i className="fas fa-check-circle"></i> Completed
                  </span>
                )}
                {curriculum.isIdeationStage && (
                  <span style={{ 
                    padding: '0.125rem 0.375rem', 
                    backgroundColor: 'rgba(0, 214, 102, 0.1)', 
                    color: 'var(--tracking-primary)',
                    borderRadius: '4px',
                    fontSize: '0.6875rem',
                    fontWeight: '600'
                  }}>
                    <i className="fas fa-lightbulb"></i> Ideation
                  </span>
                )}
              </div>
            </div>

            {/* Timeline Summary */}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--tracking-border)' }}>
              <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.5rem' }}>
                <i className="fas fa-clock" style={{ marginRight: '0.25rem' }}></i>
                Timeline Summary:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div>
                  <strong>Total Days:</strong> {curriculum.totalDays}
                </div>
                <div>
                  <strong>Days in Stage:</strong> {curriculum.daysInCurrentStage}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Created:</strong> {formatDateTime(curriculum.createdAt)}
                </div>
                {curriculum.updatedAt !== curriculum.createdAt && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Last Updated:</strong> {formatDateTime(curriculum.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowStage;