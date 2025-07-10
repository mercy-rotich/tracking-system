import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo_image from '../../../assets/logo.jpg'
import './UserSidebar.css';

const UserSidebar = ({ isCollapsed, isMobileOpen, onToggle, onMobileToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/app/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/app/curricula', icon: 'fas fa-file-alt', label: 'Curricula' },
    { path: '/app/analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
    { path: '/app/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobileOpen) {
      onMobileToggle();
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>


      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="user-sidebar-overlay"
          onClick={onMobileToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onMobileToggle();
            }
          }}
          aria-label="Close sidebar"
        />
      )}
      
      <nav className={`user-sidebar ${isCollapsed ? 'user-sidebar--collapsed' : ''} ${isMobileOpen ? 'user-sidebar--mobile-open' : ''}`}>
        {/* Toggle Button */}
        <button 
          className="user-sidebar-toggle" 
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <i className={`fas fa-toggle-${isCollapsed ? 'off' : 'on'}`} />
        </button>
        
        {/* Header */}
        <div className="user-sidebar-header">
          <div className="user-logo-container">
            <div className="user-logo-img">
              <img src={logo_image} alt="" />
            </div>
            {!isCollapsed && (
              <div className="user-brand-info">
                <h1>Curriculum Management System</h1>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Menu */}
        <ul className="user-nav-menu">
          {navigationItems.map((item) => (
            <li key={item.path} className="user-nav-item">
              <button
                className={`user-nav-link ${isActiveRoute(item.path) ? 'user-nav-link--active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                aria-label={item.label}
              >
                <i className={`${item.icon} user-nav-icon`} />
                {!isCollapsed && <span className="user-nav-text">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default UserSidebar;