import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import logo_image from '../../../assets/logo.jpg'
import './AdminHeader.css';

const AdminHeader = ({ onSearchSubmit, user, systemHealth, notifications, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
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
    setIsSearchExpanded(false);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
    setIsSearchExpanded(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
    setIsSearchExpanded(false);
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked', notification);
  };

  const handleProfileAction = async (action) => {
    console.log('profile action:', action);
    setShowProfile(false);

    switch (action) {
      case 'profile':
        navigate('/admin/profile');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'help':
        navigate('/admin/help');
        break;
      case 'logout':
        await handleLogout();
        break;
      default:
        console.log('unknown profile action:', action);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await authService.logout();
      setShowProfile(false);
      setShowNotifications(false);
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoggingOut(false);
    }
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
    <header className="admin-header">
      <div className="admin-header-container">
        <div className="admin-header-content">
          {/* Sidebar Toggle Button */}
          <button 
            className="header-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Logo and Brand */}
          <div className={`admin-header-brand ${isSearchExpanded ? 'hidden-mobile' : ''}`}>
            <div className="admin-brand-logo">
              <div className="admin-logo-container">
                <img 
                  src={logo_image} 
                  alt="MUST Logo" 
                  className="admin-logo-image"
                />
              </div>
              <div className="admin-brand-text">
                <span className="admin-brand-name">MUST</span>
                <span className="admin-brand-subtitle">Admin Dashboard</span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className={`admin-header-search ${isSearchExpanded ? 'expanded' : ''}`} ref={searchRef}>
            <div className="admin-search-container">
              <form onSubmit={handleSearchSubmit} className="admin-search-form">
                <div className="admin-search-input-wrapper">
                  <button 
                    type="button"
                    className="admin-search-icon"
                    onClick={handleSearchFocus}
                    aria-label="Search"
                  >
                    <i className="fas fa-search"></i>
                  </button>
                  <input
                    type="search"
                    className="admin-search-input"
                    placeholder="Search users, curricula, or tracking ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    onFocus={handleSearchFocus}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="admin-search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                  {isSearchExpanded && (
                    <button
                      type="button"
                      className="admin-search-close"
                      onClick={() => setIsSearchExpanded(false)}
                      aria-label="Close search"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Navigation */}
          <div className={`admin-header-actions ${isSearchExpanded ? 'hidden-mobile' : ''}`}>
            {/* System Health Indicator */}
            <div className="admin-system-health">
              <div className={`admin-health-indicator health-${healthStatus.color}`}>
                <div className="admin-health-dot"></div>
              </div>
              <span className="admin-health-text">{healthStatus.text}</span>
            </div>
            
            {/* Notifications */}
            <div className="admin-notification-wrapper" ref={notificationRef}>
              <button
                className="admin-notification-button"
                onClick={toggleNotifications}
                aria-label="View notifications"
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="admin-notification-badge">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="admin-notification-dropdown">
                  <div className="admin-dropdown-header">
                    <h3>Notifications</h3>
                    <span className="admin-notification-count">{unreadCount} new</span>
                  </div>
                  <div className="admin-notification-list">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`admin-notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="admin-notification-icon">
                            <i className={`fas ${notification.icon || 'fa-bell'}`}></i>
                          </div>
                          <div className="admin-notification-content">
                            <div className="admin-notification-title">{notification.title}</div>
                            <div className="admin-notification-message">{notification.message}</div>
                            <div className="admin-notification-time">{notification.time}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="admin-no-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <span>No new notifications</span>
                      </div>
                    )}
                  </div>
                  <div className="admin-dropdown-footer">
                    <button className="admin-view-all-btn">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Dropdown */}
            <div className="admin-profile-wrapper" ref={profileRef}>
              <button 
                className="admin-profile-button" 
                onClick={toggleProfile}
                disabled={isLoggingOut}
                aria-label="User profile menu"
              >
                <div className="admin-profile-info">
                  <div className="admin-profile-text">
                    <span className="admin-profile-name">{user?.name || 'Admin User'}</span>
                    <span className="admin-profile-role">{user?.role || 'System Administrator'}</span>
                  </div>
                </div>
                <div className="admin-profile-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="admin-avatar-image" />
                  ) : (
                    <i className="fas fa-user-shield"></i>
                  )}
                </div>
              </button>
              
              {showProfile && (
                <div className="admin-profile-dropdown">
                  <div className="admin-dropdown-header">
                    <div className="admin-profile-details">
                      <div className="admin-profile-avatar-large">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Profile" className="admin-avatar-image" />
                        ) : (
                          <i className="fas fa-user-shield"></i>
                        )}
                      </div>
                      <div className="admin-profile-info-large">
                        <div className="admin-profile-name-large">{user?.name || 'Admin User'}</div>
                        <div className="admin-profile-email">{user?.email || 'admin@must.ac.ke'}</div>
                        <div className="admin-profile-role-large">{user?.role || 'System Administrator'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="admin-dropdown-menu">
                    <button
                      className="admin-dropdown-item"
                      onClick={() => handleProfileAction('profile')}
                      disabled={isLoggingOut}
                    >
                      <i className="fas fa-user"></i>
                      <span>My Profile</span>
                    </button>
                    <button
                      className="admin-dropdown-item"
                      onClick={() => handleProfileAction('settings')}
                      disabled={isLoggingOut}
                    >
                      <i className="fas fa-cog"></i>
                      <span>Settings</span>
                    </button>
                    <button
                      className="admin-dropdown-item"
                      onClick={() => handleProfileAction('help')}
                      disabled={isLoggingOut}
                    >
                      <i className="fas fa-question-circle"></i>
                      <span>Help & Support</span>
                    </button>
                    <div className="admin-dropdown-divider"></div>
                    <button
                      className={`admin-dropdown-item logout ${isLoggingOut ? 'loading' : ''}`}
                      onClick={() => handleProfileAction('logout')}
                      disabled={isLoggingOut}
                    >
                      <i className={`fas ${isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'}`}></i>
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
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