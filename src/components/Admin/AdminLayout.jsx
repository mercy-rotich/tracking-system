import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader/AdminHeader';
import AdminSidebar from './AdminSidebar/AdminSidebar';
import AdminDashboardOverview from '../../Pages/Admin/AdminDashboardOverview/AdminDashboardOverview';
import AdminCurriculaPage from '../../Pages/Admin/AdminCurriculaPage/AdminCurriculaPage';
import SystemMonitoringPage from '../../Pages/Admin/SystemMonitoringPage/SystemMonitoringPage';
import Reports from '../../Pages/Admin/ReportsPage/Reports';

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
        <AdminDashboardOverview/>
        <AdminCurriculaPage/>
        <SystemMonitoringPage/>
        <Reports/>
       
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;