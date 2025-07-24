import React, { useState } from 'react';
import './WorkflowStage.css';

const WorkflowStage = ({ 
  stage, 
  curriculum, 
  stageData, 
  isActive, 
  onStageAction, 
  onViewDetails, 
  onUploadDocument, 
  onAddNotes 
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStageStatus = () => {
    if (!stageData) return 'pending';
    return stageData.status || 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'tracking-status-dot-completed';
      case 'under_review': return 'tracking-status-dot-active';
      case 'on_hold': return 'tracking-status-dot-hold';
      case 'rejected': return 'tracking-status-dot-rejected';
      default: return 'tracking-status-dot-pending';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'tracking-badge-success';
      case 'under_review': return 'tracking-badge-primary';
      case 'on_hold': return 'tracking-badge-warning';
      case 'rejected': return 'tracking-badge-danger';
      default: return 'tracking-badge-neutral';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'under_review': return 'Under Review';
      case 'on_hold': return 'On Hold';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const status = getStageStatus();
  const canTakeAction = ['under_review', 'on_hold'].includes(status);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysInStage = () => {
    if (!stageData?.startedDate) return null;
    const start = new Date(stageData.startedDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div 
      className={`tracking-workflow-stage ${isActive ? 'tracking-workflow-stage-active' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Stage Status Indicator */}
      <div className="tracking-stage-status">
        <div className="tracking-flex">
          <div className={`tracking-status-dot ${getStatusColor(status)}`}></div>
          <span className={`tracking-badge ${getStatusBadge(status)}`}>
            {getStatusLabel(status)}
          </span>
        </div>
        
        {isActive && (
          <div className="tracking-badge tracking-badge-primary">
            <i className="fas fa-clock"></i>
            Current
          </div>
        )}
      </div>

      {/* Stage Content */}
      <div className="tracking-stage-content">
        {/* Assigned To */}
        {stageData?.assignedTo && (
          <div className="tracking-stage-assignee">
            <div>
              Assigned to:
            </div>
            <div>
              <i className="fas fa-user"></i>
              {stageData.assignedTo}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="tracking-stage-dates">
          {stageData?.completedDate && (
            <div>
              <i className="fas fa-check-circle" style={{ color: 'var(--tracking-success)' }}></i>
              Completed: {formatDate(stageData.completedDate)}
            </div>
          )}
          
          {stageData?.startedDate && !stageData?.completedDate && (
            <div>
              <i className="fas fa-play-circle" style={{ color: 'var(--tracking-primary)' }}></i>
              Started: {formatDate(stageData.startedDate)}
              {getDaysInStage() && (
                <span style={{ marginLeft: '0.5rem' }}>
                  ({getDaysInStage()} days)
                </span>
              )}
            </div>
          )}
          
          {stageData?.dueDate && !stageData?.completedDate && (
            <div>
              <i className="fas fa-calendar-alt"></i>
              Due: {formatDate(stageData.dueDate)}
            </div>
          )}
          
          {stageData?.estimatedStart && status === 'pending' && (
            <div>
              <i className="fas fa-clock"></i>
              Est. Start: {formatDate(stageData.estimatedStart)}
            </div>
          )}
        </div>

        {/* Documents */}
        {stageData?.documents && stageData.documents.length > 0 && (
          <div className="tracking-stage-documents">
            <div>
              Documents ({stageData.documents.length}):
            </div>
            <div className="tracking-flex">
              {stageData.documents.slice(0, 2).map((doc, index) => (
                <span key={index} className="tracking-badge tracking-badge-neutral">
                  <i className="fas fa-file-alt"></i>
                  {doc.length > 15 ? `${doc.substring(0, 15)}...` : doc}
                </span>
              ))}
              {stageData.documents.length > 2 && (
                <span className="tracking-badge tracking-badge-neutral">
                  +{stageData.documents.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes/Feedback */}
        {(stageData?.notes || stageData?.feedback) && (
          <div className="tracking-stage-notes">
            <div>
              {stageData.feedback ? 'Feedback:' : 'Notes:'}
            </div>
            <div>
              {stageData.feedback || stageData.notes}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(showActions || canTakeAction) && (
        <div className="tracking-stage-actions">
          {/* View Details Button */}
          <button
            className="tracking-btn tracking-btn-outline"
            onClick={() => onViewDetails(curriculum, stage.key)}
          >
            <i className="fas fa-eye"></i>
            Details
          </button>

          {/* Action Buttons for Active Stages */}
          {canTakeAction && (
            <>
              <button
                className="tracking-btn tracking-btn-success"
                onClick={() => onStageAction(curriculum.id, stage.key, 'approve')}
              >
                <i className="fas fa-check"></i>
                Approve
              </button>
              
              <button
                className="tracking-btn tracking-btn-warning"
                onClick={() => onStageAction(curriculum.id, stage.key, 'hold')}
              >
                <i className="fas fa-pause"></i>
                Hold
              </button>
              
              <button
                className="tracking-btn tracking-btn-danger"
                onClick={() => onStageAction(curriculum.id, stage.key, 'reject')}
              >
                <i className="fas fa-times"></i>
                Reject
              </button>
            </>
          )}

          {/* Secondary Actions */}
          <div className="tracking-stage-secondary-actions">
            <button
              className="tracking-btn tracking-btn-outline"
              onClick={() => onUploadDocument(curriculum, stage.key)}
            >
              <i className="fas fa-upload"></i>
              Upload
            </button>
            
            <button
              className="tracking-btn tracking-btn-outline"
              onClick={() => onAddNotes(curriculum, stage.key)}
            >
              <i className="fas fa-sticky-note"></i>
              Notes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStage;