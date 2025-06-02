import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './LoginPage.css';
import logo_image from '../../../assets/logo.jpg';

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      // Navigation will be handled by the ProtectedRoute/AuthContext
      // The user will be automatically redirected to dashboard
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error types
      if (error.message.includes('credentials')) {
        setError('Invalid username or password. Please try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (error.message.includes('server')) {
        setError('Server error. Please try again later or contact support.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="login-container">
        <div className="loading-overlay">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left side - Branding */}
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
            
            <h2 className="system-title">Curriculum Tracking System</h2>
            <p className="system-description">
              Streamline and monitor the curriculum approval process from creation to accreditation.
            </p>
            
            <div className="features-card">
              <h3 className="features-title">Key Features</h3>
              <ul className="features-list">
                <li>Track curriculum status in real-time</li>
                <li>Receive notifications on important updates</li>
                <li>Access comprehensive audit trails</li>
                <li>Manage document versions efficiently</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="form-section">
          {/* Mobile header */}
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
          
          <h2 className="form-title">Sign In</h2>
          
          {error && (
            <div className="error-message" role="alert">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username 
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${error && !formData.username.trim() ? 'error' : ''}`}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                autoComplete="username"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${error && !formData.password.trim() ? 'error' : ''}`}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>
            
            <div className="form-options">
              <div className="checkbox-group">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="form-checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="checkbox-label">
                  Remember me
                </label>
              </div>
              
              <div className="forgot-password">
                <a href="/forgot-password" className="forgot-link">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <div className="submit-group">
              <button
                type="submit"
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
                aria-describedby={isLoading ? "loading-message" : undefined}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                    <span id="loading-message">Signing In...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt" aria-hidden="true"></i>
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="help-section">
            <div className="divider">
              <span className="divider-text">Need Help?</span>
            </div>
            
            <div className="contact-info">
              Contact ICT support at{' '}
              <a href="mailto:ict@must.ac.ke" className="contact-link">
                ict@must.ac.ke
              </a>{' '}
              or call{' '}
              <span className="contact-phone">+254 712 345 678</span>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-content">
              <i className="fas fa-info-circle info-icon" aria-hidden="true"></i>
              <span>Use your university credentials to access the Curriculum Tracking System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;