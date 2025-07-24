import React, { useState } from 'react';
import './StageDetailsModal.css';

const StageDetailsModal = ({ 
  curriculum, 
  onClose, 
  onStageAction, 
  onUploadDocument, 
  onAddNotes 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackText, setFeedbackText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const stages = [
    { key: 'initiation', title: 'Initiation', icon: 'fas fa-lightbulb' },
    { key: 'school_board', title: 'School Board', icon: 'fas fa-users' },
    { key: 'dean_committee', title: 'Dean Committee', icon: 'fas fa-user-tie' },
    { key: 'senate', title: 'Senate', icon: 'fas fa-landmark' },
    { key: 'qa_review', title: 'QA Review', icon: 'fas fa-clipboard-check' },
    { key: 'vice_chancellor', title: 'Vice Chancellor', icon: 'fas fa-stamp' },
    { key: 'cue_review', title: 'CUE Review', icon: 'fas fa-university' },
    { key: 'site_inspection', title: 'Site Inspection', icon: 'fas fa-search' }
  ];

  const currentStageData = curriculum.stages[curriculum.selectedStage || curriculum.currentStage];
  const currentStageInfo = stages.find(s => s.key === (curriculum.selectedStage || curriculum.currentStage));

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'var(--tracking-success)';
      case 'under_review': return 'var(--tracking-primary)';
      case 'on_hold': return 'var(--tracking-warning)';
      case 'rejected': return 'var(--tracking-danger)';
      default: return 'var(--tracking-text-muted)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'under_review': return 'fas fa-clock';
      case 'on_hold': return 'fas fa-pause-circle';
      case 'rejected': return 'fas fa-times-circle';
      default: return 'fas fa-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const handleStageAction = async (action) => {
    setActionLoading(true);
    try {
      await onStageAction(
        curriculum.id, 
        curriculum.selectedStage || curriculum.currentStage, 
        action, 
        { feedback: feedbackText }
      );
      onClose();
    } catch (error) {
      console.error('Error performing stage action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const canTakeAction = ['under_review', 'on_hold'].includes(currentStageData?.status);

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className={currentStageInfo?.icon || 'fas fa-info-circle'}></i>
            {currentStageInfo?.title || 'Stage Details'}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="tracking-modal-body">
          {/* Curriculum Info */}
          <div className="tracking-curriculum-summary tracking-card tracking-curriculum-info-card">
            <div className="tracking-card-body">
              <h4 className="tracking-curriculum-title">{curriculum.title}</h4>
              <div className="tracking-curriculum-meta-grid">
                <div className="tracking-curriculum-meta-item">
                  <span className="tracking-badge tracking-badge-neutral">
                    <i className="fas fa-hashtag"></i>
                    {curriculum.trackingId}
                  </span>
                </div>
                <div className="tracking-curriculum-meta-item">
                  <span className="tracking-badge tracking-badge-secondary">
                    <i className="fas fa-university"></i>
                    {curriculum.school}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Status */}
          <div className="tracking-stage-status-overview tracking-stage-status-section">
            <div className="tracking-stage-status-header">
              <div 
                className="tracking-stage-status-icon"
                style={{
                  backgroundColor: `${getStatusColor(currentStageData?.status)}20`,
                  color: getStatusColor(currentStageData?.status)
                }}
              >
                <i className={getStatusIcon(currentStageData?.status)}></i>
              </div>
              
              <div className="tracking-stage-status-info">
                <h3 className="tracking-stage-status-title">
                  {currentStageData?.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                </h3>
                <div className="tracking-stage-status-subtitle">
                  Current stage in the curriculum approval process
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tracking-tab-navigation tracking-tabs-section">
            <div className="tracking-tab-buttons">
              {[
                { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
                { key: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
                { key: 'documents', label: 'Documents', icon: 'fas fa-file-alt' },
                { key: 'notes', label: 'Notes & Feedback', icon: 'fas fa-comments' }
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tracking-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="tracking-tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tracking-overview-tab">
                <div className="tracking-overview-grid">
                  <div className="tracking-info-group">
                    <h5 className="tracking-info-label">Assigned To</h5>
                    <p className="tracking-info-value">{currentStageData?.assignedTo || 'Not assigned'}</p>
                  </div>
                  
                  <div className="tracking-info-group">
                    <h5 className="tracking-info-label">Current Status</h5>
                    <span className={`tracking-badge ${
                      currentStageData?.status === 'completed' ? 'tracking-badge-success' :
                      currentStageData?.status === 'under_review' ? 'tracking-badge-primary' :
                      currentStageData?.status === 'on_hold' ? 'tracking-badge-warning' :
                      currentStageData?.status === 'rejected' ? 'tracking-badge-danger' :
                      'tracking-badge-neutral'
                    }`}>
                      {currentStageData?.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                    </span>
                  </div>
                  
                  <div className="tracking-info-group">
                    <h5 className="tracking-info-label">Started Date</h5>
                    <p className="tracking-info-value">{formatDate(currentStageData?.startedDate)}</p>
                  </div>
                  
                  <div className="tracking-info-group">
                    <h5 className="tracking-info-label">Due Date</h5>
                    <p className="tracking-info-value">{formatDate(currentStageData?.dueDate)}</p>
                  </div>
                  
                  {currentStageData?.completedDate && (
                    <div className="tracking-info-group">
                      <h5 className="tracking-info-label">Completed Date</h5>
                      <p className="tracking-info-value">{formatDate(currentStageData.completedDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="tracking-timeline-tab">
                <div className="tracking-timeline">
                  {stages.map(stage => {
                    const stageData = curriculum.stages[stage.key];
                    const isCompleted = stageData?.status === 'completed';
                    const isCurrent = stage.key === curriculum.currentStage;
                    const isActive = ['under_review', 'on_hold'].includes(stageData?.status);
                    
                    return (
                      <div key={stage.key} className="tracking-timeline-item">
                        <div className={`tracking-timeline-marker ${
                          isCompleted ? 'tracking-timeline-marker-completed' :
                          isActive ? 'tracking-timeline-marker-active' :
                          'tracking-timeline-marker-pending'
                        }`}>
                          <i className={isCompleted ? 'fas fa-check' : stage.icon}></i>
                        </div>
                        
                        <div className="tracking-timeline-content">
                          <div className="tracking-timeline-title">
                            {stage.title}
                            {isCurrent && (
                              <span className="tracking-badge tracking-badge-primary tracking-current-badge">
                                Current
                              </span>
                            )}
                          </div>
                          
                          <div className="tracking-timeline-meta">
                            {stageData?.assignedTo && (
                              <div>Assigned to: {stageData.assignedTo}</div>
                            )}
                            {stageData?.startedDate && (
                              <div>Started: {formatDate(stageData.startedDate)}</div>
                            )}
                            {stageData?.completedDate && (
                              <div>Completed: {formatDate(stageData.completedDate)}</div>
                            )}
                          </div>
                          
                          {stageData?.notes && (
                            <div className="tracking-timeline-description">
                              {stageData.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="tracking-documents-tab">
                {currentStageData?.documents && currentStageData.documents.length > 0 ? (
                  <div className="tracking-documents-list">
                    {currentStageData.documents.map((doc, index) => (
                      <div key={index} className="tracking-document-item">
                        <div className="tracking-document-info">
                          <i className="fas fa-file-alt"></i>
                          <span>{doc}</span>
                        </div>
                        <div className="tracking-document-actions">
                          <button className="tracking-btn tracking-btn-outline tracking-btn-sm">
                            <i className="fas fa-download"></i>
                            Download
                          </button>
                          <button className="tracking-btn tracking-btn-outline tracking-btn-sm">
                            <i className="fas fa-eye"></i>
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tracking-empty-state">
                    <i className="fas fa-file-alt"></i>
                    <p>No documents uploaded for this stage</p>
                  </div>
                )}
                
                <div className="tracking-upload-section">
                  <button 
                    className="tracking-btn tracking-btn-primary"
                    onClick={() => onUploadDocument(curriculum, curriculum.selectedStage || curriculum.currentStage)}
                  >
                    <i className="fas fa-upload"></i>
                    Upload Document
                  </button>
                </div>
              </div>
            )}

            {/* Notes & Feedback Tab */}
            {activeTab === 'notes' && (
              <div className="tracking-notes-tab">
                <div className="tracking-notes-sections">
                  {/* Current Notes */}
                  {currentStageData?.notes && (
                    <div className="tracking-notes-section tracking-notes-current">
                      <h5 className="tracking-notes-section-title">
                        <i className="fas fa-sticky-note"></i>
                        Current Notes
                      </h5>
                      <div className="tracking-notes-content">
                        {currentStageData.notes}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {currentStageData?.feedback && (
                    <div className="tracking-feedback-section tracking-notes-feedback">
                      <h5 className="tracking-notes-section-title">
                        <i className="fas fa-comments"></i>
                        Feedback
                      </h5>
                      <div className="tracking-feedback-content">
                        {currentStageData.feedback}
                      </div>
                    </div>
                  )}

                  {/* Add Notes Button */}
                  <div className="tracking-add-notes">
                    <button 
                      className="tracking-btn tracking-btn-secondary"
                      onClick={() => onAddNotes(curriculum, curriculum.selectedStage || curriculum.currentStage)}
                    >
                      <i className="fas fa-plus"></i>
                      Add Notes
                    </button>
                  </div>

                  {/* Action Feedback Input */}
                  {canTakeAction && (
                    <div className="tracking-action-feedback tracking-feedback-input">
                      <h5 className="tracking-feedback-input-title">Action Feedback</h5>
                      <div className="tracking-form-group">
                        <textarea
                          className="tracking-form-control"
                          rows="3"
                          placeholder="Add feedback for your decision..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="tracking-modal-footer">
          <button 
            className="tracking-btn tracking-btn-outline"
            onClick={onClose}
            disabled={actionLoading}
          >
            Close
          </button>
          
          {canTakeAction && (
            <>
              <button 
                className="tracking-btn tracking-btn-success"
                onClick={() => handleStageAction('approve')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <i className="fas fa-spinner tracking-btn-loading"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                Approve
              </button>
              
              <button 
                className="tracking-btn tracking-btn-warning"
                onClick={() => handleStageAction('hold')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <i className="fas fa-spinner tracking-btn-loading"></i>
                ) : (
                  <i className="fas fa-pause"></i>
                )}
                Put on Hold
              </button>
              
              <button 
                className="tracking-btn tracking-btn-danger"
                onClick={() => handleStageAction('reject')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <i className="fas fa-spinner tracking-btn-loading"></i>
                ) : (
                  <i className="fas fa-times"></i>
                )}
                Reject
              </button>
            </>
          )}
          
          {currentStageData?.status === 'on_hold' && (
            <button 
              className="tracking-btn tracking-btn-primary"
              onClick={() => handleStageAction('resume')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <i className="fas fa-spinner tracking-btn-loading"></i>
              ) : (
                <i className="fas fa-play"></i>
              )}
              Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageDetailsModal;