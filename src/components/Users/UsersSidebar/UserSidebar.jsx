
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserSidebar.css';

const UserSidebar = ({ isCollapsed, isMobileOpen, onToggle, onMobileToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/curricula', icon: 'fas fa-file-alt', label: 'Curricula' },
    { path: '/analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
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
        />
      )}
      
      <nav className={`user-sidebar ${isCollapsed ? 'user-sidebar--collapsed' : ''} ${isMobileOpen ? 'user-sidebar--mobile-open' : ''}`}>
        {/* Toggle Button */}
        <button 
          className="user-sidebar-toggle" 
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`} />
        </button>
        
        {/* Header */}
        <div className="user-sidebar-header">
          <div className="user-logo-container">
            <div className="user-logo">
              <i className="fas fa-graduation-cap" />
            </div>
            {!isCollapsed && (
              <div className="user-brand-info">
                <h1>CurricFlow</h1>
                <p>Curriculum Management</p>
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