import React from 'react';


const Notification = ({ show, message, type, onClose }) => {
  if (!show) return null;

  return (
    <div className={`user-management-notification user-management-notification-${type} ${show ? 'user-management-notification-show' : ''}`}>
      <div className="user-management-notification-content">
        <i className={`fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
        <span>{message}</span>
        <button 
          className="user-management-notification-close" 
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Notification;