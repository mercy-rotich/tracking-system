import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import passwordResetService from '../../services/passwordResetService';
import { validatePasswordResetForm } from '../../utils/validUtils';
import logo_image from '../../assets/logo.jpg';
import '../../Pages/users/LoginPage/LoginPage.css';

const ResetPasswordPage = ({ token, email, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('🔐 Starting password reset...');

    // Validate form
    const validation = validatePasswordResetForm(formData.newPassword, formData.confirmPassword);
    
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      console.log('❌ Form validation failed:', errorMessage);
      setError(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      console.log('📡 Calling resetPassword...');
      const result = await passwordResetService.resetPassword(token, formData.newPassword);
      console.log('✅ Password reset successful:', result);
      
      
      onSuccess();
    } catch (error) {
      console.error('❌ Password reset error:', error);
      const errorMessage = error.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="branding-section">
          <div className="branding-overlay"></div>
          <div className="branding-content">
            <div className="university-header">
              <div className="logo-container">
                <div className="logo-circle">
                  <img src={logo_image} alt="Meru University Logo" />
                </div>
              </div>
              <div className="university-info">
                <h1 className="university-name">Meru University</h1>
                <p className="university-subtitle">of Science and Technology</p>
              </div>
            </div>
            
            <h2 className="system-title">Create New Password</h2>
            <p className="system-description">
              Choose a strong, secure password for your account.
            </p>
          </div>
        </div>
        
        <div className="form-section">
          <div className="mobile-header">
            <div className="mobile-logo-container">
              <div className="mobile-logo-circle">
                <img src={logo_image} alt="Meru University Logo" />
              </div>
            </div>
            <div className="mobile-university-info">
              <h1 className="mobile-university-name">Meru University</h1>
              <p className="mobile-university-subtitle">of Science and Technology</p>
            </div>
          </div>
          
          <h2 className="form-title">Set New Password</h2>
          <p className="form-subtitle">
            Creating new password for <strong>{email}</strong>
          </p>
          
          {error && (
            <div className="error-message" role="alert">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                New Password *
              </label>
              <div className="password-input-container">
                <input
                  type={showPasswords.newPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`form-input ${error && !formData.newPassword.trim() ? 'error' : ''}`}
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  disabled={isLoading}
                >
                  {showPasswords.newPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password *
              </label>
              <div className="password-input-container">
                <input
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input ${error && !formData.confirmPassword.trim() ? 'error' : ''}`}
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  disabled={isLoading}
                >
                  {showPasswords.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="submit-group">
              <button
                type="submit"
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="back-to-login">
            <Link to="/admin/login" className="back-link">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export  default ResetPasswordPage ;