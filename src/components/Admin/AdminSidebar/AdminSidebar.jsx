import React, { useState } from 'react';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onTabChange, isOpen, onToggle }) => {
  const [pendingCount] = useState(24);

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'fas fa-tachometer-alt' },
    { id: 'curricula', label: 'All Curricula', icon: 'fas fa-book', badge: pendingCount },
    { id: 'users', label: 'User Management', icon: 'fas fa-users' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'fas fa-user-cog' },
    { id: 'monitoring', label: 'System Monitoring', icon: 'fas fa-chart-line' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'fas fa-file-download' }
  ];

  const systemToolsItems = [
    { id: 'notifications', label: 'Notifications Center', icon: 'fas fa-bell' },
    { id: 'audit', label: 'Audit Logs', icon: 'fas fa-shield-alt' },
    { id: 'settings', label: 'System Settings', icon: 'fas fa-cog' }
  ];

  const handleItemClick = (itemId) => {
    onTabChange(itemId);
    // Close mobile sidebar after selection
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile Close Button */}
        <button 
          className="sidebar-close-btn md:hidden"
          onClick={onToggle}
        >
          <i className="fas fa-times"></i>
        </button>

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
                  onClick={() => handleItemClick(item.id)}
                  className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                >
                  <i className={`${item.icon} sidebar-icon`}></i>
                  <span className="sidebar-text">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-badge">{item.badge}</span>
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
                  onClick={() => handleItemClick(item.id)}
                  className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                >
                  <i className={`${item.icon} sidebar-icon`}></i>
                  <span className="sidebar-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Logout Section */}
          <div className="sidebar-logout-section">
            <button onClick={handleLogout} className="sidebar-link logout-link">
              <i className="fas fa-sign-out-alt sidebar-icon"></i>
              <span className="sidebar-text">Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;