import React, { useState, useRef, useEffect } from 'react';
import curriculumService from '../../../../services/curriculumService';
import './InitiateCurriculumModal.css';

const InitiateCurriculumModal = ({ onClose, onInitiate }) => {
  const [formData, setFormData] = useState({
    schoolId: '',
    departmentId: '',
    academicLevelId: '',
    proposedCurriculumName: '',
    proposedCurriculumCode: '',
    proposedDurationSemesters: '',
    curriculumDescription: '',
    proposedEffectiveDate: '',
    proposedExpiryDate: '',
    initialNotes: ''
  });
  
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  
  // Supporting data
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicLevels] = useState([
    { id: 1, name: 'Undergraduate' },
    { id: 2, name: 'Graduate' },
    { id: 3, name: 'Postgraduate' }
  ]);
  
  const fileInputRef = useRef(null);

  // Load supporting data
  useEffect(() => {
    const loadSupportingData = async () => {
      try {
        // Load schools
        const schoolsResult = await curriculumService.getAllSchoolsEnhanced();
        setSchools(schoolsResult || []);

        // Load departments
        const departmentsResult = await curriculumService.getDepartmentsFromCurriculums();
        setDepartments(departmentsResult || []);
      } catch (error) {
        console.error('Error loading supporting data:', error);
      }
    };

    loadSupportingData();
  }, []);

  
  const validateForm = () => {
    const newErrors = {};

    
    const requiredFields = {
      schoolId: 'School',
      departmentId: 'Department', 
      academicLevelId: 'Academic Level',
      proposedCurriculumName: 'Curriculum Name',
      proposedCurriculumCode: 'Curriculum Code',
      proposedDurationSemesters: 'Duration (Semesters)',
      curriculumDescription: 'Description'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = `${label} is required`;
      }
    });

    // Specific validations
    if (formData.proposedDurationSemesters && 
        (isNaN(formData.proposedDurationSemesters) || 
         parseInt(formData.proposedDurationSemesters) < 1 || 
         parseInt(formData.proposedDurationSemesters) > 20)) {
      newErrors.proposedDurationSemesters = 'Duration must be between 1 and 20 semesters';
    }

    if (formData.proposedCurriculumCode && 
        formData.proposedCurriculumCode.length < 3) {
      newErrors.proposedCurriculumCode = 'Curriculum code must be at least 3 characters';
    }

    if (formData.proposedCurriculumName && 
        formData.proposedCurriculumName.length < 5) {
      newErrors.proposedCurriculumName = 'Curriculum name must be at least 5 characters';
    }

    if (formData.curriculumDescription && 
        formData.curriculumDescription.length < 10) {
      newErrors.curriculumDescription = 'Description must be at least 10 characters';
    }

    // Date validations
    if (formData.proposedEffectiveDate && formData.proposedExpiryDate) {
      const effective = new Date(formData.proposedEffectiveDate);
      const expiry = new Date(formData.proposedExpiryDate);
      if (expiry <= effective) {
        newErrors.proposedExpiryDate = 'Expiry date must be after effective date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const handleFileSelect = (selectedFiles) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

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

    setDocuments(prev => [...prev, ...validFiles]);
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
    setDocuments(prev => prev.filter((_, i) => i !== index));
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

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onInitiate(formData, documents);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const getFilteredDepartments = () => {
    if (!formData.schoolId) return departments;
    return departments.filter(dept => 
      String(dept.schoolId) === String(formData.schoolId)
    );
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className="fas fa-plus"></i>
            Initiate New Curriculum Tracking
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="tracking-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            
            {/* Basic Information Section */}
            <div className="tracking-form-section" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'var(--tracking-text-primary)', 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--tracking-border)'
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                Basic Information
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {/* School Selection */}
                <div className="tracking-form-group">
                  <label className="tracking-form-label">
                    School *
                  </label>
                  <select
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleInputChange}
                    className={`tracking-form-control ${errors.schoolId ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select School</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.actualId || school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                  {errors.schoolId && (
                    <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.schoolId}
                    </div>
                  )}
                </div>

                {/* Department Selection */}
                <div className="tracking-form-group">
                  <label className="tracking-form-label">
                    Department *
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className={`tracking-form-control ${errors.departmentId ? 'error' : ''}`}
                    required
                    disabled={!formData.schoolId}
                  >
                    <option value="">Select Department</option>
                    {getFilteredDepartments().map(department => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.departmentId}
                    </div>
                  )}
                </div>

                {/* Academic Level */}
                <div className="tracking-form-group">
                  <label className="tracking-form-label">
                    Academic Level *
                  </label>
                  <select
                    name="academicLevelId"
                    value={formData.academicLevelId}
                    onChange={handleInputChange}
                    className={`tracking-form-control ${errors.academicLevelId ? 'error' : ''}`}
                    required
                  >
                    <option value="">Select Academic Level</option>
                    {academicLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                  {errors.academicLevelId && (
                    <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.academicLevelId}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="tracking-form-group">
                  <label className="tracking-form-label">
                    Duration (Semesters) *
                  </label>
                  <input
                    type="number"
                    name="proposedDurationSemesters"
                    value={formData.proposedDurationSemesters}
                    onChange={handleInputChange}
                    className={`tracking-form-control ${errors.proposedDurationSemesters ? 'error' : ''}`}
                    placeholder="e.g., 8"
                    min="1"
                    max="20"
                    required
                  />
                  {errors.proposedDurationSemesters && (
                    <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.proposedDurationSemesters}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Curriculum Details Section */}
            <div className="tracking-form-section" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'var(--tracking-text-primary)', 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--tracking-border)'
              }}>
                <i className="fas fa-graduation-cap" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                Curriculum Details
              </h4>

              {/* Curriculum Name */}
              <div className="tracking-form-group">
                <label className="tracking-form-label">
                  Curriculum Name *
                </label>
                <input
                  type="text"
                  name="proposedCurriculumName"
                  value={formData.proposedCurriculumName}
                  onChange={handleInputChange}
                  className={`tracking-form-control ${errors.proposedCurriculumName ? 'error' : ''}`}
                  placeholder="e.g., Bachelor of Computer Science"
                  required
                />
                {errors.proposedCurriculumName && (
                  <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.proposedCurriculumName}
                  </div>
                )}
              </div>

              {/* Curriculum Code */}
              <div className="tracking-form-group">
                <label className="tracking-form-label">
                  Curriculum Code *
                </label>
                <input
                  type="text"
                  name="proposedCurriculumCode"
                  value={formData.proposedCurriculumCode}
                  onChange={handleInputChange}
                  className={`tracking-form-control ${errors.proposedCurriculumCode ? 'error' : ''}`}
                  placeholder="e.g., BCS-2024-V1"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                {errors.proposedCurriculumCode && (
                  <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.proposedCurriculumCode}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="tracking-form-group">
                <label className="tracking-form-label">
                  Curriculum Description *
                </label>
                <textarea
                  name="curriculumDescription"
                  value={formData.curriculumDescription}
                  onChange={handleInputChange}
                  className={`tracking-form-control ${errors.curriculumDescription ? 'error' : ''}`}
                  rows="4"
                  placeholder="Provide a detailed description of the proposed curriculum..."
                  required
                />
                {errors.curriculumDescription && (
                  <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.curriculumDescription}
                  </div>
                )}
              </div>
            </div>

            {/* Optional Dates Section */}
            <div className="tracking-form-section" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'var(--tracking-text-primary)', 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--tracking-border)'
              }}>
                <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                Timeline (Optional)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {/* Effective Date */}
                <div className="tracking-form-group">
                  <label className="tracking-form-label">
                    Proposed Effective Date
                  </label>
                  <input
                    type="date"
                    name="proposedEffectiveDate"
                    value={formData.proposedEffectiveDate}
                    onChange={handleInputChange}
                    className="tracking-form-control"
                  />
                </div>

                {/* Expiry Date */}
                <div className="tracking-form-group">
                  <label className="tracking-form-label">
                    Proposed Expiry Date
                  </label>
                  <input
                    type="date"
                    name="proposedExpiryDate"
                    value={formData.proposedExpiryDate}
                    onChange={handleInputChange}
                    className={`tracking-form-control ${errors.proposedExpiryDate ? 'error' : ''}`}
                  />
                  {errors.proposedExpiryDate && (
                    <div style={{ color: 'var(--tracking-danger)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {errors.proposedExpiryDate}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Initial Notes */}
            <div className="tracking-form-section" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'var(--tracking-text-primary)', 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--tracking-border)'
              }}>
                <i className="fas fa-sticky-note" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                Initial Notes
              </h4>

              <div className="tracking-form-group">
                <label className="tracking-form-label">
                  Notes (Optional)
                </label>
                <textarea
                  name="initialNotes"
                  value={formData.initialNotes}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  rows="3"
                  placeholder="Add any initial notes or comments about this curriculum..."
                />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="tracking-form-section">
              <h4 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: 'var(--tracking-text-primary)', 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--tracking-border)'
              }}>
                <i className="fas fa-upload" style={{ marginRight: '0.5rem', color: 'var(--tracking-primary)' }}></i>
                Supporting Documents
              </h4>

              {/* Upload Area */}
              <div
                className={`tracking-upload-dropzone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--tracking-border)',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: dragActive ? 'rgba(0, 214, 102, 0.05)' : 'var(--tracking-bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: 'var(--tracking-text-muted)', marginBottom: '1rem' }}></i>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
                  {dragActive ? 'Drop files here' : 'Upload Documents'}
                </h4>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--tracking-text-secondary)' }}>
                  Drag and drop files here, or click to select files
                </p>
                <button type="button" className="tracking-btn tracking-btn-outline">
                  <i className="fas fa-folder-open"></i>
                  Select Files
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginTop: '0.5rem' }}>
                Supported formats: PDF, Word documents, Images (JPG, PNG) • Maximum size: 10MB per file
              </div>

              {/* Selected Files */}
              {documents.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Selected Files ({documents.length})
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {documents.map((file, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          border: '1px solid var(--tracking-border)',
                          borderRadius: '6px',
                          backgroundColor: 'var(--tracking-bg-card)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <i className={getFileIcon(file.type)} style={{ fontSize: '1.125rem', color: 'var(--tracking-primary)' }}></i>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{file.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--tracking-danger)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px'
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="tracking-modal-footer">
            <button 
              type="button"
              className="tracking-btn tracking-btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              className="tracking-btn tracking-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Initiating...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Initiate Tracking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitiateCurriculumModal;