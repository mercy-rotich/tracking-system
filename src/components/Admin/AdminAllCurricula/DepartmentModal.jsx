
import React, { useState, useEffect } from 'react';

const DepartmentModal = ({ 
  isOpen, 
  isEdit, 
  department, 
  schools = [],
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    schoolId: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        schoolId: department.schoolId ? department.schoolId.toString() : ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        schoolId: ''
      });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [isEdit, department, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Department name must be at least 2 characters';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'Department code must be at least 2 characters';
    } else if (formData.code.trim().length > 10) {
      newErrors.code = 'Department code must be 10 characters or less';
    }
    
    if (!formData.schoolId) {
      newErrors.schoolId = 'School is required';
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
    
    try {
     
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        schoolId: parseInt(formData.schoolId, 10)
      };
      
      await onSave(submitData);
    } catch (error) {
      console.error('Error saving department:', error);
     
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
            {isEdit ? 'Edit Department' : 'Add New Department'}
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
            {/* Department Name Field */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., Computer Science"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff'
                }}
                onFocus={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#00BF63';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.name) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
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

            {/* Department Code Field */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Department Code *
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g., CS, IT, BBA"
                value={formData.code}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${errors.code ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff',
                  textTransform: 'uppercase'
                }}
                onFocus={(e) => {
                  if (!errors.code) {
                    e.target.style.borderColor = '#00BF63';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.code) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
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

            {/* School Selection Field */}
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
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: isSubmitting ? '#f9fafb' : '#ffffff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                onFocus={(e) => {
                  if (!errors.schoolId) {
                    e.target.style.borderColor = '#00BF63';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.schoolId) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    School of {school.name}
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

            {/* Information Section */}
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
                Department Information
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '1.25rem',
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                <li>Department codes should be unique and descriptive</li>
                <li>Use standard abbreviations (e.g., CS for Computer Science)</li>
                <li>Department names should be clear and official</li>
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
              disabled={isSubmitting || schools.length === 0}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {isEdit ? 'Update Department' : 'Create Department'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;