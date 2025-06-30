import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import passwordResetService from '../../services/passwordResetService';
import { validateEmail } from '../../utils/validUtils';
import logo_image from '../../assets/logo.jpg';
import '../../Pages/users/LoginPage/LoginPage.css';

const ForgotPasswordPage = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting password reset for:', email);
      const result = await passwordResetService.initiatePasswordReset(email);
      
      console.log('✅ Password reset result:', result);
      
      if (result && result.success) {
        console.log('🎉 Password reset initiated successfully');
        
        onSuccess(email);
      } else {
        setError('Unexpected response format. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
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
            
            <h2 className="system-title">Password Reset</h2>
            <p className="system-description">
              Secure password recovery for the Curriculum Tracking System.
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
          
          <h2 className="form-title">Reset Your Password</h2>
          <p className="form-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          {error && (
            <div className="error-message" role="alert">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <div className="input-icon-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`form-input with-icon ${error && !email.trim() ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Reset Link
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


export default ForgotPasswordPage;