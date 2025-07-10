
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ 
  config, 
  onLogout = null,
  className = '',
  children 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, start with sidebar closed
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle-btn')) {
        setIsOpen(false);
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);


  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    
    if (mainContent) {
      if (!isMobile && !isOpen) {
        mainContent.classList.add('sidebar-collapsed');
      } else {
        mainContent.classList.remove('sidebar-collapsed');
      }
    }
    
    if (toggleBtn) {
      if (!isMobile && !isOpen) {
        toggleBtn.classList.add('sidebar-collapsed');
      } else {
        toggleBtn.classList.remove('sidebar-collapsed');
      }
    }
  }, [isMobile, isOpen]);

  const handleItemClick = (item) => {
    navigate(item.path);
    
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut || !onLogout) return;
    
    try {
      setIsLoggingOut(true);
      console.log('Starting logout process...');
      
      const logoutButton = document.querySelector('.logout-link');
      if (logoutButton) {
        logoutButton.classList.add('loading');
      }
      
      await onLogout();
      
      console.log('✅ Logout successful, redirecting...');
      
      if (isMobile && isOpen) {
        setIsOpen(false);
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      
      const logoutButton = document.querySelector('.logout-link');
      if (logoutButton) {
        logoutButton.classList.remove('loading');
      }
    }
  };

  const isActiveItem = (itemPath) => {
    return location.pathname === itemPath;
  };

  const renderNavigationSection = (section) => {
    return (
      <div key={section.id} className="sidebar-section">
        {section.title && (
          <h3 className="sidebar-section-title">{section.title}</h3>
        )}
        <div className="sidebar-items">
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`sidebar-link ${isActiveItem(item.path) ? 'active' : ''}`}
              type="button"
              aria-current={isActiveItem(item.path) ? 'page' : undefined}
            >
              <i className={`${item.icon} sidebar-icon`} aria-hidden="true"></i>
              <span className="sidebar-text">{item.label}</span>
              {item.badge && (
                <span className="sidebar-badge" aria-label={`${item.badge} pending items`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        className={`sidebar-toggle-btn ${isOpen ? 'toggle-on' : 'toggle-off'}`}
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
        type="button"
      >
        <i 
          className={isOpen ? 'fas fa-toggle-on' : 'fas fa-toggle-off'}
          aria-hidden="true"
        ></i>
      </button>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSidebar();
            }
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isMobile ? 'sidebar-mobile' : 'sidebar-desktop'} ${!isMobile && !isOpen ? 'sidebar-collapsed' : ''} ${className}`}
        role="navigation"
        aria-label={`${config.type} navigation`}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            className="sidebar-close-btn"
            onClick={toggleSidebar}
            aria-label="Close navigation"
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        )}

        {/* Header Section */}
        <div className="sidebar-header">
        
          <div className="sidebar-header-text">
            <h2 className="sidebar-title">{config.header.title}</h2>
            {config.header.subtitle && (
              <p className="sidebar-subtitle">{config.header.subtitle}</p>
            )}
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {/* Render Navigation Sections */}
          {config.sections.map(renderNavigationSection)}
          
          {/* Custom Content */}
          {children}
          
          {/* Logout Section */}
          {onLogout && (
            <div className="sidebar-logout-section">
              <button 
                onClick={handleLogout} 
                className={`sidebar-link logout-link ${isLoggingOut ? 'loading' : ''}`}
                type="button"
                aria-label="Logout"
                disabled={isLoggingOut}
              >
                <i 
                  className={`${isLoggingOut ? 'fas fa-spinner fa-spin' : 'fas fa-sign-out-alt'} sidebar-icon`} 
                  aria-hidden="true"
                ></i>
                <span className="sidebar-text">
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </span>
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;