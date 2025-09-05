import React, { useState, useEffect } from 'react';
import './StageDetailsModal.css';

const StageDetailsModal = ({ 
  curriculum, 
  onClose, 
  onStageAction, 
  onUploadDocument, 
  onAddNotes,
  onDocumentDownload 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackText, setFeedbackText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentError, setDocumentError] = useState('');

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

  // Load documents when component mounts or tracking ID changes
  useEffect(() => {
    if (curriculum && (curriculum.id || curriculum.trackingId)) {
      loadDocuments();
    }
  }, [curriculum?.id, curriculum?.trackingId]);

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentError('');
    
    try {
      console.log('🔄 Loading documents for curriculum:', curriculum.id || curriculum.trackingId);
      
      
      const { default: curriculumTrackingService } = await import('../../../../services/curriculumTrackingService');
      
      const result = await curriculumTrackingService.getDocumentsByTrackingId(
        curriculum.id || curriculum.trackingId
      );
      
      if (result.success) {
        setDocuments(result.data || []);
        console.log('✅ Documents loaded:', result.data?.length || 0);
      } else {
        console.error('❌ Failed to load documents:', result.error);
        setDocumentError(result.error || 'Failed to load documents');
        setDocuments([]);
      }
    } catch (error) {
      console.error('❌ Error loading documents:', error);
      setDocumentError(error.message || 'Error loading documents');
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDocumentDownload = async (document) => {
    try {
      console.log('🔄 Downloading document:', document.name);
      
      
      const { default: curriculumTrackingService } = await import('../../../../services/curriculumTrackingService');
      
      await curriculumTrackingService.downloadDocumentToFile(
        document.id, 
        document.originalFilename || document.name
      );
      
      console.log('✅ Document downloaded successfully');
      
      // Call the parent callback if provided
      if (onDocumentDownload) {
        onDocumentDownload(document.id, document.name);
      }
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert(`Failed to download document: ${error.message}`);
    }
  };

  const handleDocumentView = async (document) => {
    try {
      console.log('🔄 Getting view URL for document:', document.name);
      
      
      const { default: curriculumTrackingService } = await import('../../../../services/curriculumTrackingService');
      
      const result = await curriculumTrackingService.getDocumentDownloadUrl(document.id);
      
      if (result.success) {
        // Open in new tab/window
        window.open(result.data.downloadUrl, '_blank');
        console.log('✅ Document opened in new tab');
      } else {
        throw new Error(result.error || 'Failed to get document URL');
      }
      
    } catch (error) {
      console.error('❌ Failed to open document:', error);
      alert(`Failed to open document: ${error.message}`);
    }
  };

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

  const getDocumentsByType = () => {
    const grouped = {};
    documents.forEach(doc => {
      const type = doc.documentTypeDisplayName || doc.documentType || 'Other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(doc);
    });
    return grouped;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <div className="tracking-curriculum-summary tracking-card">
            <div className="tracking-card-body">
              <h4>{curriculum.title}</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="tracking-badge tracking-badge-neutral">
                  <i className="fas fa-hashtag"></i>
                  {curriculum.trackingId}
                </span>
                <span className="tracking-badge tracking-badge-secondary">
                  <i className="fas fa-university"></i>
                  {curriculum.school}
                </span>
                <span className="tracking-badge tracking-badge-primary">
                  <i className="fas fa-building"></i>
                  {curriculum.department}
                </span>
              </div>
            </div>
          </div>

          {/* Stage Status */}
          <div className="tracking-stage-status-overview">
            <div className="tracking-flex tracking-items-center tracking-gap-4">
              <div 
                className="tracking-stage-status-icon"
                style={{
                  backgroundColor: `${getStatusColor(currentStageData?.status)}20`,
                  color: getStatusColor(currentStageData?.status)
                }}
              >
                <i className={getStatusIcon(currentStageData?.status)}></i>
              </div>
              
              <div>
                <h3>
                  {currentStageData?.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                </h3>
                <p>Current stage in the curriculum approval process</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tracking-tab-navigation">
            <div className="tracking-flex">
              {[
                { key: 'overview', label: 'Overview', icon: 'fas fa-info-circle' },
                { key: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
                { key: 'documents', label: `Documents (${documents.length})`, icon: 'fas fa-file-alt' },
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
                <div className="tracking-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div className="tracking-info-group">
                    <h5>Assigned To</h5>
                    <p>{currentStageData?.assignedTo || 'Not assigned'}</p>
                  </div>
                  
                  <div className="tracking-info-group">
                    <h5>Current Status</h5>
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
                    <h5>Started Date</h5>
                    <p>{formatDate(currentStageData?.startedDate)}</p>
                  </div>
                  
                  <div className="tracking-info-group">
                    <h5>Due Date</h5>
                    <p>{formatDate(currentStageData?.dueDate)}</p>
                  </div>
                  
                  {currentStageData?.completedDate && (
                    <div className="tracking-info-group">
                      <h5>Completed Date</h5>
                      <p>{formatDate(currentStageData.completedDate)}</p>
                    </div>
                  )}

                  <div className="tracking-info-group">
                    <h5>Total Documents</h5>
                    <p>{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
                  </div>
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
                              <span className="tracking-badge tracking-badge-primary" style={{ marginLeft: '0.5rem' }}>
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
                {/* Documents Header */}
                <div className="tracking-flex tracking-items-center tracking-justify-between tracking-mb-4">
                  <h5>
                    <i className="fas fa-file-alt"></i>
                    Documents ({documents.length})
                  </h5>
                  <div className="tracking-flex tracking-gap-2">
                    <button
                      className="tracking-btn tracking-btn-outline tracking-btn-sm"
                      onClick={loadDocuments}
                      disabled={documentsLoading}
                    >
                      <i className={`fas ${documentsLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                      Refresh
                    </button>
                    <button 
                      className="tracking-btn tracking-btn-primary tracking-btn-sm"
                      onClick={() => onUploadDocument(curriculum, curriculum.selectedStage || curriculum.currentStage)}
                    >
                      <i className="fas fa-upload"></i>
                      Upload
                    </button>
                  </div>
                </div>

                {/* Documents Loading */}
                {documentsLoading && (
                  <div className="tracking-text-center" style={{ padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                    <p>Loading documents...</p>
                  </div>
                )}

                {/* Documents Error */}
                {documentError && (
                  <div className="tracking-file-error tracking-mb-4">
                    <i className="fas fa-exclamation-triangle"></i>
                    {documentError}
                  </div>
                )}

                {/* Documents List */}
                {!documentsLoading && documents.length > 0 && (
                  <div>
                    {Object.entries(getDocumentsByType()).map(([type, typeDocuments]) => (
                      <div key={type} className="tracking-mb-4">
                        <h6 className="tracking-mb-3" style={{ 
                          color: 'var(--tracking-text-primary)', 
                          fontWeight: '600',
                          fontSize: '0.9375rem',
                          borderBottom: '1px solid var(--tracking-border)',
                          paddingBottom: '0.5rem'
                        }}>
                          {type} ({typeDocuments.length})
                        </h6>
                        <div className="tracking-documents-list">
                          {typeDocuments.map((doc, index) => (
                            <div key={doc.id || index} className="tracking-document-item">
                              <div className="tracking-document-info">
                                <i 
                                  className={doc.icon || 'fas fa-file-alt'}
                                  style={{ color: doc.iconColor || '#6b7280', fontSize: '1.125rem' }}
                                ></i>
                                <div>
                                  <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                                    {doc.name || doc.originalFilename}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                                    {formatFileSize(doc.fileSize)} • 
                                    {doc.fileExtension?.toUpperCase()} • 
                                    Uploaded by {doc.uploadedBy} • 
                                    {formatDate(doc.uploadedAt)}
                                  </div>
                                  {doc.description && (
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--tracking-text-secondary)', marginTop: '0.25rem' }}>
                                      {doc.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="tracking-document-actions">
                                <button
                                  className="tracking-btn tracking-btn-outline tracking-btn-sm"
                                  onClick={() => handleDocumentView(doc)}
                                  title="View document"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="tracking-btn tracking-btn-outline tracking-btn-sm"
                                  onClick={() => handleDocumentDownload(doc)}
                                  title="Download document"
                                >
                                  <i className="fas fa-download"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Documents */}
                {!documentsLoading && !documentError && documents.length === 0 && (
                  <div className="tracking-empty-state">
                    <i className="fas fa-file-alt"></i>
                    <p>No documents found for this curriculum</p>
                    <button 
                      className="tracking-btn tracking-btn-primary tracking-btn-sm tracking-mt-4"
                      onClick={() => onUploadDocument(curriculum, curriculum.selectedStage || curriculum.currentStage)}
                    >
                      <i className="fas fa-upload"></i>
                      Upload First Document
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notes & Feedback Tab */}
            {activeTab === 'notes' && (
              <div className="tracking-notes-tab">
                {/* Current Notes */}
                {currentStageData?.notes && (
                  <div className="tracking-notes-section tracking-mb-4">
                    <h5>
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
                  <div className="tracking-feedback-section tracking-mb-4">
                    <h5>
                      <i className="fas fa-comments"></i>
                      Feedback
                    </h5>
                    <div className="tracking-feedback-content">
                      {currentStageData.feedback}
                    </div>
                  </div>
                )}

                {/* Add Notes Button */}
                <div className="tracking-add-notes tracking-mb-4">
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
                  <div className="tracking-action-feedback">
                    <h5>Action Feedback</h5>
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
                  <i className="fas fa-spinner fa-spin"></i>
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
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-pause"></i>
                )}
                Hold
              </button>
              
              <button 
                className="tracking-btn tracking-btn-danger"
                onClick={() => handleStageAction('reject')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
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
                <i className="fas fa-spinner fa-spin"></i>
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