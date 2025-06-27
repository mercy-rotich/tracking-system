
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import './UserHeader.css';

const UserHeader = ({ onMobileSidebarToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, focusMode, toggleFocusMode } = useTheme();

  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Curriculum Dashboard',
      '/curricula': 'All Curricula',
      '/analytics': 'Analytics & Reports',
      '/settings': 'System Settings'
    };
    return titles[location.pathname] || 'CurricFlow';
  };

  const handleAdminLogin = () => {
    // Navigate to admin login page
    navigate('/admin/login');
  };

  return (
    <header className="user-topbar">
      {/* Mobile Menu Button */}
      <button 
        className="user-mobile-menu-btn user-no-print"
        onClick={onMobileSidebarToggle}
        aria-label="Toggle mobile menu"
      >
        <i className="fas fa-bars" />
      </button>

      <h1 className="user-page-title">{getPageTitle()}</h1>
      
      <div className="user-topbar-controls user-no-print">
        <button 
          className={`user-control-btn ${theme === 'dark' ? 'user-control-btn--active' : ''}`}
          onClick={toggleTheme}
          title="Toggle Theme"
          aria-label="Toggle theme"
        >
          <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`} />
        </button>
        
        <button 
          className={`user-control-btn ${focusMode ? 'user-control-btn--active' : ''}`}
          onClick={toggleFocusMode}
          title="Focus Mode"
          aria-label="Toggle focus mode"
        >
          <i className="fas fa-eye" />
        </button>
        
        <button 
          className="user-admin-btn"
          onClick={handleAdminLogin}
          aria-label="Admin portal"
        >
          <i className="fas fa-user-shield" />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
};

export default UserHeader;