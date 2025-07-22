
import React, { useState } from 'react';
import authService from '../../../services/authService';
import Sidebar from '../../common/Sidebar/Sidebar';

const AdminSidebar = () => {
  const [pendingCount] = useState(24);

  
  const sidebarConfig = {
    type: 'admin',
    header: {
      title: 'System Administrator',
      subtitle: 'Complete System Control',
      logo: null 
    },
    sections: [
      {
        id: 'main-navigation',
        title: null, 
        items: [
          { 
            id: 'admin/dashboard', 
            label: 'Dashboard Overview', 
            icon: 'fas fa-tachometer-alt', 
            path: '/admin/dashboard' 
          },
          { 
            id: 'curricula', 
            label: 'All Curricula', 
            icon: 'fas fa-book', 
            badge: pendingCount, 
            path: '/admin/admin-all-curricula' 
          },
          { 
            id: 'users', 
            label: 'User Management', 
            icon: 'fas fa-users', 
            path: '/admin/admin-user-management' 
          },
          { 
            id: 'monitoring', 
            label: 'System Monitoring', 
            icon: 'fas fa-chart-line', 
            path: '/admin/admin-system-monitoring' 
          },
          { 
            id: 'reports', 
            label: 'Reports & Analytics', 
            icon: 'fas fa-file-download', 
            path: '/admin/admin-reports' 
          }
        ]
      },
      {
        id: 'system-tools',
        title: 'System Tools',
        items: [
          { 
            id: 'notifications', 
            label: 'Notifications Center', 
            icon: 'fas fa-bell', 
            path: '/admin/admin-notifications' 
          },
          { 
            id: 'audit', 
            label: 'Audit Logs', 
            icon: 'fas fa-shield-alt', 
            path: '/admin/audit' 
          },
          { 
            id: 'settings', 
            label: 'System Settings', 
            icon: 'fas fa-cog', 
            path: '/admin/settings' 
          }
        ]
      }
    ]
  };

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      await authService.logout();
      console.log('✅ Logout successful, redirecting...');
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('❌ Logout error:', error);
      window.location.href = '/admin/login';
    }
  };

  return (
    <Sidebar 
      config={sidebarConfig}
      onLogout={handleLogout}
      className="admin-sidebar"
    />
  );
};

export default AdminSidebar;