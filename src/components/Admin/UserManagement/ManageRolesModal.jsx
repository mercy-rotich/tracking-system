import React, { useState, useEffect } from 'react';

const ManageRolesModal = ({ user, onClose, onUpdateRoles }) => {
  const [currentRoles, setCurrentRoles] = useState([]);
  const [newRoles, setNewRoles] = useState([]);

  const allRoles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'DEAN', label: 'Dean of School' },
    { value: 'QA', label: 'Quality Assurance' },
    { value: 'DEPT_REP', label: 'Department Rep' },
    { value: 'SENATE', label: 'Senate' }
  ];

  useEffect(() => {
    if (user && user.roles) {
      setCurrentRoles([...user.roles]);
    }
  }, [user]);

  const handleRemoveRole = (roleToRemove) => {
    setCurrentRoles(prev => prev.filter(role => role !== roleToRemove));
  };

  const handleNewRoleChange = (e) => {
    const { value, checked } = e.target;
    setNewRoles(prev => 
      checked 
        ? [...prev, value]
        : prev.filter(role => role !== value)
    );
  };

  const handleSubmit = () => {
    const finalRoles = [...currentRoles, ...newRoles];
    const uniqueRoles = [...new Set(finalRoles)];
    onUpdateRoles(user.id, uniqueRoles);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      'ADMIN': 'user-management-role-badge-admin',
      'DEAN': 'user-management-role-badge-dean',
      'QA': 'user-management-role-badge-qa',
      'DEPT_REP': 'user-management-role-badge-dept',
      'SENATE': 'user-management-role-badge-senate'
    };
    return `user-management-role-badge ${roleClasses[role] || ''}`;
  };

  const getRoleLabel = (roleValue) => {
    const role = allRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getAvailableRoles = () => {
    return allRoles.filter(role => 
      !currentRoles.includes(role.value) && !newRoles.includes(role.value)
    );
  };

  if (!user) return null;

  return (
    <div className="user-management-modal user-management-modal-show" onClick={handleBackdropClick}>
      <div className="user-management-modal-backdrop"></div>
      <div className="user-management-modal-content">
        <div className="user-management-modal-header">
          <h3>Manage User Roles</h3>
          <button className="user-management-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="user-management-modal-body">
          <div className="user-management-user-info-header">
            <div className="user-management-user-avatar">{user.avatar}</div>
            <div className="user-management-user-details">
              <h4>{user.firstName} {user.lastName}</h4>
              <p>{user.email}</p>
            </div>
          </div>
          
          <div className="user-management-roles-section">
            <h4>Current Roles</h4>
            <div className="user-management-current-roles">
              {currentRoles.length > 0 ? (
                currentRoles.map(role => (
                  <div key={role} className="user-management-role-item">
                    <span className={getRoleBadgeClass(role)}>
                      {getRoleLabel(role)}
                    </span>
                    <button 
                      type="button" 
                      className="user-management-remove-role-btn" 
                      onClick={() => handleRemoveRole(role)}
                      title={`Remove ${getRoleLabel(role)} role`}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))
              ) : (
                <p className="user-management-no-roles">No roles assigned</p>
              )}
            </div>
          </div>

          {newRoles.length > 0 && (
            <div className="user-management-roles-section">
              <h4>Roles to Add</h4>
              <div className="user-management-current-roles">
                {newRoles.map(role => (
                  <div key={role} className="user-management-role-item">
                    <span className={getRoleBadgeClass(role)}>
                      {getRoleLabel(role)}
                    </span>
                    <button 
                      type="button" 
                      className="user-management-remove-role-btn" 
                      onClick={() => setNewRoles(prev => prev.filter(r => r !== role))}
                      title={`Remove ${getRoleLabel(role)} from selection`}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="user-management-roles-section">
            <h4>Add New Roles</h4>
            <div className="user-management-checkbox-group">
              {getAvailableRoles().length > 0 ? (
                getAvailableRoles().map(role => (
                  <label key={role.value} className="user-management-checkbox-label">
                    <input
                      type="checkbox"
                      value={role.value}
                      checked={newRoles.includes(role.value)}
                      onChange={handleNewRoleChange}
                    />
                    <span className="user-management-checkbox-custom"></span>
                    {role.label}
                  </label>
                ))
              ) : (
                <p className="user-management-no-available-roles">All roles are already assigned or selected</p>
              )}
            </div>
          </div>
        </div>
        <div className="user-management-modal-footer">
          <button type="button" className="user-management-btn user-management-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="user-management-btn user-management-btn-primary" onClick={handleSubmit}>
            Update Roles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageRolesModal;