import React, { useState, useEffect } from 'react';
import curriculumService from '../../../services/curriculumService';
import departmentService from '../../../services/departmentService';

const CurriculumModal = ({ 
  isOpen, 
  isEdit, 
  curriculum, 
  schools = [], 
  programs = [], 
  departments = [], 
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    durationSemesters: '',
    schoolId: '',
    departmentId: '',
    academicLevelId: '',
    effectiveDate: '',
    expiryDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

 
  const [allDepartments, setAllDepartments] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState('');

  const academicLevelOptions = [
    { id: 1, label: "Bachelor's Degree", programId: 'bachelor' },
    { id: 2, label: "Master's Degree", programId: 'masters' },
    { id: 3, label: "PhD Program", programId: 'phd' }
  ];

 
  useEffect(() => {
    if (isOpen) {
      loadAllDepartments();
    }
  }, [isOpen]);

  // Load departments for specific school when school changes
  useEffect(() => {
    if (formData.schoolId && formData.schoolId !== '') {
      loadDepartmentsForSchool(formData.schoolId);
    } else {
      setAvailableDepartments(allDepartments);
    }
  }, [formData.schoolId, allDepartments]);

 
  useEffect(() => {
    if (isEdit && curriculum) {
      setFormData({
        name: curriculum.title || '',
        code: curriculum.code || '',
        durationSemesters: curriculum.durationSemesters || '',
        schoolId: curriculum.schoolId || '',
        departmentId: curriculum.departmentId || '',
        academicLevelId: curriculumService.mapProgramToAcademicLevel(curriculum.programId) || 1,
        effectiveDate: curriculum.effectiveDate || '',
        expiryDate: curriculum.expiryDate || ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        durationSemesters: '',
        schoolId: '',
        departmentId: '',
        academicLevelId: '',
        effectiveDate: '',
        expiryDate: ''
      });
    }
    setErrors({});
    setSubmitError('');
  }, [isEdit, curriculum, isOpen]);

  const loadAllDepartments = async () => {
    if (isDepartmentsLoading) return;

    setIsDepartmentsLoading(true);
    setDepartmentsError('');
    
    try {
      console.log('🔄 Loading all departments for curriculum modal...');
      
      // Load all departments using the department service
      const departments = await departmentService.getAllDepartmentsSimple();
      
      console.log('✅ Loaded departments for modal:', departments);
      setAllDepartments(departments);
      setAvailableDepartments(departments);
      
      if (departments.length === 0) {
        setDepartmentsError('No departments available. Please contact your administrator.');
      }
      
    } catch (error) {
      console.error('❌ Failed to load departments for modal:', error);
      setDepartmentsError(`Failed to load departments: ${error.message}`);
      
      // Fallback 
      if (departments && departments.length > 0) {
        console.log('🔄 Using fallback departments from props');
        setAllDepartments(departments);
        setAvailableDepartments(departments);
        setDepartmentsError('');
      }
    } finally {
      setIsDepartmentsLoading(false);
    }
  };

  const loadDepartmentsForSchool = async (schoolId) => {
    if (!schoolId || schoolId === 'all') {
      setAvailableDepartments(allDepartments);
      return;
    }

    try {
      console.log(`🔄 Loading departments for school: ${schoolId}`);
      
      // Load departments for specific school
      const schoolDepartments = await departmentService.getDepartmentsBySchool(schoolId, 0, 1000);
      
      console.log(`✅ Loaded ${schoolDepartments.length} departments for school ${schoolId}`);
      setAvailableDepartments(schoolDepartments);
      
     
      if (formData.departmentId) {
        const isDepartmentAvailable = schoolDepartments.some(dept => dept.id?.toString() === formData.departmentId?.toString());
        if (!isDepartmentAvailable) {
          setFormData(prev => ({ ...prev, departmentId: '' }));
        }
      }
      
    } catch (error) {
      console.error(`❌ Failed to load departments for school ${schoolId}:`, error);
      
      // Fallback to filtering all departments by school
      const filteredDepartments = allDepartments.filter(dept => 
        dept.schoolId?.toString() === schoolId?.toString()
      );
      
      if (filteredDepartments.length > 0) {
        console.log(`🔄 Using filtered departments for school ${schoolId}`);
        setAvailableDepartments(filteredDepartments);
      } else {
        console.log(`⚠️ No departments found for school ${schoolId}, using all departments`);
        setAvailableDepartments(allDepartments);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Curriculum name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Curriculum name must be at least 3 characters';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Curriculum code is required';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'Curriculum code must be at least 2 characters';
    }
    
    if (!formData.durationSemesters) {
      newErrors.durationSemesters = 'Duration is required';
    } else if (parseInt(formData.durationSemesters) < 1 || parseInt(formData.durationSemesters) > 20) {
      newErrors.durationSemesters = 'Duration must be between 1 and 20 semesters';
    }
    
    if (!formData.schoolId) {
      newErrors.schoolId = 'School is required';
    }
    
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    
    if (!formData.academicLevelId) {
      newErrors.academicLevelId = 'Academic level is required';
    }
    
    // Date validation
    if (formData.effectiveDate && formData.expiryDate) {
      const effective = new Date(formData.effectiveDate);
      const expiry = new Date(formData.expiryDate);
      if (effective >= expiry) {
        newErrors.expiryDate = 'Expiry date must be after effective date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      
      const apiData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        durationSemesters: parseInt(formData.durationSemesters),
        schoolId: parseInt(formData.schoolId),
        departmentId: parseInt(formData.departmentId),
        academicLevelId: parseInt(formData.academicLevelId)
      };

      // Add optional dates if provided
      if (formData.effectiveDate) {
        apiData.effectiveDate = new Date(formData.effectiveDate).toISOString();
      }
      if (formData.expiryDate) {
        apiData.expiryDate = new Date(formData.expiryDate).toISOString();
      }

      let result;
      if (isEdit) {
        result = await curriculumService.updateCurriculum(curriculum.id, apiData);
      } else {
        result = await curriculumService.createCurriculum(apiData);
      }

      console.log('✅ Curriculum operation successful:', result);

      // Call the onSave callback
      if (onSave) {
        await onSave(result.data || result);
      }

      
      onClose();

    } catch (error) {
      console.error('❌ Error saving curriculum:', error);
      setSubmitError(error.message || 'Failed to save curriculum. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Edit Curriculum' : 'Create New Curriculum'}
          </h2>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem' }}>
            {/* Submit Error Display */}
            {submitError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#dc2626',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
                {submitError}
              </div>
            )}

            {/* Departments Loading Error */}
            {departmentsError && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#d97706',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '0.5rem' }}></i>
                {departmentsError}
                <button 
                  type="button"
                  onClick={loadAllDepartments}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  disabled={isDepartmentsLoading}
                >
                  {isDepartmentsLoading ? 'Loading...' : 'Retry'}
                </button>
              </div>
            )}

            {/* Curriculum Name */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Curriculum Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Bachelor of Science in Computer Science"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                }}
              />
              {errors.name && (
                <span style={{ 
                  color: '#ef4444', 
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Two column layout for Code and Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Curriculum Code */}
              <div className="form-group">
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Curriculum Code *
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g., BCS115"
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.code ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff',
                    textTransform: 'uppercase'
                  }}
                />
                {errors.code && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {errors.code}
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="form-group">
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Duration (Semesters) *
                </label>
                <input
                  type="number"
                  name="durationSemesters"
                  placeholder="8"
                  min="1"
                  max="20"
                  value={formData.durationSemesters}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.durationSemesters ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                  }}
                />
                {errors.durationSemesters && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {errors.durationSemesters}
                  </span>
                )}
              </div>
            </div>

            {/* School Selection */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                School *
              </label>
              <select
                name="schoolId"
                value={formData.schoolId}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${errors.schoolId ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                }}
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.actualId || school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              {errors.schoolId && (
                <span style={{ 
                  color: '#ef4444', 
                  fontSize: '0.75rem',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {errors.schoolId}
                </span>
              )}
            </div>

            {/* Two column layout for Department and Academic Level */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Department Selection */}
              <div className="form-group">
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Department *
                  {isDepartmentsLoading && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                      <i className="fas fa-spinner fa-spin"></i> Loading...
                    </span>
                  )}
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={isSubmitting || isDepartmentsLoading || !formData.schoolId}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.departmentId ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isSubmitting || isDepartmentsLoading || !formData.schoolId ? '#f9fafb' : '#ffffff'
                  }}
                >
                  <option value="">
                    {!formData.schoolId 
                      ? 'Select School First' 
                      : isDepartmentsLoading 
                        ? 'Loading Departments...' 
                        : availableDepartments.length === 0 
                          ? 'No Departments Available'
                          : 'Select Department'
                    }
                  </option>
                  {availableDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {errors.departmentId}
                  </span>
                )}
                {availableDepartments.length === 0 && formData.schoolId && !isDepartmentsLoading && (
                  <span style={{ 
                    color: '#d97706', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    No departments found for this school. Please contact your administrator.
                  </span>
                )}
              </div>

              {/* Academic Level Selection */}
              <div className="form-group">
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Academic Level *
                </label>
                <select
                  name="academicLevelId"
                  value={formData.academicLevelId}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.academicLevelId ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                  }}
                >
                  <option value="">Select Academic Level</option>
                  {academicLevelOptions.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errors.academicLevelId && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {errors.academicLevelId}
                  </span>
                )}
              </div>
            </div>

            {/* Optional Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Effective Date */}
              <div className="form-group">
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Effective Date
                </label>
                <input
                  type="date"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.effectiveDate ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                  }}
                />
                {errors.effectiveDate && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {errors.effectiveDate}
                  </span>
                )}
              </div>

              {/* Expiry Date */}
              <div className="form-group">
                <label style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${errors.expiryDate ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                  }}
                />
                {errors.expiryDate && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}>
                    {errors.expiryDate}
                  </span>
                )}
              </div>
            </div>

            {/* Department Info Section */}
            {formData.schoolId && availableDepartments.length > 0 && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1e40af',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-info-circle"></i>
                  Available Departments ({availableDepartments.length})
                </h4>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#1e40af',
                  maxHeight: '60px',
                  overflowY: 'auto'
                }}>
                  {availableDepartments.slice(0, 6).map((dept, index) => (
                    <span key={dept.id}>
                      {dept.name}
                      {index < Math.min(availableDepartments.length - 1, 5) ? ', ' : ''}
                      {index === 5 && availableDepartments.length > 6 ? ` and ${availableDepartments.length - 6} more...` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Info Section */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                <i className="fas fa-info-circle" style={{ marginRight: '0.5rem', color: '#6b7280' }}></i>
                Curriculum Information
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '1.25rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <li>Curriculum codes will be automatically converted to uppercase</li>
                <li>Duration must be between 1 and 20 semesters</li>
                <li>Effective and expiry dates are optional but recommended</li>
                <li>All curricula start with "PENDING" status and require approval</li>
                <li>Departments are loaded automatically based on the selected school</li>
              </ul>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || isDepartmentsLoading}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {isEdit ? 'Update Curriculum' : 'Create Curriculum'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CurriculumModal;