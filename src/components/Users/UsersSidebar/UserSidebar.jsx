
import React from 'react';
import logo_image from '../../../assets/logo.jpg';
import Sidebar from '../../common/Sidebar/Sidebar';

const UserSidebar = () => {
  
  const sidebarConfig = {
    type: 'user',
    header: {
      title: 'Curriculum Management System',
      subtitle: null, 
      logo: logo_image
    },
    sections: [
      {
        id: 'main-navigation',
        title: null, 
        items: [
          { 
            id: 'dashboard', 
            label: 'Dashboard', 
            icon: 'fas fa-home', 
            path: '/app/dashboard' 
          },
          { 
            id: 'curricula', 
            label: 'Curricula', 
            icon: 'fas fa-file-alt', 
            path: '/app/curricula' 
          },
          { 
            id: 'analytics', 
            label: 'Analytics', 
            icon: 'fas fa-chart-bar', 
            path: '/app/analytics' 
          },
          { 
            id: 'settings', 
            label: 'Settings', 
            icon: 'fas fa-cog', 
            path: '/app/settings' 
          }
        ]
      }
    ]
  };

  

  return (
    <Sidebar 
      config={sidebarConfig}
      onLogout={null} 
      className="user-sidebar"
    />
  );
};

export default UserSidebar;