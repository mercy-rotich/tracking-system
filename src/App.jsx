import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './Pages/users/LoginPage/LoginPage';
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboardOverview from './Pages/Admin/AdminDashboardOverview/AdminDashboardOverview';
import PasswordResetSystem from './Pages/users/PasswordResetSystem';
import AdminCurriculaPage from './Pages/Admin/AdminCurriculaPage/AdminCurriculaPage';
import SystemMonitoringPage from './Pages/Admin/SystemMonitoringPage/SystemMonitoringPage';
import UserManagementPage from './Pages/Admin/UserManagemetPage/UserManagement';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<PasswordResetSystem/>}/>
            
            {/* Protected Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              {/* Nested admin routes */}
              <Route path="dashboard" element={<AdminDashboardOverview />} />
              <Route path="admin-all-curricula" element={<AdminCurriculaPage />} />
              <Route path="admin-system-monitoring" element={<SystemMonitoringPage />} />
              <Route path="admin-user-management" element={<UserManagementPage />} />
              
              
            </Route>
            
            {/* Redirect old dashboard route to admin/dashboard */}
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Default route */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;