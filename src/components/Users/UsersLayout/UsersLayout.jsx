
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from '../UsersSidebar/UserSidebar';
import UserHeader from '../UserHeader/UserHeader';
import Chatbot from '../Chatbot/Chatbot';
import Modal from '../Modal/Modal';
import './UsersLayout.css';

const UsersLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="user-layout">
      <UserSidebar 
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggle={handleSidebarToggle}
        onMobileToggle={handleMobileSidebarToggle}
      />
      
      <div className={`user-main-container ${isSidebarCollapsed ? 'user-main-container--collapsed' : ''}`}>
        <UserHeader onMobileSidebarToggle={handleMobileSidebarToggle} />
        
        <main className="user-content">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
        </main>
      </div>
      
      <Chatbot />
      <Modal />
    </div>
  );
};

export default UsersLayout;