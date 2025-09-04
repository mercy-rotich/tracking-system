import React, { useState, useRef } from 'react';
import './DocumentUploadModal.css';

const DocumentUploadModal = ({ curriculum, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxFiles = 10; // Maximum files per upload

  // Document type options
  const documentTypes = [
    { value: 'SUPPORTING_DOCUMENTS', label: 'Supporting Documents' },
    { value: 'CURRICULUM_PROPOSAL', label: 'Curriculum Proposal' },
    { value: 'APPROVAL_LETTER', label: 'Approval Letter' },
    { value: 'REVIEW_FEEDBACK', label: 'Review Feedback' },
    { value: 'FINAL_DOCUMENT', label: 'Final Document' }
  ];

  const [selectedDocumentType, setSelectedDocumentType] = useState('SUPPORTING_DOCUMENTS');

  const handleFileSelect = (selectedFiles) => {
    setError('');
    
    const fileArray = Array.from(selectedFiles);
    
    // Check file count
    if (files.length + fileArray.length > maxFiles) {
      setError(`Cannot upload more than ${maxFiles} files at once. Currently selected: ${files.length}`);
      return;
    }

    const validFiles = fileArray.filter(file => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed for file: ${file.name}`);
        return false;
      }
      
      // Check file size
      if (file.size > maxFileSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      // Check for duplicates
      if (files.some(existingFile => 
        existingFile.name === file.name && 
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
      )) {
        setError(`File ${file.name} is already selected`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      console.log('📎 Files selected:', validFiles.map(f => f.name));
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
    setError(''); // Clear any errors when removing files
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
    if (type.includes('word') || type.includes('document')) return 'fas fa-file-word';
    if (type.includes('sheet') || type.includes('excel')) return 'fas fa-file-excel';
    if (type.includes('image')) return 'fas fa-file-image';
    return 'fas fa-file-alt';
  };

  const getFileIconColor = (type) => {
    if (type.includes('pdf')) return '#dc2626';
    if (type.includes('word') || type.includes('document')) return '#2563eb';
    if (type.includes('sheet') || type.includes('excel')) return '#059669';
    if (type.includes('image')) return '#7c3aed';
    return '#6b7280';
  };

  const getCurrentStageNumber = () => {
    const stageMapping = {
      'initiation': 1,
      'school_board': 2,
      'dean_committee': 3,
      'senate': 4,
      'qa_review': 5,
      'vice_chancellor': 6,
      'cue_review': 7,
      'site_inspection': 8
    };
    
    const currentStage = curriculum.selectedStage || curriculum.currentStage;
    return stageMapping[currentStage] || 1;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setUploadedDocuments([]);

    try {
      console.log('🔄 Starting document upload...');
      
      
      const { default: curriculumTrackingService } = await import('../../../services/curriculumTrackingService');
      
      const uploadData = {
        files: files,
        trackingId: curriculum.id || curriculum.trackingId,
        stepId: getCurrentStageNumber(),
        documentType: selectedDocumentType,
        descriptions: files.map(file => `${file.name} - ${selectedDocumentType.toLowerCase().replace('_', ' ')}`)
      };

      console.log('📤 Upload data:', {
        ...uploadData,
        files: uploadData.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      const result = await curriculumTrackingService.uploadBatchDocuments(uploadData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        console.log('✅ Upload successful:', result.data);
        setUploadedDocuments(result.data);
        
        // Call the parent callback with the uploaded documents
        if (onUpload) {
          onUpload(result.data);
        }
        
        // Small delay to show 100% progress, then close
        setTimeout(() => {
          onClose();
        }, 1000);
        
      } else {
        throw new Error(result.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error.message || 'Failed to upload files. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const currentStage = curriculum.selectedStage || curriculum.currentStage;
  const stageTitle = currentStage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const getStageGuidelines = () => {
    const guidelines = {
      'initiation': [
        'Curriculum proposal document',
        'Detailed rationale and justification', 
        'Market research or needs analysis',
        'Preliminary course structure',
        'Resource requirements assessment'
      ],
      'school_board': [
        'School board review comments',
        'Duplicate check documentation',
        'Revised proposal (if applicable)',
        'Stakeholder feedback compilation'
      ],
      'dean_committee': [
        'Academic alignment assessment',
        'Resource requirement analysis',
        'Faculty qualification review',
        'Committee feedback and recommendations',
        'Curriculum mapping documents'
      ],
      'senate': [
        'Senate review documentation',
        'Academic standards compliance',
        'Quality assurance checklist',
        'Peer review feedback'
      ],
      'qa_review': [
        'Quality assurance documentation',
        'Standards compliance certificates',
        'External reviewer feedback',
        'Quality metrics and benchmarks'
      ],
      'vice_chancellor': [
        'Executive review summary',
        'Final approval documentation',
        'CUE submission preparation',
        'Implementation timeline'
      ],
      'cue_review': [
        'CUE submission documents',
        'External evaluation reports',
        'Compliance certificates',
        'Site preparation documentation'
      ],
      'site_inspection': [
        'Site inspection reports',
        'Infrastructure documentation',
        'Final accreditation materials',
        'Implementation evidence'
      ]
    };

    return guidelines[currentStage] || [
      'Stage-specific documentation required',
      'Review comments and feedback',
      'Supporting materials as needed'
    ];
  };

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
          <div className="tracking-upload-info">
            <div className="tracking-flex tracking-items-center tracking-gap-3">
              <i className="fas fa-book"></i>
              <div>
                <div>{curriculum.title}</div>
                <div>{curriculum.trackingId} • {curriculum.school}</div>
              </div>
            </div>
          </div>

          {/* Document Type Selection */}
          <div className="tracking-form-group tracking-mb-4">
            <label className="tracking-form-label">Document Type</label>
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="tracking-form-control"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="tracking-file-error tracking-mb-4">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Upload Success Display */}
          {uploadedDocuments.length > 0 && (
            <div className="tracking-upload-success tracking-mb-4">
              <i className="fas fa-check-circle"></i>
              Successfully uploaded {uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''}!
            </div>
          )}

          {/* Upload Area */}
          <div className="tracking-upload-section">
            <div
              className={`tracking-upload-dropzone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <i className={`fas ${uploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'}`}></i>
              <h4>
                {uploading ? `Uploading... ${Math.round(uploadProgress)}%` :
                 dragActive ? 'Drop files here' : 'Upload Documents'}
              </h4>
              <p>
                {uploading ? 'Please wait while we upload your files' :
                 'Drag and drop files here, or click to select files'}
              </p>
              {!uploading && (
                <button 
                  className="tracking-btn tracking-btn-primary"
                  type="button"
                >
                  <i className="fas fa-folder-open"></i>
                  Select Files
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                style={{ display: 'none' }}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="tracking-upload-progress tracking-mt-3">
                <div className="tracking-flex tracking-items-center tracking-justify-between tracking-mb-2">
                  <span>Uploading {files.length} file{files.length !== 1 ? 's' : ''}...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="tracking-progress-bar">
                  <div 
                    className="tracking-progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* File Type Info */}
            <div className="tracking-upload-info tracking-mt-3">
              <div>
                <strong>Supported formats:</strong> PDF, Word documents, Excel files, Images (JPG, PNG, GIF)
                <br />
                <strong>Maximum file size:</strong> 10MB per file • <strong>Maximum files:</strong> {maxFiles} files per upload
                <br />
                <strong>Selected:</strong> {files.length}/{maxFiles} files
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="tracking-selected-files tracking-mb-4">
              <h5>
                <i className="fas fa-files"></i>
                Selected Files ({files.length})
              </h5>
              
              <div className="tracking-files-list">
                {files.map((file, index) => (
                  <div key={index} className="tracking-file-item">
                    <div className="tracking-file-info">
                      <i 
                        className={getFileIcon(file.type)}
                        style={{ color: getFileIconColor(file.type) }}
                      ></i>
                      <div>
                        <div>{file.name}</div>
                        <div>{formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}</div>
                      </div>
                    </div>
                    
                    <button
                      className="tracking-btn tracking-btn-outline tracking-btn-sm"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage Guidelines */}
          <div className="tracking-stage-guidelines">
            <h5>
              <i className="fas fa-info-circle"></i>
              {stageTitle} Stage Requirements
            </h5>
            <div>
              <ul>
                {getStageGuidelines().map((guideline, index) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ul>
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
            {uploading ? 'Cancel' : 'Close'}
          </button>
          
          <button 
            className="tracking-btn tracking-btn-primary"
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Uploading... {Math.round(uploadProgress)}%
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