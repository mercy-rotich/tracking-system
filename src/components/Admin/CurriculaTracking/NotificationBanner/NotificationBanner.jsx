import React, { useEffect } from 'react';
import './NotificationBanner.css';

const NotificationBanner = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show, onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && notification.show) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [notification.show, onClose]);

  if (!notification.show) return null;

  const getNotificationIcon = (type) => {
    return `tracking-notification-icon tracking-notification-${type}`;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="tracking-notification-backdrop" />
      
      {/* Notification */}
      <div className={`tracking-notification-banner tracking-notification-${notification.type}`}>
        <div className={getNotificationIcon(notification.type)}></div>
        
        <div className="tracking-notification-content">
          <div className="tracking-notification-message">
            {notification.message}
          </div>
        </div>
        
        <button
          className="tracking-notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="tracking-notification-progress-container">
        <div className="tracking-notification-progress-bar" />
      </div>
    </>
  );
};

export default NotificationBanner;