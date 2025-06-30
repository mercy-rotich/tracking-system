import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const EditUserModal = ({ user, onClose, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    department: '',
    enabled: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        enabled: user.status === 'active'
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
   
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const token = authService.getToken();
      
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        return;
      }

     
      const updatePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        department: formData.department.trim() || null,
        enabled: formData.enabled
      };

      console.log('🔄 Updating user:', user.id, updatePayload);

      
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('✅ User updated successfully:', updatedUser);
        
       
        const formattedUser = {
          ...user,
          firstName: updatePayload.firstName,
          lastName: updatePayload.lastName,
          email: updatePayload.email,
          username: updatePayload.username,
          phoneNumber: updatePayload.phoneNumber,
          department: updatePayload.department,
          status: updatePayload.enabled ? 'active' : 'inactive',
          avatar: `${updatePayload.firstName[0]}${updatePayload.lastName[0]}`,
          updatedAt: new Date().toISOString()
        };
        
        onUpdateUser(formattedUser);
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Update failed:', errorData);
        alert(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error(' Network error updating user:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

 
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isLoading]);

  return (
    <div 
      className="user-management-modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="user-management-modal-container">
        <div className="user-management-modal-header">
          <h2>Edit User</h2>
          <button 
            className="user-management-modal-close" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="user-management-modal-body">
          <form onSubmit={handleSubmit} className="user-management-modal-form">
            <div className="user-management-form-row">
              <div className="user-management-form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.firstName && (
                  <span className="user-management-error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="user-management-form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  disabled={isLoading}
                  required
                />
                {errors.lastName && (
                  <span className="user-management-error-message">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="user-management-form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <span className="user-management-error-message">{errors.email}</span>
              )}
            </div>

            <div className="user-management-form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
                disabled={isLoading}
                required
              />
              {errors.username && (
                <span className="user-management-error-message">{errors.username}</span>
              )}
            </div>

            <div className="user-management-form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Optional"
              />
            </div>

            <div className="user-management-form-group">
              <label htmlFor="department">Department/School</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Optional"
              />
            </div>

            <div className="user-management-form-group">
              <div className="user-management-checkbox-group">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="enabled">User is active</label>
              </div>
            </div>
          </form>
        </div>

        <div className="user-management-modal-actions">
          <button
            type="button"
            className="user-management-btn user-management-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="user-management-btn user-management-btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Update User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;