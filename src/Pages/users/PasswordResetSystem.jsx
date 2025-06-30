// src/Pages/users/PasswordResetSystem.jsx - Fixed version
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import passwordResetService from '../../services/passwordResetService';
import { getTokenFromUrl, getTokenFromPath } from '../../utils/validUtils';

// Import your custom components
import ForgotPasswordPage from '../../components/PasswordReset/ForgotPasswordPage';
import EmailSentSuccess from '../../components/PasswordReset/ EmailSentSuccess'
import ResetPasswordPage from '../../components/PasswordReset/ResetPasswordPage';
import ResetSuccessMessage from '../../components/PasswordReset/ResetSuccessMessage';
import InvalidTokenMessage from '../../components/PasswordReset/InvalidTokenMessage';

const PasswordResetSystem = () => {
  const { token: urlToken } = useParams(); 
  const location = useLocation();
  
  
  const getToken = () => {
    const tokenFromParams = urlToken;
    const tokenFromQuery = getTokenFromUrl(); 
    const tokenFromPath = getTokenFromPath(location.pathname); 
    
    const finalToken = tokenFromParams || tokenFromQuery || tokenFromPath;
    
    console.log('🔍 PasswordResetSystem - Token extraction:', {
      urlToken: tokenFromParams,
      queryToken: tokenFromQuery,
      pathToken: tokenFromPath,
      finalToken: finalToken,
      currentPath: location.pathname
    });
    
    return finalToken;
  };
  
  const token = getToken();
  
  // Determine initial step based on current route and token
  const getInitialStep = () => {
    const path = location.pathname;
    
    if (path.includes('/forgot-password')) {
      return 'forgot';
    } else if (path.includes('/reset-password') && token) {
      return 'validating'; 
    } else if (path.includes('/reset-password')) {
      return 'forgot'; 
    }
    
    return 'forgot';
  };
  
  const [step, setStep] = useState(getInitialStep);
  const [email, setEmail] = useState('');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  
  useEffect(() => {
    if (token && step === 'validating') {
      console.log('🔍 Validating token:', token);
      setIsValidatingToken(true);
      
      passwordResetService.validateResetToken(token)
        .then((result) => {
          console.log('✅ Token valid:', result);
          setIsTokenValid(true);
          setUserEmail(result.email || '');
          setStep('reset');
        })
        .catch((error) => {
          console.error('❌ Token validation failed:', error);
          setIsTokenValid(false);
          setStep('invalid');
        })
        .finally(() => {
          setIsValidatingToken(false);
        });
    }
  }, [token, step]);

  const handleEmailSent = (sentEmail) => {
    console.log('📧 Email sent to:', sentEmail);
    setEmail(sentEmail);
    setStep('emailSent');
  };

  const handleBackToForgot = () => {
    console.log('🔄 Back to forgot password');
    setStep('forgot');
    setEmail('');
  };

  const handleResetSuccess = () => {
    console.log('✅ Reset successful');
    setStep('success');
  };

  const handleResetError = (error) => {
    console.error('❌ Reset error:', error);
    
  };

 
  if (token && isValidatingToken) {
    return (
      <div className="login-container">
        <div className="login-wrapper">
          <div className="form-section">
            <div className="loading-container">
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Validating reset link...</p>
                {import.meta.env.DEV && (
                  <small style={{marginTop: '10px', color: '#666'}}>
                    Debug: Token = {token}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 
  if (token && isTokenValid === false) {
    return <InvalidTokenMessage />;
  }

  
  switch (step) {
    case 'forgot':
      return <ForgotPasswordPage onSuccess={handleEmailSent} />;
      
    case 'emailSent':
      return <EmailSentSuccess email={email} onBack={handleBackToForgot} />;
      
    case 'reset':
      return (
        <ResetPasswordPage 
          token={token} 
          email={userEmail}
          onSuccess={handleResetSuccess}
          onError={handleResetError}
        />
      );
      
    case 'success':
      return <ResetSuccessMessage email={userEmail} />;
      
    case 'invalid':
      return <InvalidTokenMessage />;
      
    default:
      return <ForgotPasswordPage onSuccess={handleEmailSent} />;
  }
};

export default PasswordResetSystem;