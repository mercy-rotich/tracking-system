import React, { useState } from 'react';
import MetricsCards from '../../../components/Admin/AdminDashboard/MetricCards/MetricCards';
import WorkflowBottlenecks from '../../../components/Admin/AdminDashboard/WorkflowBottlenecks/WorkflowBottlenecks';
import QuickActions from '../../../components/Admin/AdminDashboard/QuickActions/QuickActions';
import RecentActivity from '../../../components/Admin/AdminDashboard/RecentActivity/RecentActivity';
import SystemAlerts from '../../../components/Admin/AdminDashboard/SystemAlerts/SystemAlerts';
import authService from '../../../services/authService';
import './AdminDashboardOverview.css';


const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8090/api/v1';

const AdminDashboardOverview = () => {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const handleCreateUser = () => {
    setShowCreateUserModal(true);
  };

  const handleExportReport = () => {
  
    console.log('Exporting report...');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const getAuthToken = () => {
    return authService.getToken();
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

     
      console.log('🎫 Using token for API call:', token ? `${token.substring(0, 20)}...` : 'null');

     
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        showNotification('User created successfully! Login details have been sent to their email.', 'success');
        setShowCreateUserModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('❌ API error response:', errorData);
        
        if (response.status === 401) {
          showNotification('Session expired. Please log in again.', 'error');
        } else {
          showNotification(errorData.message || 'Failed to create user. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('💥 Error creating user:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateUserModal(false);
    resetForm();
  };

  const debugAuth = () => {
    console.log('🔍 Debug Auth Status:');
    console.log('Is Authenticated:', authService.isAuthenticated());
    console.log('Current User:', authService.getCurrentUser());
    console.log('Token:', authService.getToken() ? 'Present' : 'Missing');
    console.log('API Base URL:', API_BASE_URL);
    authService.debugStorage();
  };

  return (
    <div className="dashboard-main-content">
      <div className="dashboard-overview">
        {/* Notification */}
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{notification.message}</span>
              <button 
                className="notification-close"
                onClick={() => setNotification({ show: false, message: '', type: '' })}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">Admin Dashboard</h1>
              <p className="dashboard-subtitle">Complete system overview and management</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCreateUser}
              >
                <i className="fas fa-user-plus"></i>
                Create User
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleExportReport}
              >
                <i className="fas fa-download"></i>
                Export Report
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button 
                  className="btn btn-info"
                  onClick={debugAuth}
                >
                  <i className="fas fa-bug"></i>
                  Debug Auth
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <MetricsCards />

        {/* Workflow Status and Quick Actions */}
        <div className="workflow-section">
          <WorkflowBottlenecks />
          <QuickActions />
        </div>

        {/* Recent Activity and System Alerts */}
        <div className="activity-section">
          <RecentActivity />
          <SystemAlerts />
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New User</h2>
                <button className="modal-close" onClick={handleCloseModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmitUser} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter password"
                    minLength="8"
                  />
                  <small className="form-help">Password must be at least 8 characters long</small>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={handleCloseModal}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus"></i>
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardOverview;