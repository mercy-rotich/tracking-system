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
        days: null
      };
    }
    
    if (status === 'under_review' && stageData?.startedDate) {
      return {
        type: 'in_progress',
        date: formatDate(stageData.startedDate),
        days: getDaysInStage()
      };
    }
    
    if (status === 'pending' && stageData?.estimatedStart) {
      return {
        type: 'estimated',
        date: formatDate(stageData.estimatedStart),
        days: null
      };
    }
    
    return null;
  };

  const timelineInfo = getTimelineInfo();

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
              <div className="tracking-timeline-date">
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
        {stageData?.assignedTo && (
          <div className="tracking-stage-assignee">
            <div className="tracking-assignee-label">
              <i className="fas fa-user"></i>
              Assigned to
            </div>
            <div className="tracking-assignee-name">
              {stageData.assignedTo}
            </div>
          </div>
        )}

        {/* Documents */}
        {stageData?.documents && stageData.documents.length > 0 && (
          <div className="tracking-stage-documents">
            <div className="tracking-documents-label">
              <i className="fas fa-paperclip"></i>
              {stageData.documents.length} document{stageData.documents.length !== 1 ? 's' : ''}
            </div>
            <div className="tracking-documents-list">
              {stageData.documents.slice(0, 2).map((doc, index) => (
                <div key={index} className="tracking-document-item">
                  <i className="fas fa-file-alt"></i>
                  <span>{doc.length > 20 ? `${doc.substring(0, 20)}...` : doc}</span>
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

        {/* Notes/Feedback Preview */}
        {(stageData?.notes || stageData?.feedback) && (
          <div className="tracking-stage-notes-preview">
            <div className="tracking-notes-label">
              <i className="fas fa-sticky-note"></i>
              {stageData.feedback ? 'Feedback' : 'Notes'}
            </div>
            <div className="tracking-notes-content">
              {(stageData.feedback || stageData.notes).length > 80 
                ? `${(stageData.feedback || stageData.notes).substring(0, 80)}...`
                : (stageData.feedback || stageData.notes)
              }
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
      </div>
    </div>
  );
};

export default WorkflowStage;