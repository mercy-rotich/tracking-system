import React, { useState } from 'react';
import { CheckCircle, ArrowLeft, AlertCircle, Mail } from 'lucide-react';
import passwordResetService from '../../services/passwordResetService';
import logo_image from '../../assets/logo.jpg';
import '../../Pages/users/LoginPage/LoginPage.css'

const EmailSentSuccess = ({ email, onBack }) => {
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!canResend) return;

    setResendError('');
    setIsResending(true);

    try {
      console.log('🔄 Resending password reset email for:', email);
      
      const result = await passwordResetService.initiatePasswordReset(email);
      
      if (result && result.success) {
        console.log('✅ Email resent successfully');
        
        setCanResend(false);
        setCountdown(60);
        
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResendError('Failed to resend email. Please try again.');
      }
    } catch (error) {
      console.error('❌ Resend email error:', error);
      setResendError(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Branding Section - Left Side */}
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
            
            <div>
              <h2 className="system-title">Curriculum Tracking System</h2>
              <p className="system-description">
                Streamline and monitor the curriculum approval process from creation to accreditation.
              </p>
            </div>

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
        
        {/* Form Section - Right Side */}
        <div className="form-section">
          {/* Mobile Header - Only visible on small screens */}
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
            
            <h2 className="form-title">Check Your Email</h2>
            <p className="password-reset-success-description">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            
            <div className="password-reset-email-instructions">
              <h4>Didn't receive the email?</h4>
              <ul>
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes for the email to arrive</li>
                <li>Ensure the email account exists in our system</li>
              </ul>
            </div>
            
            {resendError && (
              <div className="password-reset-error-message" role="alert">
                <AlertCircle size={20} />
                {resendError}
              </div>
            )}
            
            <div className="password-reset-resend-section">
              {countdown > 0 ? (
                <p className="password-reset-resend-countdown">
                  You can request another email in {countdown} seconds
                </p>
              ) : (
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || !canResend}
                  className={`submit-button ${isResending ? 'password-reset-submit-button-loading' : ''} password-reset-submit-button-secondary`}
                >
                  {isResending ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={16} />
                      Resend Email
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="password-reset-back-to-login">
              <button
                onClick={onBack}
                className="password-reset-back-link"
              >
                <ArrowLeft size={16} />
                Back to forgot password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSentSuccess;