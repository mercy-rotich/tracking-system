import React, { useState, useEffect } from 'react';
import UserManagementHeader from '../../../components/Admin/UserManagement/UserManagementHeader';
import UserManagementSearchFilter from '../../../components/Admin/UserManagement/UserManagementSearchFilter';
import StatusSection from '../../../components/Admin/UserManagement/StatusSection';
import UsersTable from '../../../components/Admin/UserManagement/UserTable';
import AddUserModal from '../../../components/Admin/UserManagement/AddUserModal';
import ManageRolesModal from '../../../components/Admin/UserManagement/ManageRolesModal';
import ConfirmModal from '../../../components/Admin/UserManagement/ConfirmModal';
import Notification from '../../../components/Admin/UserManagement/Notification';
import authService from '../../../services/authService';
import './UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const UserManagementPage = () => {
  const [modals, setModals] = useState({
    addUser: false,
    manageRoles: false,
    confirm: false
  });
  
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deans: 0,
    pendingAccess: 0
  });

  // Helper function to format user data consistently
  const formatUserData = (userData) => {
    return userData.map(user => ({
      id: user.id,
      firstName: user.firstName || user.first_name || 'Unknown',
      lastName: user.lastName || user.last_name || 'User',
      email: user.email || 'No email',
      username: user.username || user.email || 'No username',
      roles: Array.isArray(user.roles) ? user.roles : (user.roles ? [user.roles] : []),
      status: user.status || user.isActive ? 'active' : 'inactive',
      department: user.department || user.school || user.organization || 'N/A',
      avatar: `${(user.firstName || user.first_name || 'U')[0]}${(user.lastName || user.last_name || '')[0]}`
    }));
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      
      console.log('🔑 Token available:', !!token);
      console.log('🌐 API Base URL:', API_BASE_URL);
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      console.log('📡 Fetching users from:', `${API_BASE_URL}/users`);

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Raw API response:', result);
        
        // Handle different possible response structures
        let usersData = [];
        if (result.data && Array.isArray(result.data)) {
          usersData = result.data;
        } else if (Array.isArray(result)) {
          usersData = result;
        } else if (result.users && Array.isArray(result.users)) {
          usersData = result.users;
        } else {
          console.warn('⚠️ Unexpected API response structure:', result);
          usersData = [];
        }

        console.log('📋 Extracted users data:', usersData);
        
        if (usersData.length > 0) {
          const formattedUsers = formatUserData(usersData);
          console.log('🔄 Formatted users:', formattedUsers);
          setUsers(formattedUsers);
          updateStats(formattedUsers);
          showNotification(`Successfully loaded ${formattedUsers.length} users`, 'success');
        } else {
          console.log('📭 No users found in API response');
          setUsers([]);
          updateStats([]);
          showNotification('No users found in the system', 'info');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ API error response:', errorData);
        
        if (response.status === 401) {
          showNotification('Session expired. Please log in again.', 'error');
          // Optionally redirect to login
          // authService.logout();
          // window.location.href = '/login';
        } else if (response.status === 403) {
          showNotification('You do not have permission to view users.', 'error');
        } else {
          showNotification(errorData.message || `Failed to fetch users (${response.status})`, 'error');
        }
        
        // Use sample data as fallback for development
        console.log('🔄 Using sample data as fallback');
        const sampleUsers = [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Mwangi',
            email: 'john.mwangi@university.ac.ke',
            username: 'jmwangi',
            roles: ['ADMIN', 'QA'],
            status: 'active',
            department: 'Quality Assurance',
            avatar: 'JM'
          },
          {
            id: 2,
            firstName: 'Sarah',
            lastName: 'Achieng',
            email: 's.achieng@university.ac.ke',
            username: 'sachieng',
            roles: ['DEAN'],
            status: 'active',
            department: 'School of Engineering',
            avatar: 'SA'
          }
        ];
        
        setUsers(sampleUsers);
        updateStats(sampleUsers);
      }
    } catch (error) {
      console.error('💥 Network error fetching users:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
      
      // Fallback to empty state
      setUsers([]);
      updateStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update stats based on users data
  const updateStats = (usersData) => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => user.status === 'active').length;
    const deans = usersData.filter(user => user.roles && user.roles.includes('DEAN')).length;
    const pendingAccess = usersData.filter(user => user.status === 'pending').length;
    
    setStats({
      totalUsers,
      activeUsers,
      deans,
      pendingAccess
    });
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (modalName, user = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (user) setSelectedUser(user);
  };

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedUser(null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleRoleFilter = (role) => {
    setFilters(prev => ({ ...prev, role }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const clearFilters = () => {
    setFilters({ search: '', role: '', status: '' });
  };

  // Updated handleAddUser to add user to state
  const handleAddUser = (userData) => {
    console.log('➕ Adding user to state:', userData);
    
    // Create a properly formatted user object
    const newUser = {
      id: userData.id || Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
      roles: userData.roles || [],
      status: userData.status || 'active',
      department: userData.department || userData.school || 'N/A',
      avatar: `${userData.firstName?.[0] || 'U'}${userData.lastName?.[0] || ''}`
    };
    
    // Add the new user to the users array
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers, newUser];
      updateStats(updatedUsers);
      console.log('📊 Updated users count:', updatedUsers.length);
      return updatedUsers;
    });
    
    showNotification('User created successfully and added to table!', 'success');
    closeModal('addUser');
  };

  const handleUpdateRoles = (userId, roles) => {
    console.log('🔄 Updating roles for user:', userId, roles);
    
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.id === userId ? { ...user, roles } : user
      );
      updateStats(updatedUsers);
      return updatedUsers;
    });
    
    showNotification('User roles updated successfully!', 'success');
    closeModal('manageRoles');
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok || response.status === 404) {
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.filter(user => user.id !== userId);
          updateStats(updatedUsers);
          return updatedUsers;
        });
        
        showNotification('User deleted successfully!', 'success');
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user.id !== userId);
        updateStats(updatedUsers);
        return updatedUsers;
      });
      showNotification('User removed from list (check network connection)', 'warning');
    }
    
    closeModal('confirm');
  };

  const handleEditUser = (user) => {
    console.log('✏️ Editing user:', user);
    showNotification('Edit functionality coming soon!', 'info');
  };

  const handleManageRoles = (user) => {
    openModal('manageRoles', user);
  };

  const handleDeleteClick = (user) => {
    openModal('confirm', user);
  };

  // Add refresh function
  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="user-management-dashboard-main-content">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      <div className="user-management-container">
        <UserManagementHeader 
          onAddUser={() => openModal('addUser')} 
          onRefresh={handleRefresh}
        />
        
        <UserManagementSearchFilter
          filters={filters}
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
          onClearFilters={clearFilters}
        />
        
        <StatusSection stats={stats} />
        
        {isLoading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            Loading users...
          </div>
        ) : (
          <UsersTable
            users={users}
            filters={filters}
            onEdit={handleEditUser}
            onManageRoles={handleManageRoles}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {modals.addUser && (
        <AddUserModal
          onClose={() => closeModal('addUser')}
          onAddUser={handleAddUser}
        />
      )}

      {modals.manageRoles && selectedUser && (
        <ManageRolesModal
          user={selectedUser}
          onClose={() => closeModal('manageRoles')}
          onUpdateRoles={handleUpdateRoles}
        />
      )}

      {modals.confirm && selectedUser && (
        <ConfirmModal
          user={selectedUser}
          onClose={() => closeModal('confirm')}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
        />
      )}
    </div>
  );
};

export default UserManagementPage;