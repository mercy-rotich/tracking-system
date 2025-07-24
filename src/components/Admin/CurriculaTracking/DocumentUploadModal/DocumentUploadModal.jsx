import React, { useState, useRef } from 'react';
import './DocumentUploadModal.css';

const DocumentUploadModal = ({ curriculum, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not allowed`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
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
    return 'fas fa-file-alt';
  };

  const getFileIconColor = (type) => {
    if (type.includes('pdf')) return '#dc2626';
    if (type.includes('word')) return '#2563eb';
    if (type.includes('image')) return '#059669';
    return 'var(--tracking-text-muted)';
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Convert files to document names 
      const documentNames = files.map(file => file.name);
      onUpload(documentNames);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const currentStage = curriculum.selectedStage || curriculum.currentStage;
  const stageTitle = currentStage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </div>

            {/* File Type Info */}
            <div className="tracking-upload-info tracking-upload-file-info">
              <div className="tracking-upload-file-info-text">
                <strong>Supported formats:</strong> PDF, Word documents, Images (JPG, PNG, GIF)
                <br />
                <strong>Maximum file size:</strong> 10MB per file
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
                          {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      className="tracking-btn tracking-btn-outline tracking-btn-sm tracking-file-remove"
                      onClick={() => removeFile(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
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
                <span>Uploading files...</span>
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
              {!['initiation', 'school_board', 'dean_committee'].includes(currentStage) && (
                <ul className="tracking-stage-requirements-list">
                  <li>Stage-specific documentation required</li>
                  <li>Review comments and feedback</li>
                  <li>Supporting materials as needed</li>
                </ul>
              )}
            </div>
          </div>
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