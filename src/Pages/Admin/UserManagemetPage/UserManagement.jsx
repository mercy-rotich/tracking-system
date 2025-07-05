import React, { useState, useEffect } from 'react';
import UserManagementHeader from '../../../components/Admin/UserManagement/UserManagementHeader';
import UserManagementSearchFilter from '../../../components/Admin/UserManagement/UserManagementSearchFilter';
import StatusSection from '../../../components/Admin/UserManagement/StatusSection';
import UsersTable from '../../../components/Admin/UserManagement/UserTable';
import AddUserModal from '../../../components/Admin/UserManagement/AddUserModal';
import EditUserModal from '../../../components/Admin/UserManagement/EditUserModal';
import ManageRolesModal from '../../../components/Admin/UserManagement/ManageRolesModal';
import ConfirmModal from '../../../components/Admin/UserManagement/ConfirmModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Notification from '../../../components/Admin/UserManagement/Notification';
import authService from '../../../services/authService';
import PermissionWrapper from '../../../components/Admin/PermissionWrapper';
import { useAuth } from '../../../hooks/UseAuth';
import './UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const UserManagementPage = () => {
  const { canManageUsers, isAdmin, hasPermission, isLoading: authLoading } = useAuth();
  
  const [modals, setModals] = useState({
    addUser: false,
    editUser: false,
    manageRoles: false,
    confirm: false,
    deleteRole: false
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

  const formatUserData = (userData) => {
    return userData.map(user => ({
      id: user.id,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      email: user.email || 'No email',
      username: user.username || user.email || 'No username',
      phoneNumber: user.phoneNumber || null,
      roles: Array.isArray(user.roles) ? user.roles : (user.roles ? [user.roles] : []),
      status: user.enabled ? 'active' : 'inactive',
      department: user.department || user.school || user.organization || 'N/A',
      avatar: `${(user.firstName || 'U')[0]}${(user.lastName || '')[0]}`,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  };

  const fetchUsers = async () => {
    if (!canManageUsers) {
      console.log('User does not have permission to fetch users');
      showNotification('You do not have permission to view users.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = authService.getToken();
      
      console.log('Token available:', !!token);
      console.log('API Base URL:', API_BASE_URL);
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/users/get-all-users`;
      console.log('Fetching users from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Raw API response:', result);
        
        let usersData = [];
        if (result.data && Array.isArray(result.data)) {
          usersData = result.data;
        } else if (Array.isArray(result)) {
          usersData = result;
        } else {
          console.warn('⚠️ Unexpected API response structure:', result);
          usersData = [];
        }

        console.log('Extracted users data:', usersData);
        
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
        } else if (response.status === 403) {
          showNotification('You do not have permission to view users.', 'error');
        } else {
          showNotification(errorData.message || `Failed to fetch users (${response.status})`, 'error');
        }
        
        setUsers([]);
        updateStats([]);
      }
    } catch (error) {
      console.error(' Network error fetching users:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
      
      setUsers([]);
      updateStats([]);
    } finally {
      setIsLoading(false);
    }
    
  };
  

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

  useEffect(() => {
    if (!authLoading && canManageUsers) {
      fetchUsers();
    }
  }, [authLoading, canManageUsers]);

  const openModal = (modalName, user = null) => {
    if ((modalName === 'addUser' || modalName === 'editUser' || modalName === 'manageRoles') && !canManageUsers) {
      showNotification('You do not have permission to perform this action.', 'error');
      return;
    }
    
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

  const handleAddUser = (userData) => {
    if (!canManageUsers) {
      showNotification('You do not have permission to add users.', 'error');
      return;
    }

    console.log('Adding user to state:', userData);
    
    const newUser = {
      id: userData.id || Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
      phoneNumber: userData.phoneNumber || null,
      roles: userData.roles || [],
      status: userData.enabled !== undefined ? (userData.enabled ? 'active' : 'inactive') : 'active',
      department: userData.department || userData.school || 'N/A',
      avatar: `${userData.firstName?.[0] || 'U'}${userData.lastName?.[0] || ''}`,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
    
    setUsers(prevUsers => {
      const updatedUsers = [newUser, ...prevUsers];
      updateStats(updatedUsers);
      console.log('Updated users count:', updatedUsers.length);
      return updatedUsers;
    });
    
    showNotification('User created successfully and added to table!', 'success');
    closeModal('addUser');
  };

  const handleUpdateUser = (updatedUser) => {
    if (!canManageUsers) {
      showNotification('You do not have permission to update users.', 'error');
      return;
    }

    console.log('🔄 Updating user in state:', updatedUser);
    
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      updateStats(updatedUsers);
      return updatedUsers;
    });
    
    showNotification('User updated successfully!', 'success');
    closeModal('editUser');
  };

  const handleUpdateRoles = (userId, roles) => {
    if (!canManageUsers) {
      showNotification('You do not have permission to manage user roles.', 'error');
      return;
    }

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

  const handleDeleteRole = async (userId, role) => {
    console.log('Handling role deletion from parent component...');
    console.log('User ID:', userId, 'Type:', typeof userId);
    console.log('Role to delete:', role);

    try {
      const token = authService.getToken();
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        return;
      }

      const endpoint = `${API_BASE_URL}/users/${userId}/roles/${role}/delete`;
      console.log('DELETE endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Role deletion successful:', result);

        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => {
            if (user.id === userId) {
              const updatedRoles = result.data?.roles || user.roles.filter(r => r !== role);
              return { 
                ...user, 
                roles: updatedRoles,
                updatedAt: result.data?.updatedAt || new Date().toISOString()
              };
            }
            return user;
          });
          updateStats(updatedUsers);
          return updatedUsers;
        });
        
        const allRoles = [
          { value: 'ADMIN', label: 'Admin' },
          { value: 'DEAN', label: 'Dean of School' },
          { value: 'QA', label: 'Quality Assurance' },
          { value: 'DEPT_REP', label: 'Department Rep' },
          { value: 'SENATE', label: 'Senate' },
          { value: 'STAFF', label: 'Staff' }
        ];
        
        const roleObj = allRoles.find(r => r.value === role);
        const roleLabel = roleObj ? roleObj.label : role;
        
        showNotification(`${roleLabel} role removed successfully!`, 'success');
        
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status} - ${response.statusText}`,
          status: response.status 
        }));
        
        console.error('❌ Role deletion failed:', errorData);
        
        let errorMessage = 'Failed to remove role: ';
        
        if (response.status === 401) {
          errorMessage += 'Session expired. Please log in again.';
        } else if (response.status === 403) {
          errorMessage += 'You do not have permission to remove roles.';
        } else if (response.status === 404) {
          errorMessage += 'User or role not found.';
        } else if (response.status === 422) {
          errorMessage += 'Invalid request. The role might not be assigned to this user.';
        } else {
          errorMessage += errorData.message || `Server error (${response.status})`;
        }
        
        showNotification(errorMessage, 'error');
      }
      
    } catch (error) {
      console.error('Network error deleting role:', error);
      
      let errorMessage = 'Failed to remove role: ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += error.message;
      }
      
      showNotification(errorMessage, 'error');
      
      console.log('Role deletion debugging info:', {
        userId: userId,
        userIdType: typeof userId,
        role: role,
        endpoint: `${API_BASE_URL}/users/${userId}/roles/${role}/delete`,
        hasToken: !!authService.getToken(),
        tokenPreview: authService.getToken()?.substring(0, 20) + '...'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = authService.getToken();

      setUsers(prevUsers => {
        const updatedUsers = prevUsers.filter(user => user.id !== userId);
        updateStats(updatedUsers);
        return updatedUsers;
      });
      
      showNotification('User removed from list (API endpoint not available)', 'warning');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user', 'error');
    }
    
    closeModal('confirm');
  };

  const handleEditUser = (user) => {
    openModal('editUser', user);
  };

  const handleManageRoles = (user) => {
    openModal('manageRoles', user);
  };

  const handleDeleteClick = (user) => {
    if (user.roles && user.roles.length > 0) {
      openModal('deleteRole', user);
    } else {
      showNotification('User has no roles to delete', 'info');
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  
  if (authLoading) {
    return (
      <div className="user-management-dashboard-main-content">
        <div className="user-management-main-loading">
          <LoadingSpinner 
            message="Checking permissions..." 
            subtext="Please wait while we verify your access"
            size="large"
          />
        </div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="user-management-dashboard-main-content">
        <div className="access-denied" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: '#dc2626', marginBottom: '1rem' }}></i>
          <h2>Access Denied</h2>
          <p>You don't have permission to manage users.</p>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
            Contact your administrator to request access.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-dashboard-main-content">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      <div className="user-management-container">
        {/* Header with permission check */}
        <PermissionWrapper permission="canManageUsers">
          <UserManagementHeader 
            onAddUser={() => openModal('addUser')} 
            onRefresh={handleRefresh}
          />
        </PermissionWrapper>
        
        <UserManagementSearchFilter
          filters={filters}
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
          onClearFilters={clearFilters}
        />
        
        <StatusSection stats={stats} />
        
        {/* Show loading spinner while fetching users */}
        {isLoading ? (
          <LoadingSpinner 
            message="Loading users..." 
            subtext="Fetching user data from the server"
            size="large"
          />
        ) : (
          <PermissionWrapper 
            anyRole={['ADMIN', 'DEAN']}
            permission="canManageUsers"
            fallback={<div>Limited view for your role</div>}
          >
            <UsersTable
              users={users}
              filters={filters}
              onEdit={handleEditUser}
              onManageRoles={isAdmin ? handleManageRoles : null}
              onDelete={isAdmin ? handleDeleteClick : null}
            />
          </PermissionWrapper>
        )}
      </div>

      {/* Modals with permission checks */}
      <PermissionWrapper permission="canManageUsers">
        {modals.addUser && (
          <AddUserModal
            onClose={() => closeModal('addUser')}
            onAddUser={handleAddUser}
          />
        )}
      </PermissionWrapper>

      <PermissionWrapper permission="canManageUsers">
        {modals.editUser && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => closeModal('editUser')}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </PermissionWrapper>

      <PermissionWrapper role="ADMIN">
        {modals.manageRoles && selectedUser && (
          <ManageRolesModal
            user={selectedUser}
            onClose={() => closeModal('manageRoles')}
            onUpdateRoles={handleUpdateRoles}
          />
        )}
      </PermissionWrapper>

      <PermissionWrapper permission="canManageUsers">
        {modals.confirm && selectedUser && (
          <ConfirmModal
            user={selectedUser}
            onClose={() => closeModal('confirm')}
            onConfirm={() => handleDeleteUser(selectedUser.id)}
          />
        )}
      </PermissionWrapper>
    </div>
  );
};

export default UserManagementPage;