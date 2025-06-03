import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { passwordResetService } from '../../services/passwordResetService';
import { validateEmail } from '../../utils/validUtils';
import './Passwordreset.css'


const ForgotPasswordForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    passwordResetService.initiatePasswordReset(email)
      .then(() => {
        onSuccess(email);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="icon-circle blue">
          <Lock className="icon blue" />
        </div>
        <h2 className="form-title">Forgot Password</h2>
        <p className="form-description">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input with-icon"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle className="error-icon" />
            <span className="error-text">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="primary-button"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="back-link">
        <button 
          onClick={() => window.location.href = '/login'}
          className="secondary-button"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;