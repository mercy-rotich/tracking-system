import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import logo_image from '../../assets/logo.jpg';
import '../../Pages/users/LoginPage/LoginPage.css';
import './Passwordreset.css';

const ResetSuccessMessage = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
   
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    
    
    const resetSidebarState = () => {
      const mainContent = document.querySelector('.main-content');
      const toggleBtn = document.querySelector('.sidebar-toggle-btn');
      
      if (mainContent) {
        mainContent.classList.remove('sidebar-collapsed');
      }
      
      if (toggleBtn) {
        toggleBtn.classList.remove('sidebar-collapsed');
        toggleBtn.style.display = 'flex';
        toggleBtn.style.position = 'fixed';
      }
    };

   
    resetSidebarState();
    
   
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
         
          resetSidebarState();
          window.location.href = '/admin/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      resetSidebarState();
    };
  }, []);

  const goToLogin = () => {
   
    localStorage.clear();
    sessionStorage.clear();
    
  
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    
    if (mainContent) {
      mainContent.classList.remove('sidebar-collapsed');
    }
    
    if (toggleBtn) {
      toggleBtn.classList.remove('sidebar-collapsed');
      toggleBtn.style.display = 'flex';
    }
    
    window.location.href = '/admin/login';
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
            
            <h2 className="system-title">Password Reset Successful</h2>
            <p className="system-description">
              Your password has been successfully updated and secured.
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
          
          <div className="password-reset-success-content">
            <div className="password-reset-success-icon-wrapper">
              <CheckCircle className="password-reset-success-icon" size={48} />
            </div>
            
            <h2 className="form-title">Password Reset Successful</h2>
            <p className="password-reset-success-description">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            
            <div className="password-reset-redirect-info">
              <p>
                You will be redirected to the login page in {countdown} seconds...
              </p>
            </div>
            
            <div className="submit-group">
              <button
                onClick={goToLogin}
                className="submit-button"
              >
                <i className="fas fa-sign-in-alt"></i>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccessMessage;