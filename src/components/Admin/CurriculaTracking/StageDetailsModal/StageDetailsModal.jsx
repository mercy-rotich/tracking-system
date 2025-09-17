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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  
  const DataField = ({ label, value, type = 'text', icon = null, copyable = false }) => {
    const displayValue = value || 'Not specified';
    const isEmpty = !value;

    const handleCopy = () => {
      if (copyable && value) {
        navigator.clipboard.writeText(value);
       
      }
    };

    return (
      <div className="tracking-data-field" style={{ marginBottom: '0.75rem' }}>
        <div style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          color: 'var(--tracking-text-primary)', 
          marginBottom: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {icon && <i className={icon} style={{ color: 'var(--tracking-primary)', fontSize: '0.875rem' }}></i>}
          {label}
          {copyable && value && (
            <button
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.125rem',
                color: 'var(--tracking-text-muted)',
                fontSize: '0.75rem'
              }}
              title="Copy to clipboard"
            >
              <i className="fas fa-copy"></i>
            </button>
          )}
        </div>
        <div style={{ 
          color: isEmpty ? 'var(--tracking-text-muted)' : 'var(--tracking-text-secondary)',
          fontStyle: isEmpty ? 'italic' : 'normal',
          fontSize: '0.875rem',
          lineHeight: '1.4'
        }}>
          {type === 'email' && value ? (
            <a href={`mailto:${value}`} style={{ color: 'var(--tracking-primary)' }}>
              {displayValue}
            </a>
          ) : type === 'date' && value ? (
            formatDisplayDate(value)
          ) : type === 'datetime' && value ? (
            formatDate(value)
          ) : type === 'boolean' ? (
            <span className={`tracking-badge ${value ? 'tracking-badge-success' : 'tracking-badge-neutral'}`}>
              <i className={`fas fa-${value ? 'check' : 'times'}`}></i>
              {value ? 'Yes' : 'No'}
            </span>
          ) : type === 'number' && value ? (
            <span style={{ fontWeight: '600' }}>{displayValue}</span>
          ) : (
            displayValue
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        {/*  Modal Header */}
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className={currentStageInfo?.icon || 'fas fa-info-circle'}></i>
            {currentStageInfo?.title || 'Stage Details'}
            {curriculum.trackingId && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--tracking-text-muted)', 
                fontWeight: '400',
                marginLeft: '0.5rem'
              }}>
                {curriculum.trackingId}
              </span>
            )}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="tracking-modal-body">
          {/*  Curriculum Info */}
          <div className="tracking-curriculum-summary tracking-card tracking-curriculum-info-card">
            <div className="tracking-card-body">
              <h4 className="tracking-curriculum-title">
                {curriculum.displayTitle || curriculum.title}
              </h4>
              
              {/* Status and Priority Indicators */}
              <div className="tracking-curriculum-meta-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem', 
                marginTop: '1rem' 
              }}>
                <div className="tracking-curriculum-meta-item">
                  <span className="tracking-badge tracking-badge-neutral">
                    <i className="fas fa-hashtag"></i>
                    {curriculum.trackingId}
                  </span>
                </div>
                
                {curriculum.displayCode && (
                  <div className="tracking-curriculum-meta-item">
                    <span className="tracking-badge tracking-badge-primary">
                      <i className="fas fa-code"></i>
                      {curriculum.displayCode}
                    </span>
                  </div>
                )}
                
                <div className="tracking-curriculum-meta-item">
                  <span className="tracking-badge tracking-badge-secondary">
                    <i className="fas fa-university"></i>
                    {curriculum.school}
                  </span>
                </div>
                
                <div className="tracking-curriculum-meta-item">
                  <span className="tracking-badge tracking-badge-warning">
                    <i className="fas fa-graduation-cap"></i>
                    {curriculum.academicLevel}
                  </span>
                </div>
                
                {curriculum.proposedDurationSemesters && (
                  <div className="tracking-curriculum-meta-item">
                    <span className="tracking-badge tracking-badge-info">
                      <i className="fas fa-clock"></i>
                      {curriculum.proposedDurationSemesters} Semesters
                    </span>
                  </div>
                )}
                
                <div className="tracking-curriculum-meta-item">
                  <span className={`tracking-badge ${
                    curriculum.priority === 'high' ? 'tracking-badge-danger' :
                    curriculum.priority === 'medium' ? 'tracking-badge-warning' :
                    'tracking-badge-neutral'
                  }`}>
                    <i className="fas fa-flag"></i>
                    {curriculum.priority?.charAt(0).toUpperCase() + curriculum.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/*  Stage Status */}
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
                  {curriculum.statusDisplayName || currentStageData?.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                </h3>
                <div className="tracking-stage-status-subtitle">
                  {curriculum.currentStageDisplayName || 'Current stage in the curriculum approval process'}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tracking-tab-navigation tracking-tabs-section">
            <div className="tracking-tab-buttons">
              {[
                { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
                { key: 'details', label: 'Curriculum Details', icon: 'fas fa-book' },
                { key: 'people', label: 'People & Assignments', icon: 'fas fa-users' },
                { key: 'timeline', label: 'Timeline & Dates', icon: 'fas fa-clock' },
                { key: 'technical', label: 'Technical Info', icon: 'fas fa-cog' },
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

          {/*  Tab Content */}
          <div className="tracking-tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tracking-overview-tab">
                <div className="tracking-overview-grid">
                  <DataField 
                    label="Tracking ID" 
                    value={curriculum.trackingId} 
                    icon="fas fa-hashtag"
                    copyable={true}
                  />
                  
                  <DataField 
                    label="Current Status" 
                    value={curriculum.statusDisplayName || curriculum.status} 
                    icon="fas fa-info-circle"
                  />
                  
                  <DataField 
                    label="Current Stage" 
                    value={curriculum.currentStageDisplayName || curriculum.currentStage} 
                    icon="fas fa-route"
                  />
                  
                  <DataField 
                    label="Priority Level" 
                    value={curriculum.priority} 
                    icon="fas fa-flag"
                  />
                  
                  <DataField 
                    label="Is Active" 
                    value={curriculum.isActive} 
                    type="boolean"
                    icon="fas fa-power-off"
                  />
                  
                  <DataField 
                    label="Is Completed" 
                    value={curriculum.isCompleted} 
                    type="boolean"
                    icon="fas fa-check-circle"
                  />
                  
                  <DataField 
                    label="Is Ideation Stage" 
                    value={curriculum.isIdeationStage} 
                    type="boolean"
                    icon="fas fa-lightbulb"
                  />
                  
                  <DataField 
                    label="Days in Current Stage" 
                    value={curriculum.daysInCurrentStage} 
                    type="number"
                    icon="fas fa-calendar-day"
                  />
                  
                  <DataField 
                    label="Total Days in System" 
                    value={curriculum.totalDays} 
                    type="number"
                    icon="fas fa-calendar-alt"
                  />
                </div>
              </div>
            )}

            {/* Curriculum Details Tab */}
            {activeTab === 'details' && (
              <div className="tracking-details-tab">
                <div className="tracking-overview-grid">
                  <DataField 
                    label="Display Name" 
                    value={curriculum.displayTitle} 
                    icon="fas fa-eye"
                  />
                  
                  <DataField 
                    label="Proposed Name" 
                    value={curriculum.proposedCurriculumName} 
                    icon="fas fa-book"
                  />
                  
                  <DataField 
                    label="Display Code" 
                    value={curriculum.displayCode} 
                    icon="fas fa-code"
                    copyable={true}
                  />
                  
                  <DataField 
                    label="Proposed Code" 
                    value={curriculum.proposedCurriculumCode} 
                    icon="fas fa-code"
                    copyable={true}
                  />
                  
                  <DataField 
                    label="Curriculum ID" 
                    value={curriculum.curriculumId} 
                    type="number"
                    icon="fas fa-id-card"
                  />
                  
                  <DataField 
                    label="Curriculum Name (System)" 
                    value={curriculum.curriculumName} 
                    icon="fas fa-database"
                  />
                  
                  <DataField 
                    label="Curriculum Code (System)" 
                    value={curriculum.curriculumCode} 
                    icon="fas fa-database"
                  />
                  
                  <DataField 
                    label="Duration (Semesters)" 
                    value={curriculum.proposedDurationSemesters} 
                    type="number"
                    icon="fas fa-clock"
                  />
                  
                  <DataField 
                    label="Academic Level" 
                    value={curriculum.academicLevel} 
                    icon="fas fa-graduation-cap"
                  />
                  
                  <DataField 
                    label="Academic Level ID" 
                    value={curriculum.academicLevelId} 
                    type="number"
                    icon="fas fa-id-badge"
                  />
                </div>
                
                {curriculum.curriculumDescription && (
                  <div className="tracking-info-group" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <DataField 
                      label="Curriculum Description" 
                      value={curriculum.curriculumDescription} 
                      icon="fas fa-file-text"
                    />
                  </div>
                )}
              </div>
            )}

            {/* People & Assignments Tab */}
            {activeTab === 'people' && (
              <div className="tracking-people-tab">
                <div className="tracking-overview-grid">
                  <DataField 
                    label="Initiated By (Name)" 
                    value={curriculum.initiatedByName} 
                    icon="fas fa-user-plus"
                  />
                  
                  <DataField 
                    label="Initiated By (Email)" 
                    value={curriculum.initiatedByEmail} 
                    type="email"
                    icon="fas fa-envelope"
                    copyable={true}
                  />
                  
                  <DataField 
                    label="Current Assignee (Name)" 
                    value={curriculum.currentAssigneeName} 
                    icon="fas fa-user-check"
                  />
                  
                  <DataField 
                    label="Current Assignee (Email)" 
                    value={curriculum.currentAssigneeEmail} 
                    type="email"
                    icon="fas fa-envelope"
                    copyable={true}
                  />
                  
                  <DataField 
                    label="School Name" 
                    value={curriculum.schoolName} 
                    icon="fas fa-university"
                  />
                  
                  <DataField 
                    label="School ID" 
                    value={curriculum.schoolId} 
                    type="number"
                    icon="fas fa-id-badge"
                  />
                  
                  <DataField 
                    label="Department Name" 
                    value={curriculum.departmentName} 
                    icon="fas fa-building"
                  />
                  
                  <DataField 
                    label="Department ID" 
                    value={curriculum.departmentId} 
                    type="number"
                    icon="fas fa-id-badge"
                  />
                </div>
              </div>
            )}

            {/* Timeline & Dates Tab */}
            {activeTab === 'timeline' && (
              <div className="tracking-timeline-tab">
                <div className="tracking-overview-grid">
                  <DataField 
                    label="Created At" 
                    value={curriculum.createdAt} 
                    type="datetime"
                    icon="fas fa-plus-circle"
                  />
                  
                  <DataField 
                    label="Last Updated" 
                    value={curriculum.updatedAt} 
                    type="datetime"
                    icon="fas fa-edit"
                  />
                  
                  <DataField 
                    label="Submitted Date" 
                    value={curriculum.submittedDate} 
                    type="date"
                    icon="fas fa-paper-plane"
                  />
                  
                  <DataField 
                    label="Expected Completion" 
                    value={curriculum.expectedCompletionDate} 
                    type="datetime"
                    icon="fas fa-flag-checkered"
                  />
                  
                  <DataField 
                    label="Actual Completion" 
                    value={curriculum.actualCompletionDate} 
                    type="datetime"
                    icon="fas fa-check-circle"
                  />
                  
                  <DataField 
                    label="Proposed Effective Date" 
                    value={curriculum.proposedEffectiveDate} 
                    type="date"
                    icon="fas fa-calendar-check"
                  />
                  
                  <DataField 
                    label="Proposed Expiry Date" 
                    value={curriculum.proposedExpiryDate} 
                    type="date"
                    icon="fas fa-calendar-times"
                  />
                </div>
                
                {/* Timeline Visualization */}
                <div style={{ marginTop: '2rem' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-route" style={{ color: 'var(--tracking-primary)' }}></i>
                    Workflow Timeline
                  </h5>
                  <div className="tracking-timeline">
                    {stages.map((stage, index) => {
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
              </div>
            )}

            {/* Technical Info Tab */}
            {activeTab === 'technical' && (
              <div className="tracking-technical-tab">
                <div className="tracking-overview-grid">
                  <DataField 
                    label="Original Current Stage (API)" 
                    value={curriculum.originalCurrentStage} 
                    icon="fas fa-code"
                  />
                  
                  <DataField 
                    label="Original Status (API)" 
                    value={curriculum.originalStatus} 
                    icon="fas fa-code"
                  />
                  
                  <DataField 
                    label="Data Source" 
                    value={curriculum._dataSource} 
                    icon="fas fa-database"
                  />
                  
                  <DataField 
                    label="Transformed At" 
                    value={curriculum._transformedAt} 
                    type="datetime"
                    icon="fas fa-sync"
                  />
                </div>
                
                {/* Raw API Data Display */}
                {curriculum._rawApiData && (
                  <div style={{ marginTop: '2rem' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-database" style={{ color: 'var(--tracking-secondary)' }}></i>
                      Raw API Data
                    </h5>
                    <div style={{ 
                      backgroundColor: 'var(--tracking-bg-secondary)',
                      border: '1px solid var(--tracking-border)',
                      borderRadius: '8px',
                      padding: '1rem',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(curriculum._rawApiData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
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
                  {/* Initial Notes */}
                  {curriculum.initialNotes && (
                    <div className="tracking-notes-section tracking-notes-initial">
                      <DataField 
                        label="Initial Notes" 
                        value={curriculum.initialNotes} 
                        icon="fas fa-file-text"
                      />
                    </div>
                  )}

                  {/* Recent Steps */}
                  {curriculum.recentSteps && (
                    <div className="tracking-notes-section tracking-recent-steps">
                      <DataField 
                        label="Recent Steps" 
                        value={curriculum.recentSteps} 
                        icon="fas fa-history"
                      />
                    </div>
                  )}

                  {/* Current Stage Notes */}
                  {currentStageData?.notes && (
                    <div className="tracking-notes-section tracking-notes-current">
                      <DataField 
                        label="Current Stage Notes" 
                        value={currentStageData.notes} 
                        icon="fas fa-sticky-note"
                      />
                    </div>
                  )}

                  {/* Current Stage Feedback */}
                  {currentStageData?.feedback && (
                    <div className="tracking-feedback-section tracking-notes-feedback">
                      <DataField 
                        label="Stage Feedback" 
                        value={currentStageData.feedback} 
                        icon="fas fa-comments"
                      />
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

export default StageDetailsModal