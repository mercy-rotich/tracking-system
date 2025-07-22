import React, { useState, useEffect, useCallback } from 'react';
import './NotificationsPage.css';

const NotificationsPage = () => {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toasts, setToasts] = useState([]);

  const itemsPerPage = 10;

  // Mock data for notifications
  const mockNotifications = [
    {
      id: 1,
      type: 'workflow',
      priority: 'high',
      title: 'Curriculum Approval Required',
      message: 'Computer Science Bachelor\'s curriculum is pending your approval at the Dean Committee stage.',
      time: '2 minutes ago',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      unread: true,
      urgent: true,
      actions: ['Approve', 'Review', 'Reject']
    },
    {
      id: 2,
      type: 'reminder',
      priority: 'medium',
      title: 'Site Inspection Scheduled',
      message: 'Quality Assurance site inspection for Engineering programs scheduled for tomorrow at 10:00 AM.',
      time: '15 minutes ago',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      unread: true,
      urgent: false,
      actions: ['View Details', 'Reschedule']
    },
    {
      id: 3,
      type: 'system',
      priority: 'low',
      title: 'System Backup Completed',
      message: 'Daily system backup completed successfully. All curriculum data backed up.',
      time: '1 hour ago',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      unread: false,
      urgent: false,
      actions: ['View Report']
    },
    {
      id: 4,
      type: 'alert',
      priority: 'high',
      title: 'Curriculum Expiring Soon',
      message: 'Business Administration curriculum expires in 30 days. Review required.',
      time: '2 hours ago',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: true,
      urgent: true,
      actions: ['Review', 'Extend', 'Archive']
    },
    {
      id: 5,
      type: 'workflow',
      priority: 'medium',
      title: 'New Curriculum Submitted',
      message: 'School of Engineering has submitted a new curriculum for Environmental Engineering.',
      time: '3 hours ago',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      unread: false,
      urgent: false,
      actions: ['Review', 'Assign']
    },
    {
      id: 6,
      type: 'reminder',
      priority: 'high',
      title: 'CUE Review Deadline',
      message: 'Commission of University Education review response deadline is in 3 days for Medical Sciences curriculum.',
      time: '4 hours ago',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unread: true,
      urgent: false,
      actions: ['Prepare Response', 'Contact CUE']
    },
    {
      id: 7,
      type: 'system',
      priority: 'medium',
      title: 'User Access Request',
      message: 'New user registration request from Dr. Sarah Wilson, School of Medicine.',
      time: '5 hours ago',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      unread: false,
      urgent: false,
      actions: ['Approve', 'Review Profile', 'Deny']
    },
    {
      id: 8,
      type: 'workflow',
      priority: 'low',
      title: 'Committee Meeting Reminder',
      message: 'Dean Committee meeting scheduled for Friday at 2:00 PM to review pending curricula.',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: false,
      urgent: false,
      actions: ['View Agenda', 'Add to Calendar']
    },
    {
      id: 9,
      type: 'alert',
      priority: 'medium',
      title: 'Duplicate Curriculum Detected',
      message: 'Potential duplicate curriculum detected: "Information Technology" vs "IT Systems".',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: true,
      urgent: false,
      actions: ['Compare', 'Merge', 'Keep Separate']
    },
    {
      id: 10,
      type: 'system',
      priority: 'low',
      title: 'Monthly Report Generated',
      message: 'Monthly curriculum tracking report for November 2024 is now available.',
      time: '2 days ago',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false,
      urgent: false,
      actions: ['Download', 'Share', 'Archive']
    }
  ];

  // Initialize notifications
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications.filter(notification => {
      const matchesSearch = !searchTerm || 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || notification.type === typeFilter;
      const matchesPriority = !priorityFilter || notification.priority === priorityFilter;
      const matchesStatus = !statusFilter || 
        (statusFilter === 'unread' && notification.unread) ||
        (statusFilter === 'read' && !notification.unread);

      return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });

    setFilteredNotifications(filtered);
    setCurrentPage(1);
    setSelectedNotifications(new Set());
  }, [notifications, searchTerm, typeFilter, priorityFilter, statusFilter]);

  // Calculate stats
  const stats = {
    unread: notifications.filter(n => n.unread).length,
    urgent: notifications.filter(n => n.urgent).length,
    reminders: notifications.filter(n => n.type === 'reminder').length,
    system: notifications.filter(n => n.type === 'system').length
  };

  // Get current page notifications
  const getCurrentPageNotifications = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredNotifications.slice(startIndex, endIndex);
  };

  // Utility functions
  const getNotificationIcon = (type) => {
    const icons = {
      system: 'fa-server',
      workflow: 'fa-tasks',
      reminder: 'fa-clock',
      alert: 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-bell';
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const closeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Event handlers
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleTypeFilter = useCallback((e) => {
    setTypeFilter(e.target.value);
  }, []);

  const handlePriorityFilter = useCallback((e) => {
    setPriorityFilter(e.target.value);
  }, []);

  const handleStatusFilter = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setPriorityFilter('');
    setStatusFilter('');
    showToast('Filters cleared successfully', 'info');
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAll = () => {
    const currentPageIds = getCurrentPageNotifications().map(n => n.id);
    const allSelected = currentPageIds.every(id => selectedNotifications.has(id));
    
    const newSelected = new Set(selectedNotifications);
    if (allSelected) {
      currentPageIds.forEach(id => newSelected.delete(id));
      showToast('All notifications unselected', 'info');
    } else {
      currentPageIds.forEach(id => newSelected.add(id));
      showToast(`${currentPageIds.length} notifications selected`, 'info');
    }
    
    setSelectedNotifications(newSelected);
  };

  const deleteSelected = () => {
    if (selectedNotifications.size === 0) {
      showToast('No notifications selected', 'error');
      return;
    }

    if (window.confirm(`Delete ${selectedNotifications.size} selected notification(s)?`)) {
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.has(n.id))
      );
      setSelectedNotifications(new Set());
      showToast('Selected notifications deleted', 'success');
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, unread: !n.unread } : n
      )
    );
    const notification = notifications.find(n => n.id === id);
    showToast(
      notification?.unread ? 'Marked as unread' : 'Marked as read', 
      'success'
    );
  };

  const markAllAsRead = () => {
    const unreadCount = notifications.filter(n => n.unread).length;
    
    if (unreadCount === 0) {
      showToast('No unread notifications', 'info');
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setSelectedNotifications(new Set());
    showToast(`${unreadCount} notifications marked as read`, 'success');
  };

  const handleAction = (action, notificationId) => {
    // Simulate action handling
    const actionMessages = {
      'Approve': 'Curriculum approved successfully',
      'Review': 'Opening curriculum for review...',
      'Reject': 'Curriculum rejected',
      'View Details': 'Opening detailed view...',
      'Reschedule': 'Opening scheduling interface...',
      'View Report': 'Downloading report...',
      'Extend': 'Curriculum validity extended',
      'Archive': 'Curriculum archived',
      'Assign': 'Opening assignment interface...',
      'Prepare Response': 'Opening response preparation...',
      'Contact CUE': 'Opening contact form...',
      'Review Profile': 'Opening user profile...',
      'Deny': 'Access request denied',
      'View Agenda': 'Opening meeting agenda...',
      'Add to Calendar': 'Added to calendar',
      'Compare': 'Opening comparison view...',
      'Merge': 'Opening merge interface...',
      'Keep Separate': 'Curricula marked as separate',
      'Download': 'Downloading report...',
      'Share': 'Opening share options...'
    };

    if (action === 'Reject' || action === 'Deny') {
      if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this item?`)) {
        return;
      }
    }

    showToast(actionMessages[action] || `Action: ${action}`, 'success');

    // Mark notification as read when action is taken
    const notification = notifications.find(n => n.id === notificationId);
    if (notification?.unread) {
      markAsRead(notificationId);
    }
  };

  const refreshNotifications = () => {
    showToast('Refreshing notifications...', 'info');
    
    setTimeout(() => {
     
      const newNotification = {
        id: Date.now(),
        type: 'workflow',
        priority: 'high',
        title: 'New Curriculum Submission',
        message: 'School of Health Sciences has submitted a new Public Health curriculum for review.',
        time: 'Just now',
        timestamp: new Date(),
        unread: true,
        urgent: true,
        actions: ['Review', 'Assign', 'Defer']
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      showToast('Notifications refreshed', 'success');
    }, 1000);
  };

  const toggleSettings = () => {
    showToast('Opening notification settings...', 'info');
  };

  // Pagination handlers
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const getPaginationInfo = () => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredNotifications.length);
    return {
      start: filteredNotifications.length > 0 ? startIndex : 0,
      end: endIndex,
      total: filteredNotifications.length
    };
  };

  const paginationInfo = getPaginationInfo();

  return (
    <div className="dashboard-main-content">
      <div className="notifications-page">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header-content">
            <div>
              <h1 className="notifications-page-title">
                <i className="fas fa-bell"></i>
                Notifications Center
              </h1>
              <p className="notifications-page-subtitle">
                Manage all system notifications, alerts, and reminders
              </p>
            </div>
            <div className="notifications-header-actions">
              <button 
                className="notifications-btn notifications-btn-primary" 
                onClick={markAllAsRead}
              >
                <i className="fas fa-check-double"></i>
                Mark All Read
              </button>
              <button 
                className="notifications-btn notifications-btn-secondary" 
                onClick={toggleSettings}
              >
                <i className="fas fa-cog"></i>
                Settings
              </button>
              <button 
                className="notifications-btn notifications-btn-outline" 
                onClick={refreshNotifications}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="notifications-stats-grid">
          <div className="notifications-stat-card unread">
            <div className="notifications-stat-header">
              <div className="notifications-stat-title">Unread</div>
              <div className="notifications-stat-icon unread">
                <i className="fas fa-envelope"></i>
              </div>
            </div>
            <div className="notifications-stat-value">{stats.unread}</div>
          </div>
          <div className="notifications-stat-card urgent">
            <div className="notifications-stat-header">
              <div className="notifications-stat-title">Urgent</div>
              <div className="notifications-stat-icon urgent">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
            </div>
            <div className="notifications-stat-value">{stats.urgent}</div>
          </div>
          <div className="notifications-stat-card reminders">
            <div className="notifications-stat-header">
              <div className="notifications-stat-title">Reminders</div>
              <div className="notifications-stat-icon reminders">
                <i className="fas fa-clock"></i>
              </div>
            </div>
            <div className="notifications-stat-value">{stats.reminders}</div>
          </div>
          <div className="notifications-stat-card system">
            <div className="notifications-stat-header">
              <div className="notifications-stat-title">System</div>
              <div className="notifications-stat-icon system">
                <i className="fas fa-server"></i>
              </div>
            </div>
            <div className="notifications-stat-value">{stats.system}</div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="notifications-controls-section">
          <div className="notifications-controls-grid">
            <div className="notifications-search-container">
              <i className="fas fa-search notifications-search-icon"></i>
              <input
                type="text"
                className="notifications-search-input"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <select 
              className="notifications-filter-select" 
              value={typeFilter}
              onChange={handleTypeFilter}
            >
              <option value="">All Types</option>
              <option value="system">System</option>
              <option value="workflow">Workflow</option>
              <option value="reminder">Reminder</option>
              <option value="alert">Alert</option>
            </select>
            <select 
              className="notifications-filter-select" 
              value={priorityFilter}
              onChange={handlePriorityFilter}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select 
              className="notifications-filter-select" 
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <button 
              className="notifications-btn notifications-btn-outline" 
              onClick={clearFilters}
            >
              <i className="fas fa-times"></i>
              Clear
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="notifications-section">
          <div className="notifications-section-header">
            <h2 className="notifications-section-title">Recent Notifications</h2>
            <div className="notifications-bulk-actions">
              <button 
                className="notifications-btn notifications-btn-outline" 
                onClick={selectAll}
              >
                <i className="fas fa-check-square"></i>
                Select All
              </button>
              <button 
                className="notifications-btn notifications-btn-outline" 
                onClick={deleteSelected}
              >
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          
          <div className="notifications-list">
            {isLoading ? (
              <div className="notifications-loading-spinner">
                <div className="notifications-spinner"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notifications-empty-state">
                <i className="fas fa-bell-slash"></i>
                <h3>No notifications found</h3>
                <p>You're all caught up! No notifications match your current filters.</p>
              </div>
            ) : (
              getCurrentPageNotifications().map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.unread ? 'unread' : ''} ${notification.urgent ? 'urgent' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="notification-checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                  />
                  
                  <div className={`notification-icon ${notification.type}`}>
                    <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    <div className="notification-meta">
                      <span className={`notification-type ${notification.type}`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                      <span className={`notification-priority ${notification.priority}`}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                      </span>
                      {notification.urgent && (
                        <span className="notification-priority high">Urgent</span>
                      )}
                    </div>
                    
                    {notification.actions && (
                      <div className="notification-actions">
                        {notification.actions.map((action, index) => (
                          <button
                            key={action}
                            className={`notification-action-btn ${index === 0 ? 'primary' : ''}`}
                            onClick={() => handleAction(action, notification.id)}
                          >
                            {action}
                          </button>
                        ))}
                        <button
                          className="notification-action-btn"
                          onClick={() => markAsRead(notification.id)}
                        >
                          {notification.unread ? 'Mark as Read' : 'Mark as Unread'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredNotifications.length > 0 && (
            <div className="notifications-pagination">
              <div className="notifications-pagination-info">
                Showing {paginationInfo.start}-{paginationInfo.end} of {paginationInfo.total} notifications
              </div>
              <div className="notifications-pagination-controls">
                <button
                  className="notifications-pagination-btn"
                  onClick={previousPage}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      className={`notifications-pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  className="notifications-pagination-btn"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <div className="notifications-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`notifications-toast ${toast.type} show`}>
            <i className={`fas ${
              toast.type === 'success' ? 'fa-check-circle' :
              toast.type === 'error' ? 'fa-exclamation-circle' :
              'fa-info-circle'
            } notifications-toast-icon`}></i>
            <div className="notifications-toast-content">{toast.message}</div>
            <button
              className="notifications-toast-close"
              onClick={() => closeToast(toast.id)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;