import React, { useState, useEffect } from 'react';
import { passwordResetService } from '../../services/passwordResetService';
import { getTokenFromUrl } from '../../utils/validUtils';
import ForgotPasswordForm from '../../components/PasswordReset/ForgotPasswordForm';
import EmailSentSuccess from '../../components/PasswordReset/ EmailSentSuccess';
import ResetPasswordForm from '../../components/PasswordReset/ResetPasswordForm';
import ResetSuccessMessage from '../../components/PasswordReset/ResetSuccessMessage';
import InvalidTokenMessage from '../../components/PasswordReset/InvalidTokenMessage';


const PasswordResetSystem = () => {
  const token = getTokenFromUrl();
  
  const [step, setStep] = useState('forgot'); // 'forgot', 'emailSent', 'reset', 'success'
  const [email, setEmail] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);

  // Validate token when component mounts if token exists
  useEffect(() => {
    if (token) {
      setIsValidatingToken(true);
      passwordResetService.validateResetToken(token)
        .then(() => {
          setIsTokenValid(true);
          setStep('reset');
        })
        .catch(() => {
          setIsTokenValid(false);
        })
        .finally(() => {
          setIsValidatingToken(false);
        });
    }
  }, [token]);

  const handleEmailSent = (sentEmail) => {
    setEmail(sentEmail);
    setStep('emailSent');
  };

  const handleBackToForgot = () => {
    setStep('forgot');
    setEmail('');
  };

  const handleResetSuccess = () => {
    setStep('success');
  };

  // Show loading spinner while validating token
  if (token && isValidatingToken) {
    return (
      <div className="password-reset-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Show invalid token message if token is invalid
  if (token && isTokenValid === false) {
    return (
      <div className="password-reset-container">
        <InvalidTokenMessage />
      </div>
    );
  }

  return (
    <div className="password-reset-container">
      {step === 'forgot' && (
        <ForgotPasswordForm onSuccess={handleEmailSent} />
      )}
      
      {step === 'emailSent' && (
        <EmailSentSuccess email={email} onBack={handleBackToForgot} />
      )}
      
      {step === 'reset' && token && (
        <ResetPasswordForm token={token} onSuccess={handleResetSuccess} />
      )}
      
      {step === 'success' && (
        <ResetSuccessMessage />
      )}
    </div>
  );
};

export default PasswordResetSystem;