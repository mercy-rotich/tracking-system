import React, { useState, useRef } from 'react';
import documentManagementService, { DOCUMENT_TYPES, DOCUMENT_TYPE_DISPLAY_NAMES } from '../../../../services/tracking/DocumentManagementService';
import './DocumentUploadModal.css';

const getStepIdFromStage = (stageName) => {
  
  const stageToStepMapping = {
    'initiation': 1,
    'IDEATION': 1,
    'school_board': 2,
    'SCHOOL_BOARD_APPROVAL': 2,
    'dean_committee': 3,
    'DEAN_APPROVAL': 3,
    'senate': 4,
    'SENATE_APPROVAL': 4,
    'qa_review': 5,
    'QA_REVIEW': 5,
    'vice_chancellor': 6,
    'VICE_CHANCELLOR_APPROVAL': 6,
    'cue_review': 7,
    'CUE_REVIEW': 7,
    'site_inspection': 8,
    'SITE_INSPECTION': 8
  };
  
  return stageToStepMapping[stageName] || 1; // Default to 1 if not found
};
const DocumentUploadModal = ({ curriculum, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES.SUPPORTING_DOCUMENTS);
  const [description, setDescription] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    
    
    const validation = documentManagementService.validator.validateFiles(fileArray);
    
    if (validation.isValid) {
      setFiles(prev => [...prev, ...validation.validFiles]);
      setValidationErrors([]);
    } else {
      // Show validation errors
      const errors = validation.results
        .filter(result => !result.isValid)
        .map(result => result.errors)
        .flat();
      setValidationErrors(errors);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('word')) return 'fas fa-file-word';
    if (type.includes('image')) return 'fas fa-file-image';
    if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
    return 'fas fa-file-alt';
  };

  const getFileIconColor = (type) => {
    if (type.includes('pdf')) return '#dc2626';
    if (type.includes('word')) return '#2563eb';
    if (type.includes('image')) return '#059669';
    if (type.includes('excel') || type.includes('sheet')) return '#059669';
    return 'var(--tracking-text-muted)';
  };
  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }
  
    setUploading(true);
    setUploadProgress({});
  
    try {
      
      console.log('📤 Passing files to parent handler:', files.length);
      
      // Create progress tracking
      const progress = {};
      files.forEach(file => {
        progress[file.name] = 50; // Show some progress
      });
      setUploadProgress(progress);
      
      // Call parent's onUpload callback with the files
      
      await onUpload(files);
      
      
      const finalProgress = {};
      files.forEach(file => {
        finalProgress[file.name] = 100;
      });
      setUploadProgress(finalProgress);
      
     
  
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Failed to upload files: ${error.message}`);
      setUploadProgress({});
      setUploading(false);
    }
  };
  const currentStage = curriculum.selectedStage || curriculum.currentStage;
  const stageTitle = currentStage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Get supported file types info
  const supportedTypes = documentManagementService.getSupportedFileTypes();

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className="fas fa-upload"></i>
            Upload Documents - {stageTitle}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="tracking-modal-body">
          {/* Curriculum Info */}
          <div className="tracking-upload-info tracking-upload-info-section">
            <div className="tracking-upload-info-content">
              <i className="fas fa-book"></i>
              <div className="tracking-upload-curriculum-details">
                <div className="tracking-upload-curriculum-title">{curriculum.title}</div>
                <div className="tracking-upload-curriculum-meta">
                  {curriculum.trackingId} • {curriculum.school}
                </div>
              </div>
            </div>
          </div>

          {/* Document Type Selection */}
          <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
            <label className="tracking-form-label">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="tracking-form-control"
            >
              {Object.entries(DOCUMENT_TYPE_DISPLAY_NAMES).map(([key, displayName]) => (
                <option key={key} value={key}>
                  {displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
            <label className="tracking-form-label">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="tracking-form-control"
              rows="2"
              placeholder="Brief description of the documents being uploaded..."
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="tracking-file-error" style={{ marginBottom: '1rem' }}>
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>File Validation Errors:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="tracking-upload-section tracking-upload-dropzone-section">
            <div
              className={`tracking-upload-dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt tracking-upload-icon"></i>
              <h4 className="tracking-upload-title">
                {dragActive ? 'Drop files here' : 'Upload Documents'}
              </h4>
              <p className="tracking-upload-description">
                Drag and drop files here, or click to select files
              </p>
              <button 
                className="tracking-btn tracking-btn-primary"
                type="button"
              >
                <i className="fas fa-folder-open"></i>
                Select Files
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="tracking-upload-file-input"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept={supportedTypes.extensions.join(',')}
              />
            </div>

            {/* File Type Info */}
            <div className="tracking-upload-info tracking-upload-file-info">
              <div className="tracking-upload-file-info-text">
                <strong>Supported formats:</strong> {supportedTypes.extensions.join(', ')}
                <br />
                <strong>Maximum file size:</strong> {supportedTypes.formattedMaxSize}
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="tracking-selected-files tracking-selected-files-section">
              <h5 className="tracking-selected-files-title">
                <i className="fas fa-files"></i>
                Selected Files ({files.length})
              </h5>
              
              <div className="tracking-files-list">
                {files.map((file, index) => (
                  <div 
                    key={index} 
                    className="tracking-file-item"
                  >
                    <div className="tracking-file-info">
                      <i 
                        className={getFileIcon(file.type)}
                        style={{ color: getFileIconColor(file.type) }}
                      ></i>
                      <div className="tracking-file-details">
                        <div className="tracking-file-name">
                          {file.name}
                        </div>
                        <div className="tracking-file-meta">
                          {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </div>
                        {uploadProgress[file.name] !== undefined && (
                          <div className="tracking-file-progress" style={{ marginTop: '0.25rem' }}>
                            <div className="tracking-progress-bar" style={{ height: '4px' }}>
                              <div 
                                className="tracking-progress-fill" 
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                              {uploadProgress[file.name]}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!uploading && (
                      <button
                        className="tracking-btn tracking-btn-outline tracking-btn-sm tracking-file-remove"
                        onClick={() => removeFile(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="tracking-upload-progress tracking-upload-progress-section">
              <div className="tracking-upload-progress-header">
                <i className="fas fa-spinner tracking-btn-loading"></i>
                <span>Uploading {files.length} file{files.length !== 1 ? 's' : ''}...</span>
              </div>
              <div className="tracking-progress-bar">
                <div className="tracking-progress-fill tracking-upload-progress-fill"></div>
              </div>
            </div>
          )}

          {/* Stage Guidelines */}
          <div className="tracking-stage-guidelines">
            <h5 className="tracking-stage-guidelines-title">
              <i className="fas fa-info-circle"></i>
              Stage Requirements
            </h5>
            <div className="tracking-stage-guidelines-content">
              {currentStage === 'initiation' && (
                <ul className="tracking-stage-requirements-list">
                  <li>Curriculum proposal document</li>
                  <li>Detailed rationale and justification</li>
                  <li>Market research or needs analysis</li>
                  <li>Preliminary course structure</li>
                </ul>
              )}
              {currentStage === 'school_board' && (
                <ul className="tracking-stage-requirements-list">
                  <li>School board review comments</li>
                  <li>Duplicate check documentation</li>
                  <li>Revised proposal (if applicable)</li>
                </ul>
              )}
              {currentStage === 'dean_committee' && (
                <ul className="tracking-stage-requirements-list">
                  <li>Academic alignment assessment</li>
                  <li>Resource requirement analysis</li>
                  <li>Faculty qualification review</li>
                  <li>Committee feedback and recommendations</li>
                </ul>
              )}
              {currentStage === 'senate' && (
                <ul className="tracking-stage-requirements-list">
                  <li>Senate meeting minutes</li>
                  <li>Academic senate approval document</li>
                  <li>Any required revisions or amendments</li>
                </ul>
              )}
              {currentStage === 'qa_review' && (
                <ul className="tracking-stage-requirements-list">
                  <li>Quality assurance evaluation report</li>
                  <li>Standards compliance documentation</li>
                  <li>External review reports (if any)</li>
                  <li>QA recommendations and findings</li>
                </ul>
              )}
              {currentStage === 'vice_chancellor' && (
                <ul className="tracking-stage-requirements-list">
                  <li>Executive summary and recommendation</li>
                  <li>Vice Chancellor's approval letter</li>
                  <li>CUE submission documentation</li>
                  <li>Final institutional endorsement</li>
                </ul>
              )}
              {currentStage === 'cue_review' && (
                <ul className="tracking-stage-requirements-list">
                  <li>CUE submission forms and documents</li>
                  <li>External evaluation reports</li>
                  <li>Commission feedback and requirements</li>
                  <li>Response to CUE queries</li>
                </ul>
              )}
              {currentStage === 'site_inspection' && (
                <ul className="tracking-stage-requirements-list">
                  <li>Site inspection reports</li>
                  <li>Final accreditation documents</li>
                  <li>Compliance verification</li>
                  <li>Accreditation certificate</li>
                </ul>
              )}
              {!['initiation', 'school_board', 'dean_committee', 'senate', 'qa_review', 'vice_chancellor', 'cue_review', 'site_inspection'].includes(currentStage) && (
                <ul className="tracking-stage-requirements-list">
                  <li>Stage-specific documentation required</li>
                  <li>Review comments and feedback</li>
                  <li>Supporting materials as needed</li>
                </ul>
              )}
            </div>
          </div>

          {/* Upload Summary */}
          {files.length > 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: 'rgba(0, 214, 102, 0.05)',
              border: '1px solid rgba(0, 214, 102, 0.2)',
              borderRadius: '8px'
            }}>
              <h5 style={{ 
                margin: '0 0 0.5rem 0', 
                color: 'var(--tracking-text-primary)',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="fas fa-check-circle" style={{ color: 'var(--tracking-success)' }}></i>
                Upload Summary
              </h5>
              <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                <strong>{files.length}</strong> file{files.length !== 1 ? 's' : ''} selected for upload
                <br />
                <strong>Document Type:</strong> {DOCUMENT_TYPE_DISPLAY_NAMES[documentType]}
                <br />
                <strong>Stage:</strong> {stageTitle}
                <br />
                <strong>Total Size:</strong> {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                {description && (
                  <>
                    <br />
                    <strong>Description:</strong> {description}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="tracking-modal-footer">
          <button 
            className="tracking-btn tracking-btn-outline"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          
          <button 
            className="tracking-btn tracking-btn-primary"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner tracking-btn-loading"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i>
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;