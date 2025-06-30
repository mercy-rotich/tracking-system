// src/App.jsx - Fixed to use PasswordResetSystem
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurriculumProvider } from './context/CurriculumContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './Pages/users/LoginPage/LoginPage';

// Import the unified PasswordResetSystem instead of individual components
import PasswordResetSystem from './Pages/users/PasswordResetSystem';

// Admin components
import AdminLayout from './components/Admin/AdminLayout';
import AdminDashboardOverview from './Pages/Admin/AdminDashboardOverview/AdminDashboardOverview';
import AdminCurriculaPage from './Pages/Admin/AdminCurriculaPage/AdminCurriculaPage';
import SystemMonitoringPage from './Pages/Admin/SystemMonitoringPage/SystemMonitoringPage';
import UserManagementPage from './Pages/Admin/UserManagemetPage/UserManagement';
import Reports from './Pages/Admin/ReportsPage/Reports';

// User components
import UsersLayout from './components/Users/UsersLayout/UsersLayout';
import UserDashboard from './Pages/users/UserDashboard/UserDashboard';
import UserCurricula from './Pages/users/UserCurricula/UserCurricula';
import Analytics from './Pages/users/Analytics/Analytics';
import UserSettings from './Pages/users/UserSettings/UserSettings';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurriculumProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Password Reset Routes */}
                <Route path="/forgot-password" element={<PasswordResetSystem />} />
                <Route path="/reset-password" element={<PasswordResetSystem />} />
                <Route path="/reset-password/:token" element={<PasswordResetSystem />} />
                
                {/* Admin Authentication Routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<AdminDashboardOverview />} />
                  <Route path="admin-all-curricula" element={<AdminCurriculaPage />} />
                  <Route path="admin-system-monitoring" element={<SystemMonitoringPage />} />
                  <Route path="admin-user-management" element={<UserManagementPage />} />
                  <Route path="admin-reports" element={<Reports />} />
                </Route>
                
                <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                
                {/* User Routes with Layout */}
                <Route path="/" element={<UsersLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="curricula" element={<UserCurricula />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<UserSettings />} />
                </Route>
                
                {/* Legacy redirects */}
                <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </CurriculumProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;