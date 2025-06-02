import React from 'react'
import AdminHeader from './AdminHeader/AdminHeader'
import AdminSidebar from './AdminSidebar/AdminSidebar'

import AdminDashboardOverview from './AdminDashboard/AdminDashboardOverview/AdminDashboardOverview'

const AdminLayout = () => {
  return (
    <div>
      <AdminHeader/>
      <AdminSidebar/>
      <AdminDashboardOverview/>
    </div>
  )
}

export default AdminLayout
