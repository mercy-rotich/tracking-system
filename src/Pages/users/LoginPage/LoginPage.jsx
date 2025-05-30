import React, { useState } from 'react';
import './LoginPage.css';
import logo_image from '../../../assets/logo.jpg'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setIsLoading(true);
    setError('');

    try {
      // TODO: Replace with actual API call to Java backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Handle successful login
      // Store session token
      localStorage.setItem('sessionToken', data.token);
      
      // Redirect to dashboard or handle navigation
      window.location.href = '/dashboard';
      
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
                  <img src={logo_image} alt="" />
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
                <img src={logo_image} alt="" />
              </div>
            </div>
            <div className="mobile-university-info">
              <h1 className="mobile-university-name">Meru University</h1>
              <p className="mobile-university-subtitle">of Science and Technology</p>
            </div>
          </div>
          
          <h2 className="form-title">Sign In</h2>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your username or email"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
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
                onClick={handleSubmit}
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Sign In
                  </>
                )}
              </button>
            </div>
          </div>
          
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
              <i className="fas fa-info-circle info-icon"></i>
              <span>Use your university credentials to access the Curriculum Tracking System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;