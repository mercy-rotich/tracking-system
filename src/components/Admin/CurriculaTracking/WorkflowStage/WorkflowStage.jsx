import React, { useState, useEffect, useRef } from 'react';
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
  onAddNotes,
  onEditTracking,      
  onAssignTracking,    
  onToggleStatus       
}) => {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const stageRef = useRef(null);
  const dropdownRef = useRef(null);

  // Auto-scroll to active stage on mount
  useEffect(() => {
    if (isActive && stageRef.current) {
      setTimeout(() => {
        stageRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [isActive]);

  // Auto-expand if stage needs action
  useEffect(() => {
    const needsAction = ['under_review', 'on_hold'].includes(getStageStatus());
    if (needsAction || isActive) {
      setIsExpanded(true);
    }
  }, [stageData, isActive]);

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

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
  const needsAction = status === 'under_review';

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

  const daysInStage = getDaysInStage();

  const truncateText = (text, maxLength = 60) => {
    if (!text) return null;
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div 
      ref={stageRef}
      className={`tracking-stage-card tracking-stage-card-enhanced ${
        isActive ? 'tracking-stage-card-active' : ''
      } tracking-stage-card-${status} ${isExpanded ? 'tracking-stage-card-expanded' : 'tracking-stage-card-collapsed'}`}
    >
      {/* COMPACT HEADER - Always Visible */}
      <div 
        className="tracking-stage-header tracking-stage-header-clickable"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
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
            {needsAction && (
              <span className="tracking-stage-action-badge">
                ACTION NEEDED
              </span>
            )}
          </div>
          <div className="tracking-stage-description">
            {stage.description}
          </div>
        </div>

        {/* Quick Status Summary */}
        <div className="tracking-stage-quick-status">
          {/* Days Badge */}
          {daysInStage && (
            <div className={`tracking-stage-days-badge ${daysInStage > 14 ? 'tracking-stage-days-warning' : ''}`}>
              <i className="fas fa-clock"></i>
              <span>{daysInStage}d</span>
            </div>
          )}

          {/* Status Badge */}
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

          {/* Expand/Collapse Icon */}
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} tracking-stage-expand-icon`}></i>
        </div>
      </div>

      
      {isExpanded && (
        <div className="tracking-stage-content tracking-stage-content-expanded">
          {/* Current Stage Indicator */}
          {isActive && (
            <div className="tracking-stage-current-indicator">
              <i className="fas fa-arrow-right"></i>
              Current Stage
            </div>
          )}

          {/* Essential Info Grid - Simplified */}
          <div className="tracking-stage-info-grid">
            {/* Timeline Information */}
            {(stageData?.startedDate || stageData?.completedDate) && (
              <div className="tracking-stage-info-card tracking-stage-timeline-card">
                <div className="tracking-info-card-label">
                  <i className={`fas fa-${status === 'completed' ? 'check-circle' : 'play-circle'}`}></i>
                  {status === 'completed' ? 'Completed' : 'Started'}
                </div>
                <div className="tracking-info-card-value">
                  {formatDate(status === 'completed' ? stageData.completedDate : stageData.startedDate)}
                  {daysInStage && status !== 'completed' && (
                    <span className="tracking-info-card-sub">({daysInStage} day{daysInStage !== 1 ? 's' : ''})</span>
                  )}
                </div>
              </div>
            )}

            {/* Assignee Information */}
            {(stageData?.assignedTo || curriculum.currentAssigneeName) && (
              <div className="tracking-stage-info-card tracking-stage-assignee-card">
                <div className="tracking-info-card-label">
                  <i className="fas fa-user"></i>
                  Assigned To
                </div>
                <div className="tracking-info-card-value">
                  {stageData?.assignedTo || curriculum.currentAssigneeName}
                </div>
              </div>
            )}

            {/* Documents Count */}
            {stageData?.documents && stageData.documents.length > 0 && (
              <div className="tracking-stage-info-card tracking-stage-documents-card">
                <div className="tracking-info-card-label">
                  <i className="fas fa-paperclip"></i>
                  Documents
                </div>
                <div className="tracking-info-card-value">
                  {stageData.documents.length} file{stageData.documents.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>

          {/* Notes Preview */}
          {(stageData?.notes || stageData?.feedback) && (
            <div className="tracking-stage-notes-compact">
              <div className="tracking-notes-compact-label">
                <i className="fas fa-sticky-note"></i>
                {stageData?.feedback ? 'Feedback' : 'Notes'}
              </div>
              <div className="tracking-notes-compact-content">
                {truncateText(stageData?.feedback || stageData?.notes, 100)}
              </div>
            </div>
          )}

          {/* PRIMARY WORKFLOW ACTIONS - Contextual */}
          {canTakeAction && (
            <div className="tracking-stage-primary-actions">
              {status === 'under_review' && (
                <>
                  <button
                    className="tracking-stage-action-btn tracking-action-approve"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStageAction(curriculum.id, stage.key, 'approve');
                    }}
                  >
                    <i className="fas fa-check"></i>
                    Approve
                  </button>
                  
                  <button
                    className="tracking-stage-action-btn tracking-action-hold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStageAction(curriculum.id, stage.key, 'hold');
                    }}
                  >
                    <i className="fas fa-pause"></i>
                    Hold
                  </button>
                  
                  <button
                    className="tracking-stage-action-btn tracking-action-reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStageAction(curriculum.id, stage.key, 'reject');
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Reject
                  </button>
                </>
              )}

              {status === 'on_hold' && (
                <button
                  className="tracking-stage-action-btn tracking-action-resume"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStageAction(curriculum.id, stage.key, 'resume');
                  }}
                  style={{ flex: 1 }}
                >
                  <i className="fas fa-play"></i>
                  Resume Stage
                </button>
              )}
            </div>
          )}

          {/* SECONDARY ACTIONS - Dropdown Menu */}
          <div className="tracking-stage-secondary-actions-wrapper">
            <div className="tracking-stage-quick-actions">
              <button
                className="tracking-stage-action-btn tracking-action-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(curriculum, stage.key);
                }}
              >
                <i className="fas fa-eye"></i>
                Details
              </button>
              
              <button
                className="tracking-stage-action-btn tracking-action-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadDocument(curriculum, stage.key);
                }}
              >
                <i className="fas fa-upload"></i>
                Upload
              </button>

              <div className="tracking-stage-more-actions" ref={dropdownRef}>
                <button
                  className="tracking-stage-action-btn tracking-action-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsMenu(!showActionsMenu);
                  }}
                >
                  <i className="fas fa-ellipsis-h"></i>
                  More
                </button>

                {showActionsMenu && (
                  <div className="tracking-stage-actions-dropdown">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNotes(curriculum, stage.key);
                        setShowActionsMenu(false);
                      }}
                    >
                      <i className="fas fa-sticky-note"></i>
                      Add Notes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTracking(curriculum);
                        setShowActionsMenu(false);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                      Edit Tracking
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignTracking(curriculum);
                        setShowActionsMenu(false);
                      }}
                    >
                      <i className="fas fa-user-plus"></i>
                      Reassign
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(curriculum);
                        setShowActionsMenu(false);
                      }}
                      style={{
                        color: curriculum.isActive ? '#f59e0b' : '#10b981'
                      }}
                    >
                      <i className={`fas fa-${curriculum.isActive ? 'pause' : 'play'}`}></i>
                      {curriculum.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStage;