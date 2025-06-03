import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import './Passwordreset.css'
const ResetSuccessMessage = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="icon-circle green">
          <CheckCircle className="icon green" />
        </div>
        <h2 className="form-title">Password Reset Successful</h2>
        <p className="success-text">
          Your password has been successfully reset. You can now login with your new password.
        </p>
        <p className="small-text">
          You will be redirected to the login page in 5 seconds...
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="primary-button"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default ResetSuccessMessage;