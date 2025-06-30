import React from 'react';


const UserManagementHeader = ({ onAddUser }) => {
  const handleExportUsers = () => {
    console.log('Exporting users...');
    
  };

  return (
    <div className="user-management-page-header">
      <div className="user-management-header-content">
        <div className="user-management-header-text">
          <h1>User Management</h1>
          <p>Manage users, assign roles, and control system access</p>
        </div>
        <div className="user-management-header-actions">
          <button className="user-management-btn user-management-btn-secondary" onClick={handleExportUsers}>
            <i className="fas fa-download"></i>
            Export Users
          </button>
          <button className="user-management-btn user-management-btn-primary" onClick={onAddUser}>
            <i className="fas fa-user-plus"></i>
            Add New User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;