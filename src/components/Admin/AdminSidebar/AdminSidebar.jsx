import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const [pendingCount] = useState(24);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true); 
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      
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

  // Update main content margin and toggle button position based on sidebar state
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

  const navigationItems = [
    { id: 'admin/dashboard', label: 'Dashboard Overview', icon: 'fas fa-tachometer-alt', path: '/admin/dashboard' },
    { id: 'curricula', label: 'All Curricula', icon: 'fas fa-book', badge: pendingCount, path: '/admin/admin-all-curricula' },
    { id: 'users', label: 'User Management', icon: 'fas fa-users', path: '/admin/users' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'fas fa-user-cog', path: '/admin/roles' },
    { id: 'monitoring', label: 'System Monitoring', icon: 'fas fa-chart-line', path: '/admin/admin-system-monitoring' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'fas fa-file-download', path: '/admin/reports' }
  ];

  const systemToolsItems = [
    { id: 'notifications', label: 'Notifications Center', icon: 'fas fa-bell', path: '/admin/notifications' },
    { id: 'audit', label: 'Audit Logs', icon: 'fas fa-shield-alt', path: '/admin/audit' },
    { id: 'settings', label: 'System Settings', icon: 'fas fa-cog', path: '/admin/settings' }
  ];

  const handleItemClick = (item) => {
   
    navigate(item.path);
    
    
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    navigate('/login');
    
    if (isMobile && isOpen) {
      setIsOpen(false);
    }
  };

  const isActiveItem = (itemPath) => {
    return location.pathname === itemPath;
  };

  return (
    <>
      {/* Toggle Button  */}
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
        className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isMobile ? 'sidebar-mobile' : 'sidebar-desktop'} ${!isMobile && !isOpen ? 'sidebar-collapsed' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Mobile Close Button - Only on very small screens */}
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

        {/* User Info Section */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">System Administrator</h2>
          <p className="sidebar-subtitle">Complete System Control</p>
        </div>
        
        <nav className="sidebar-nav">
          {/* Main Navigation */}
          <div className="sidebar-section">
            <div className="sidebar-items">
              {navigationItems.map((item) => (
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
          
          {/* System Tools Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">System Tools</h3>
            <div className="sidebar-items">
              {systemToolsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`sidebar-link ${isActiveItem(item.path) ? 'active' : ''}`}
                  type="button"
                  aria-current={isActiveItem(item.path) ? 'page' : undefined}
                >
                  <i className={`${item.icon} sidebar-icon`} aria-hidden="true"></i>
                  <span className="sidebar-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Logout Section */}
          <div className="sidebar-logout-section">
            <button 
              onClick={handleLogout} 
              className="sidebar-link logout-link"
              type="button"
              aria-label="Logout from admin panel"
            >
              <i className="fas fa-sign-out-alt sidebar-icon" aria-hidden="true"></i>
              <span className="sidebar-text">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;