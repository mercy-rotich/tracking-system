import React, { useState, useRef, useEffect } from 'react';
import logo_image from '../../../assets/logo.jpg'
import './AdminHeader.css';

const AdminHeader = ({ onSearchSubmit, user, systemHealth, notifications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // Handle notification click logic here
  };

  const handleProfileAction = (action) => {
    console.log('Profile action:', action);
    setShowProfile(false);
    // Handle profile actions here
  };

  const getSystemHealthStatus = () => {
    if (!systemHealth) return { status: 'offline', color: 'red', text: 'System Offline' };
    
    if (systemHealth >= 98) return { status: 'online', color: 'green', text: 'System Online' };
    if (systemHealth >= 90) return { status: 'warning', color: 'yellow', text: 'System Warning' };
    return { status: 'error', color: 'red', text: 'System Error' };
  };

  const healthStatus = getSystemHealthStatus();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo and Brand */}
          <div className="header-brand">
            <div className="brand-logo">
              <div className="logo-container">
                <img 
                  src={logo_image} 
                  alt="MUST Logo" 
                  className="logo-image"
                />
              </div>
              <div className="brand-text">
                <span className="brand-name">MUST</span>
                <span className="brand-subtitle">Admin Dashboard</span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="header-search">
            <div className="search-container">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                  <div className="search-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <input
                    type="search"
                    className="search-input"
                    placeholder="Search users, curricula, or tracking ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Navigation */}
          <div className="header-actions">
            {/* System Health Indicator */}
            <div className="system-health">
              <div className={`health-indicator health-${healthStatus.color}`}>
                <div className="health-dot"></div>
              </div>
              <span className="health-text">{healthStatus.text}</span>
            </div>
            
            {/* Notifications */}
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="notification-button"
                onClick={toggleNotifications}
                aria-label="View notifications"
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <span className="notification-count">{unreadCount} new</span>
                  </div>
                  <div className="notification-list">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon">
                            <i className={`fas ${notification.icon || 'fa-bell'}`}></i>
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">{notification.time}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <span>No new notifications</span>
                      </div>
                    )}
                  </div>
                  <div className="dropdown-footer">
                    <button className="view-all-btn">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="profile-wrapper" ref={profileRef}>
              <button className="profile-button" onClick={toggleProfile}>
                <div className="profile-info">
                  <div className="profile-text">
                    <span className="profile-name">{user?.name || 'Admin User'}</span>
                    <span className="profile-role">{user?.role || 'System Administrator'}</span>
                  </div>
                </div>
                <div className="profile-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="avatar-image" />
                  ) : (
                    <i className="fas fa-user-shield"></i>
                  )}
                </div>
              </button>
              
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="profile-details">
                      <div className="profile-avatar-large">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Profile" className="avatar-image" />
                        ) : (
                          <i className="fas fa-user-shield"></i>
                        )}
                      </div>
                      <div className="profile-info-large">
                        <div className="profile-name-large">{user?.name || 'Admin User'}</div>
                        <div className="profile-email">{user?.email || 'admin@must.ac.ke'}</div>
                        <div className="profile-role-large">{user?.role || 'System Administrator'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => handleProfileAction('profile')}
                    >
                      <i className="fas fa-user"></i>
                      <span>My Profile</span>
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleProfileAction('settings')}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => handleProfileAction('help')}
                    >
                      <i className="fas fa-question-circle"></i>
                      <span>Help & Support</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout"
                      onClick={() => handleProfileAction('logout')}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;