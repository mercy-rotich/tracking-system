import React, { useState } from 'react';

const AddUserModal = ({ onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    school: '',
    roles: []
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, value]
        : prev.roles.filter(role => role !== value)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      onAddUser(formData);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="user-management-modal user-management-modal-show" onClick={handleBackdropClick}>
      <div className="user-management-modal-backdrop"></div>
      <div className="user-management-modal-content">
        <div className="user-management-modal-header">
          <h3>Add New User</h3>
          <button className="user-management-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="user-management-modal-body">
          <div className="user-management-form-grid">
            <div className="user-management-form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`user-management-form-control ${errors.firstName ? 'user-management-form-control-error' : ''}`}
                value={formData.firstName}
                onChange={handleInputChange}
              />
              {errors.firstName && <span className="user-management-error-message">{errors.firstName}</span>}
            </div>
            <div className="user-management-form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`user-management-form-control ${errors.lastName ? 'user-management-form-control-error' : ''}`}
                value={formData.lastName}
                onChange={handleInputChange}
              />
              {errors.lastName && <span className="user-management-error-message">{errors.lastName}</span>}
            </div>
            <div className="user-management-form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`user-management-form-control ${errors.email ? 'user-management-form-control-error' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <span className="user-management-error-message">{errors.email}</span>}
            </div>
            <div className="user-management-form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                className={`user-management-form-control ${errors.username ? 'user-management-form-control-error' : ''}`}
                value={formData.username}
                onChange={handleInputChange}
              />
              {errors.username && <span className="user-management-error-message">{errors.username}</span>}
            </div>
            <div className="user-management-form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`user-management-form-control ${errors.password ? 'user-management-form-control-error' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
              />
              {errors.password && <span className="user-management-error-message">{errors.password}</span>}
            </div>
            <div className="user-management-form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`user-management-form-control ${errors.confirmPassword ? 'user-management-form-control-error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && <span className="user-management-error-message">{errors.confirmPassword}</span>}
            </div>
            <div className="user-management-form-group">
              <label htmlFor="school">School/Department</label>
              <select
                id="school"
                name="school"
                className="user-management-form-control"
                value={formData.school}
                onChange={handleInputChange}
              >
                <option value="">Select School/Department</option>
                <option value="engineering">School of Engineering</option>
                <option value="medicine">School of Medicine</option>
                <option value="business">School of Business</option>
                <option value="science">School of Science</option>
                <option value="qa">Quality Assurance</option>
                <option value="senate">University Senate</option>
              </select>
            </div>
            <div className="user-management-form-group">
              <label>Assign Roles</label>
              <div className="user-management-checkbox-group">
                <label className="user-management-checkbox-label">
                  <input
                    type="checkbox"
                    value="ADMIN"
                    checked={formData.roles.includes('ADMIN')}
                    onChange={handleRoleChange}
                  />
                  <span className="user-management-checkbox-custom"></span>
                  Admin
                </label>
                <label className="user-management-checkbox-label">
                  <input
                    type="checkbox"
                    value="DEAN"
                    checked={formData.roles.includes('DEAN')}
                    onChange={handleRoleChange}
                  />
                  <span className="user-management-checkbox-custom"></span>
                  Dean of School
                </label>
                <label className="user-management-checkbox-label">
                  <input
                    type="checkbox"
                    value="QA"
                    checked={formData.roles.includes('QA')}
                    onChange={handleRoleChange}
                  />
                  <span className="user-management-checkbox-custom"></span>
                  Quality Assurance
                </label>
                <label className="user-management-checkbox-label">
                  <input
                    type="checkbox"
                    value="DEPT_REP"
                    checked={formData.roles.includes('DEPT_REP')}
                    onChange={handleRoleChange}
                  />
                  <span className="user-management-checkbox-custom"></span>
                  Department Rep
                </label>
                <label className="user-management-checkbox-label">
                  <input
                    type="checkbox"
                    value="SENATE"
                    checked={formData.roles.includes('SENATE')}
                    onChange={handleRoleChange}
                  />
                  <span className="user-management-checkbox-custom"></span>
                  Senate
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="user-management-modal-footer">
          <button type="button" className="user-management-btn user-management-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="user-management-btn user-management-btn-primary" onClick={handleSubmit}>
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;