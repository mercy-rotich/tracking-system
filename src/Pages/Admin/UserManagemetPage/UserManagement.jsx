import React, { useState } from 'react';
import UserManagementHeader from '../../../components/Admin/UserManagement/UserManagementHeader';
import UserManagementSearchFilter from '../../../components/Admin/UserManagement/UserManagementSearchFilter';
import StatusSection from '../../../components/Admin/UserManagement/StatusSection';
import UsersTable from '../../../components/Admin/UserManagement/UserTable';
import AddUserModal from '../../../components/Admin/UserManagement/AddUserModal';
import ManageRolesModal from '../../../components/Admin/UserManagement/ManageRolesModal';
import ConfirmModal from '../../../components/Admin/UserManagement/ConfirmModal';
import Notification from '../../../components/Admin/UserManagement/Notification';
import './UserManagement.css';

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

  // Sample users data
  const [users] = useState([
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
    },
    {
      id: 3,
      firstName: 'David',
      lastName: 'Kimani',
      email: 'd.kimani@university.ac.ke',
      username: 'dkimani',
      roles: ['DEPT_REP'],
      status: 'inactive',
      department: 'Computer Science Dept',
      avatar: 'DK'
    },
    {
      id: 4,
      firstName: 'Mary',
      lastName: 'Njeri',
      email: 'm.njeri@university.ac.ke',
      username: 'mnjeri',
      roles: ['DEAN'],
      status: 'active',
      department: 'School of Medicine',
      avatar: 'MN'
    },
    {
      id: 5,
      firstName: 'Peter',
      lastName: 'Ochieng',
      email: 'p.ochieng@university.ac.ke',
      username: 'pochieng',
      roles: ['SENATE'],
      status: 'active',
      department: 'University Senate',
      avatar: 'PO'
    }
  ]);

  const stats = {
    totalUsers: 247,
    activeUsers: 218,
    deans: 12,
    pendingAccess: 8
  };

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
    console.log('Adding user:', userData);
    showNotification('User created successfully!', 'success');
    closeModal('addUser');
  };

  const handleUpdateRoles = (userId, roles) => {
    console.log('Updating roles for user:', userId, roles);
    showNotification('User roles updated successfully!', 'success');
    closeModal('manageRoles');
  };

  const handleDeleteUser = (userId) => {
    console.log('Deleting user:', userId);
    showNotification('User deleted successfully!', 'success');
    closeModal('confirm');
  };

  const handleEditUser = (user) => {
    console.log('Editing user:', user);
    // Implementation for edit user
  };

  const handleManageRoles = (user) => {
    openModal('manageRoles', user);
  };

  const handleDeleteClick = (user) => {
    openModal('confirm', user);
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
        <UserManagementHeader onAddUser={() => openModal('addUser')} />
        
        <UserManagementSearchFilter
          filters={filters}
          onSearch={handleSearch}
          onRoleFilter={handleRoleFilter}
          onStatusFilter={handleStatusFilter}
          onClearFilters={clearFilters}
        />
        
        <StatusSection stats={stats} />
        
        <UsersTable
          users={users}
          filters={filters}
          onEdit={handleEditUser}
          onManageRoles={handleManageRoles}
          onDelete={handleDeleteClick}
        />
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