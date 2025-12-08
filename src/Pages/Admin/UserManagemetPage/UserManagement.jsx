import React, { useState, useEffect } from 'react';
import UserManagementHeader from '../../../components/Admin/UserManagement/UserManagementHeader';
import UserManagementSearchFilter from '../../../components/Admin/UserManagement/UserManagementSearchFilter';
import StatusSection from '../../../components/Admin/UserManagement/StatusSection';
import UsersTable from '../../../components/Admin/UserManagement/UserTable';
import AddUserModal from '../../../components/Admin/UserManagement/AddUserModal';
import EditUserModal from '../../../components/Admin/UserManagement/EditUserModal';
import ManageRolesModal from '../../../components/Admin/UserManagement/ManageRolesModal';
import ConfirmModal from '../../../components/Admin/UserManagement/ConfirmModal';
import DeleteRoleModal from '../../../components/Admin/UserManagement/DeleteRoleModal'; // ✅ Added Import
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
      showNotification('You do not have permission to view users.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const token = authService.getToken();
      
      if (!token) {
        showNotification('Authentication token not found. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }

      const endpoint = `${API_BASE_URL}/users/get-all-users`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        let usersData = [];
        if (result.data && Array.isArray(result.data)) {
          usersData = result.data;
        } else if (Array.isArray(result)) {
          usersData = result;
        }

        if (usersData.length > 0) {
          const formattedUsers = formatUserData(usersData);
          setUsers(formattedUsers);
          updateStats(formattedUsers);
          showNotification(`Successfully loaded ${formattedUsers.length} users`, 'success');
        } else {
          setUsers([]);
          updateStats([]);
          showNotification('No users found in the system', 'info');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
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
      console.error('Network error fetching users:', error);
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
    
    setStats({ totalUsers, activeUsers, deans, pendingAccess });
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
    if (!canManageUsers) return;
    
    const newUser = {
      id: userData.id || Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
      phoneNumber: userData.phoneNumber,
      roles: userData.roles || [],
      status: userData.enabled ? 'active' : 'inactive',
      department: userData.department || 'N/A',
      avatar: `${userData.firstName?.[0] || 'U'}${userData.lastName?.[0] || ''}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setUsers(prev => {
      const updated = [newUser, ...prev];
      updateStats(updated);
      return updated;
    });
    
    showNotification('User created successfully!', 'success');
    closeModal('addUser');
  };

  const handleUpdateUser = (updatedUser) => {
    if (!canManageUsers) return;
    setUsers(prev => {
      const updated = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      updateStats(updated);
      return updated;
    });
    showNotification('User updated successfully!', 'success');
    closeModal('editUser');
  };

  const handleUpdateRoles = (userId, roles) => {
    if (!canManageUsers) return;
    setUsers(prev => {
      const updated = prev.map(u => u.id === userId ? { ...u, roles } : u);
      updateStats(updated);
      return updated;
    });
    showNotification('User roles updated successfully!', 'success');
    closeModal('manageRoles');
  };

  const handleDeleteRole = async (userId, role) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const endpoint = `${API_BASE_URL}/users/${userId}/roles/${role}/delete`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(prev => {
          const updated = prev.map(user => {
            if (user.id === userId) {
              const updatedRoles = result.data?.roles || user.roles.filter(r => r !== role);
              return { ...user, roles: updatedRoles };
            }
            return user;
          });
          updateStats(updated);
          return updated;
        });
        showNotification(`Role removed successfully!`, 'success');
        closeModal('deleteRole');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.message || 'Failed to remove role', 'error');
      }
    } catch (error) {
      showNotification('Network error deleting role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setUsers(prev => {
          const updated = prev.filter(user => user.id !== userId);
          updateStats(updated);
          return updated;
        });
        showNotification('User deleted successfully', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification(errorData.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Network error deleting user', 'error');
    } finally {
      closeModal('confirm');
    }
  };

  const handleEditUser = (user) => openModal('editUser', user);
  const handleManageRoles = (user) => openModal('manageRoles', user);

 
  const handleDeleteClick = (user) => {
    if(isAdmin) {
      openModal('confirm', user); 
    } else {
      showNotification("Only Admins can delete users", "error");
    }
  };

  const handleRefresh = () => fetchUsers();

  if (authLoading) {
    return (
      <div className="dashboard-main-content">
        <div className="user-management-main-loading">
          <LoadingSpinner message="Checking permissions..." size="large" />
        </div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="dashboard-main-content">
        <div className="access-denied" style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-shield-alt" style={{ fontSize: '3rem', color: '#dc2626' }}></i>
          <h2>Access Denied</h2>
          <p>You don't have permission to manage users.</p>
          <button onClick={() => window.location.reload()} className="btn-primary" style={{marginTop: '1rem'}}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-content">
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
        
        {/* Table displays user list */}
        {isLoading ? (
          <LoadingSpinner message="Loading users..." size="large" />
        ) : (
          <UsersTable
            users={users}
            filters={filters}
            onEdit={handleEditUser}
            onManageRoles={isAdmin ? handleManageRoles : null}
            onDelete={isAdmin ? handleDeleteClick : null} 
          />
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Add User */}
      <PermissionWrapper permission="canManageUsers">
        {modals.addUser && (
          <AddUserModal
            onClose={() => closeModal('addUser')}
            onAddUser={handleAddUser}
          />
        )}
      </PermissionWrapper>

      {/* Edit User */}
      <PermissionWrapper permission="canManageUsers">
        {modals.editUser && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => closeModal('editUser')}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </PermissionWrapper>

      {/* Manage Roles */}
      <PermissionWrapper role="ADMIN">
        {modals.manageRoles && selectedUser && (
          <ManageRolesModal
            user={selectedUser}
            onClose={() => closeModal('manageRoles')}
            onUpdateRoles={handleUpdateRoles}
          />
        )}
      </PermissionWrapper>

      {/* ✅ Delete Role Modal (Added) */}
      <PermissionWrapper role="ADMIN">
        {modals.deleteRole && selectedUser && (
          <DeleteRoleModal
            user={selectedUser}
            onClose={() => closeModal('deleteRole')}
            onDeleteRole={handleDeleteRole}
          />
        )}
      </PermissionWrapper>

      {/* ✅ Confirm User Delete Modal */}
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