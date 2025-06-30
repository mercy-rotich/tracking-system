
import React, { useState } from 'react';
import { CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import passwordResetService from '../../services/passwordResetService';
import './Passwordreset.css';

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
        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <div className="icon-circle green">
                <CheckCircle className="icon green" />
              </div>
              <h2 className="form-title">Check Your Email</h2>
              <p className="success-text">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              
              <div className="email-instructions">
                <h4>Didn't receive the email?</h4>
                <ul>
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes for the email to arrive</li>
                  <li>Ensure the email account exists in our system</li>
                </ul>
              </div>
              
              {resendError && (
                <div className="error-message" role="alert">
                  <AlertCircle size={20} />
                  {resendError}
                </div>
              )}
              
              <div className="resend-section">
                {countdown > 0 ? (
                  <p className="resend-countdown">
                    You can request another email in {countdown} seconds
                  </p>
                ) : (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending || !canResend}
                    className="secondary-button resend-button"
                  >
                    {isResending ? 'Sending...' : 'Resend Email'}
                  </button>
                )}
              </div>
              
              <button
                onClick={onBack}
                className="inline-button"
              >
                <ArrowLeft className="icon" />
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