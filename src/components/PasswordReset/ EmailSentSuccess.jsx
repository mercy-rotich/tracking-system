import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import './Passwordreset.css'

const EmailSentSuccess = ({ email, onBack }) => (
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
      <p className="small-text">
        Didn't receive the email? Check your spam folder or try again.
      </p>
      <button
        onClick={onBack}
        className="inline-button"
      >
        <ArrowLeft className="icon" />
        Back to forgot password
      </button>
    </div>
  </div>
);

export default EmailSentSuccess;