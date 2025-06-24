import React, { useState, useEffect } from 'react';
import UserManagementHeader from '../../../components/Admin/UserManagement/UserManagementHeader';
import UserManagementSearchFilter from '../../../components/Admin/UserManagement/UserManagementSearchFilter';
import StatusSection from '../../../components/Admin/UserManagement/StatusSection';
import UsersTable from '../../../components/Admin/UserManagement/UserTable';
import AddUserModal from '../../../components/Admin/UserManagement/AddUserModal';
import EditUserModal from '../../../components/Admin/UserManagement/EditUserModal';
import ManageRolesModal from '../../../components/Admin/UserManagement/ManageRolesModal';
import ConfirmModal from '../../../components/Admin/UserManagement/ConfirmModal';
import Notification from '../../../components/Admin/UserManagement/Notification';
import authService from '../../../services/authService';
import './UserManagement.css';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const UserManagementPage = () => {
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

      const endpoint = `${API_BASE_URL}/users/get-all-users`;
      console.log('📡 Fetching users from:', endpoint);

      const response = await fetch(endpoint, {
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
        
        let usersData = [];
        if (result.data && Array.isArray(result.data)) {
          usersData = result.data;
        } else if (Array.isArray(result)) {
          usersData = result;
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
        } else if (response.status === 403) {
          showNotification('You do not have permission to view users.', 'error');
        } else {
          showNotification(errorData.message || `Failed to fetch users (${response.status})`, 'error');
        }
        
        setUsers([]);
        updateStats([]);
      }
    } catch (error) {
      console.error('💥 Network error fetching users:', error);
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

  const handleAddUser = (userData) => {
    console.log('➕ Adding user to state:', userData);
    
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
      console.log('📊 Updated users count:', updatedUsers.length);
      return updatedUsers;
    });
    
    showNotification('User created successfully and added to table!', 'success');
    closeModal('addUser');
  };

  const handleUpdateUser = (updatedUser) => {
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
    try {
      const token = authService.getToken();
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        return;
      }

      const endpoint = `${API_BASE_URL}/users/${userId}/roles/${role}/delete`;
      console.log('🗑️ Deleting role from:', endpoint);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        
        setUsers(prevUsers => {
          const updatedUsers = prevUsers.map(user => {
            if (user.id === userId) {
              const updatedRoles = user.roles.filter(r => r !== role);
              return { ...user, roles: updatedRoles };
            }
            return user;
          });
          updateStats(updatedUsers);
          return updatedUsers;
        });
        
        showNotification(`${role} role removed successfully!`, 'success');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Role deletion failed:', errorData);
        showNotification(errorData.message || 'Failed to remove role', 'error');
      }
    } catch (error) {
      console.error('💥 Network error deleting role:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    }
  };

  // Delete entire user 
  const handleDeleteUser = async (userId) => {
    try {
      const token = authService.getToken();
      
      // const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

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

      {/* Add User Modal */}
      {modals.addUser && (
        <AddUserModal
          onClose={() => closeModal('addUser')}
          onAddUser={handleAddUser}
        />
      )}

      {/* Edit User Modal */}
      {modals.editUser && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => closeModal('editUser')}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* Manage Roles Modal */}
      {modals.manageRoles && selectedUser && (
        <ManageRolesModal
          user={selectedUser}
          onClose={() => closeModal('manageRoles')}
          onUpdateRoles={handleUpdateRoles}
        />
      )}

      {/* Delete Role Modal */}
      {modals.deleteRole && selectedUser && (
        <DeleteRoleModal
          user={selectedUser}
          onClose={() => closeModal('deleteRole')}
          onDeleteRole={handleDeleteRole}
        />
      )}

      {/* Confirm Modal  */}
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