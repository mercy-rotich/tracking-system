import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurriculumProvider } from './context/CurriculumContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './Pages/users/LoginPage/LoginPage';

import PasswordResetSystem from './Pages/users/PasswordResetSystem';

import AdminLayout from './components/AdminLayout/AdminLayout';
import AdminDashboardOverview from './Pages/Admin/AdminDashboardOverview/AdminDashboardOverview';
import AdminCurriculaPage from './Pages/Admin/AdminCurriculaPage/AdminCurriculaPage';
import SystemMonitoringPage from './Pages/Admin/SystemMonitoringPage/SystemMonitoringPage';
import UserManagementPage from './Pages/Admin/UserManagemetPage/UserManagement';
import Reports from './Pages/Admin/ReportsPage/Reports';

import UsersLayout from './components/Users/UsersLayout/UsersLayout';
import UserDashboard from './Pages/users/UserDashboard/UserDashboard';
import UserCurricula from './Pages/users/UserCurricula/UserCurricula';
import Analytics from './Pages/users/Analytics/Analytics';
import UserSettings from './Pages/users/UserSettings/UserSettings';
import LandingPage from './Pages/LandingPage/LandingPage';
import NotificationsPage from './Pages/Admin/NotificationsPage/NotificationsPage';
import CurriculumTrackingPage from './Pages/Admin/CurriculumTrackingPage/CurriculumTrackingPage';
import AboutPage from './Pages/LandingPage/AboutPage/AboutPage';


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CurriculumProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />
                <Route path ="/about" element ={<AboutPage/>}/>
                
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
                  <Route path="admin-notifications" element={<NotificationsPage />} />
                  <Route path="admin-curriculum-tracking" element={<CurriculumTrackingPage />} />
                  <Route path="admin-settings" element={<UserSettings/>} />

                </Route>
                
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* User Routes */}
                <Route path="/app/*" element={<UsersLayout />}>
                  <Route index element={<Navigate to="/app/dashboard"  />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="curricula" element={<UserCurricula />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<UserSettings />} />
                </Route>
                
                {/* Legacy redirects */}
                <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                
                {/* Catch all route - redirect to landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </CurriculumProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;