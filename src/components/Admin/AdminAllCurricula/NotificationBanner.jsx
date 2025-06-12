import React from 'react'

const NotificationBanner = ({notification,onClose}) => {

    if(!notification.show) return null;
  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-content">
        <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
        <span>{notification.message}</span>
        <button className="notification-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner
