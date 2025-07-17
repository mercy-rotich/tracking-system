import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Passwordreset.css'

const InvalidTokenMessage = () => (
  <div className="password-reset-form-card">
    <div className="password-reset-form-header">
      <div className="password-reset-icon-circle red">
        <AlertCircle className="password-reset-icon red" />
      </div>
      <h2 className="form-title">Invalid or Expired Link</h2>
      <p className="password-reset-success-text">
        The password reset link is invalid or has expired. Please request a new password reset link.
      </p>
      <button
        onClick={() => window.location.href = '/forgot-password'}
        className="password-reset-primary-button"
      >
        Request New Link
      </button>
    </div>
  </div>
);

export default InvalidTokenMessage;