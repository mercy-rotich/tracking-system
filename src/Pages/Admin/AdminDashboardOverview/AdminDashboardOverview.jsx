import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MetricsCards from '../../../components/Admin/AdminDashboard/MetricCards/MetricCards';
import WorkflowBottlenecks from '../../../components/Admin/AdminDashboard/WorkflowBottlenecks/WorkflowBottlenecks';
import QuickActions from '../../../components/Admin/AdminDashboard/QuickActions/QuickActions';
import RecentActivity from '../../../components/Admin/AdminDashboard/RecentActivity/RecentActivity';
import SystemAlerts from '../../../components/Admin/AdminDashboard/SystemAlerts/SystemAlerts';
import authService from '../../../services/authService';
import curriculumService from '../../../services/curriculumService';
import './AdminDashboardOverview.css';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const AdminDashboardOverview = () => {
  // State management
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [curriculumStats, setCurriculumStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
    rejected: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: '' 
  });

  // Responsive state management
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState('desktop');

  // Check screen size and update state
  const checkScreenSize = useCallback(() => {
    const width = window.innerWidth;
    
    if (width < 768) {
      setIsMobile(true);
      setIsTablet(false);
      setScreenSize('mobile');
    } else if (width < 1024) {
      setIsMobile(false);
      setIsTablet(true);
      setScreenSize('tablet');
    } else if (width < 1440) {
      setIsMobile(false);
      setIsTablet(false);
      setScreenSize('desktop');
    } else {
      setIsMobile(false);
      setIsTablet(false);
      setScreenSize('large');
    }
  }, []);

  // Screen size effect
  useEffect(() => {
    checkScreenSize();
    
    const handleResize = () => {
      checkScreenSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScreenSize]);

  // Load curriculum statistics
  const loadCurriculumStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      console.log('🔄 Loading curriculum statistics for dashboard...');
      
      const result = await curriculumService.getAllCurriculums(0, 200);
      const totalFromApi = result.pagination?.totalElements || result.curriculums.length;
      
      const statusCounts = result.curriculums.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      
      const sampleSize = result.curriculums.length;
      let finalStats = {
        total: totalFromApi,
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        draft: statusCounts.draft || 0,
        rejected: statusCounts.rejected || 0
      };
      
      // Extrapolate if we have a sample
      if (sampleSize < totalFromApi && sampleSize > 50) {
        const ratio = totalFromApi / sampleSize;
        finalStats = {
          total: totalFromApi,
          approved: Math.round((statusCounts.approved || 0) * ratio),
          pending: Math.round((statusCounts.pending || 0) * ratio),
          draft: Math.round((statusCounts.draft || 0) * ratio),
          rejected: Math.round((statusCounts.rejected || 0) * ratio)
        };
      }
      
      setCurriculumStats(finalStats);
      console.log('✅ Curriculum statistics loaded:', finalStats);
      
    } catch (error) {
      console.error('❌ Error loading curriculum statistics:', error);
      showNotification('Failed to load curriculum statistics', 'error');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load stats on component mount
  useEffect(() => {
    loadCurriculumStats();
  }, [loadCurriculumStats]);

  // Memoized handlers for better performance
  const handleCreateUser = useCallback(() => {
    setShowCreateUserModal(true);
  }, []);

  const handleExportReport = useCallback(() => {
    console.log('Exporting report...');
    showNotification('Report export started...', 'success');
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  }, []);

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  }, []);

  const getAuthToken = useCallback(() => {
    return authService.getToken();
  }, []);

  const handleSubmitUser = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = getAuthToken();
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });

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
      console.error('Error creating user:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [formData, getAuthToken, resetForm, showNotification]);

  const handleCloseModal = useCallback(() => {
    setShowCreateUserModal(false);
    resetForm();
  }, [resetForm]);

  const refreshStats = useCallback(async () => {
    await loadCurriculumStats();
  }, [loadCurriculumStats]);

  // Memoized responsive button layout
  const buttonLayout = useMemo(() => {
    const buttons = [
      {
        key: 'create-user',
        className: 'btn btn-primary',
        onClick: handleCreateUser,
        icon: 'fas fa-user-plus',
        text: isMobile ? 'Create User' : 'Create User'
      },
      {
        key: 'export-report',
        className: 'btn btn-secondary',
        onClick: handleExportReport,
        icon: 'fas fa-download',
        text: isMobile ? 'Export' : 'Export Report'
      },
      {
        key: 'refresh-stats',
        className: 'btn btn-outline',
        onClick: refreshStats,
        disabled: statsLoading,
        icon: statsLoading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt',
        text: isMobile ? 'Refresh' : 'Refresh Stats'
      }
    ];

    return buttons;
  }, [handleCreateUser, handleExportReport, refreshStats, statsLoading, isMobile]);

  // Responsive grid configuration
  const gridConfig = useMemo(() => {
    switch (screenSize) {
      case 'mobile':
        return {
          workflowCols: '1fr',
          activityCols: '1fr',
          gap: '1rem'
        };
      case 'tablet':
        return {
          workflowCols: '1fr',
          activityCols: '1fr',
          gap: '1.5rem'
        };
      case 'desktop':
        return {
          workflowCols: '2fr 1fr',
          activityCols: '1fr 1fr',
          gap: '1.5rem'
        };
      case 'large':
        return {
          workflowCols: '2fr 1fr',
          activityCols: '1fr 1fr',
          gap: '2rem'
        };
      default:
        return {
          workflowCols: '2fr 1fr',
          activityCols: '1fr 1fr',
          gap: '1.5rem'
        };
    }
  }, [screenSize]);

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
                aria-label="Close notification"
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
              {buttonLayout.map(button => (
                <button 
                  key={button.key}
                  className={button.className}
                  onClick={button.onClick}
                  disabled={button.disabled}
                  aria-label={button.text}
                >
                  <i className={button.icon} aria-hidden="true"></i>
                  <span>{button.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <MetricsCards 
          curriculumStats={curriculumStats}
          statsLoading={statsLoading}
          onRefreshStats={refreshStats}
        />

        {/* Workflow Status and Quick Actions */}
        <div 
          className="workflow-section"
          style={{ 
            gridTemplateColumns: gridConfig.workflowCols,
            gap: gridConfig.gap
          }}
        >
          <WorkflowBottlenecks curriculumStats={curriculumStats} />
          <QuickActions />
        </div>

        {/* Recent Activity and System Alerts */}
        <div 
          className="activity-section"
          style={{ 
            gridTemplateColumns: gridConfig.activityCols,
            gap: gridConfig.gap
          }}
        >
          <RecentActivity />
          <SystemAlerts />
        </div>

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New User</h2>
                <button 
                  className="modal-close" 
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                >
                  <i className="fas fa-times" aria-hidden="true"></i>
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
                      autoComplete="given-name"
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
                      autoComplete="family-name"
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
                    autoComplete="username"
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
                    autoComplete="email"
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
                    autoComplete="new-password"
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
                        <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus" aria-hidden="true"></i>
                        <span>Create User</span>
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