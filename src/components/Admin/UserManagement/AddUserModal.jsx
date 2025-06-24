import React, { useState } from 'react';
import authService from '../../../services/authService';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

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
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const getAuthToken = () => {
    return authService.getToken();
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      school: '',
      roles: []
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      console.log('🎫 Using token for API call:', token ? `${token.substring(0, 20)}...` : 'null');

      // Prepare API payload (matching the expected format from dashboard overview)
      const apiPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      console.log('📤 Sending user data:', apiPayload);

      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload)
      });

      console.log('📡 API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ User created successfully:', result);
        
        showNotification('User created successfully! Login details have been sent to their email.', 'success');
        
        // Call the parent callback with the created user data
        // The result should contain the user data in result.data
        if (onAddUser && result.data) {
          console.log('🔄 Calling onAddUser with:', result.data);
          onAddUser(result.data);
        } else if (onAddUser && result) {
          // Fallback if data is at root level
          console.log('🔄 Calling onAddUser with result:', result);
          onAddUser(result);
        } else {
          console.warn('⚠️ No user data returned from API or no callback provided');
        }
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1500); // Reduced delay for better UX
        
      } else {
        const errorData = await response.json();
        console.error('❌ API error response:', errorData);
        
        if (response.status === 401) {
          showNotification('Session expired. Please log in again.', 'error');
        } else if (response.status === 409) {
          showNotification('Username or email already exists. Please choose different values.', 'error');
        } else {
          showNotification(errorData.message || 'Failed to create user. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('💥 Error creating user:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCloseModal();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{notification.message}</span>
              <button 
                className="notification-close"
                onClick={() => setNotification({ show: false, message: '', type: '' })}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        <div className="modal-header">
          <h2 className="modal-title">Add New User</h2>
          <button 
            className="modal-close" 
            onClick={handleCloseModal}
            disabled={isLoading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={errors.firstName ? 'form-error' : ''}
                value={formData.firstName}
                onChange={handleInputChange}
                required
                placeholder="Enter first name"
                disabled={isLoading}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={errors.lastName ? 'form-error' : ''}
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Enter last name"
                disabled={isLoading}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={errors.username ? 'form-error' : ''}
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Enter username"
              disabled={isLoading}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={errors.email ? 'form-error' : ''}
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter email address"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={errors.password ? 'form-error' : ''}
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password"
                minLength="8"
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              <small className="form-help">Password must be at least 8 characters long</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={errors.confirmPassword ? 'form-error' : ''}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm password"
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-cancel"
              onClick={handleCloseModal}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Add User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;