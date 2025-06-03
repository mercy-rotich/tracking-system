import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Passwordreset.css'

const InvalidTokenMessage = () => (
  <div className="form-card">
    <div className="form-header">
      <div className="icon-circle red">
        <AlertCircle className="icon red" />
      </div>
      <h2 className="form-title">Invalid or Expired Link</h2>
      <p className="success-text">
        The password reset link is invalid or has expired. Please request a new password reset link.
      </p>
      <button
        onClick={() => window.location.href = '/forgot-password'}
        className="primary-button"
      >
        Request New Link
      </button>
    </div>
  </div>
);

export default InvalidTokenMessage;