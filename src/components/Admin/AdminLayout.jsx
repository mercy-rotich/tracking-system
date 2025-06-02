import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader/AdminHeader';
import AdminSidebar from './AdminSidebar/AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      <AdminHeader onToggleSidebar={toggleSidebar} />
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main className="admin-main-content">
        {/* This Outlet will render the nested route components */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;