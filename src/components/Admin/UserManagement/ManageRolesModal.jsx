import React, { useState, useEffect } from 'react';
import './ManageRoles.css'

const ManageRolesModal = ({ user, onClose, onUpdateRoles, onDeleteRole }) => {
  const [currentRoles, setCurrentRoles] = useState([]);
  const [newRoles, setNewRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('view'); // 'view', 'add', 'delete'

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
    setRoleToDelete(roleToRemove);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    setIsLoading(true);
    try {
      if (onDeleteRole) {
        await onDeleteRole(user.id, roleToDelete);
      }
      setCurrentRoles(prev => prev.filter(role => role !== roleToDelete));
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  const handleNewRoleChange = (e) => {
    const { value, checked } = e.target;
    setNewRoles(prev => 
      checked 
        ? [...prev, value]
        : prev.filter(role => role !== value)
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const finalRoles = [...currentRoles, ...newRoles];
      const uniqueRoles = [...new Set(finalRoles)];
      await onUpdateRoles(user.id, uniqueRoles);
      onClose();
    } catch (error) {
      console.error('Error updating roles:', error);
      alert('Failed to update roles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading && !showDeleteConfirm) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        if (showDeleteConfirm) {
          handleCancelDelete();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isLoading, showDeleteConfirm]);

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
    <div 
      className="user-management-modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div className="user-management-modal-container" style={{ maxWidth: '700px' }}>
        <div className="user-management-modal-header">
          <h2>Manage User Roles</h2>
          <button 
            className="user-management-modal-close" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="user-management-modal-body">
          {/* User Info Header */}
          <div className="user-management-user-info-header">
            <div className="user-management-user-avatar">
              {user.avatar || `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
            </div>
            <div className="user-management-user-details">
              <h4>{user.firstName} {user.lastName}</h4>
              <p>{user.email}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--user-management-gray-200)',
            paddingBottom: '0.5rem'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === 'view' ? 'var(--user-management-must-green)' : 'transparent',
                color: activeTab === 'view' ? 'white' : 'var(--user-management-gray-700)',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fas fa-eye" style={{ marginRight: '0.5rem' }}></i>
              View Current Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === 'add' ? 'var(--user-management-must-blue)' : 'transparent',
                color: activeTab === 'add' ? 'white' : 'var(--user-management-gray-700)',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
              Add New Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('delete')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === 'delete' ? '#dc2626' : 'transparent',
                color: activeTab === 'delete' ? 'white' : 'var(--user-management-gray-700)',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
              Remove Roles
            </button>
          </div>

          {/* Delete Confirmation Overlay */}
          {showDeleteConfirm && (
            <div className="user-management-delete-confirmation-overlay">
              <div className="user-management-delete-confirmation-content">
                <div className="user-management-warning-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  <div>
                    <h4>Confirm Role Removal</h4>
                    <p>
                      Are you sure you want to remove the <strong>{getRoleLabel(roleToDelete)}</strong> role 
                      from <strong>{user.firstName} {user.lastName}</strong>? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="user-management-delete-confirmation-actions">
                  <button
                    type="button"
                    className="user-management-btn user-management-btn-secondary"
                    onClick={handleCancelDelete}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="user-management-btn user-management-btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Removing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash"></i>
                        Remove Role
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'view' && (
            <div>
              <div style={{
                backgroundColor: 'rgba(0, 214, 102, 0.05)',
                border: '1px solid rgba(0, 214, 102, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-info-circle" style={{ color: 'var(--user-management-must-green)' }}></i>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Current User Roles</h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--user-management-gray-700)' }}>
                  These are the roles currently assigned to this user. Use the other tabs to add or remove roles.
                </p>
              </div>
              
              <div className="user-management-current-roles">
                {currentRoles.length > 0 ? (
                  currentRoles.map(role => (
                    <div key={role} className="user-management-role-item" style={{ cursor: 'default' }}>
                      <span className={getRoleBadgeClass(role)}>
                        {getRoleLabel(role)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="user-management-no-roles">No roles assigned to this user</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <div style={{
                backgroundColor: 'rgba(26, 58, 110, 0.05)',
                border: '1px solid rgba(26, 58, 110, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-plus-circle" style={{ color: 'var(--user-management-must-blue)' }}></i>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Add New Roles</h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--user-management-gray-700)' }}>
                  Select the roles you want to add to this user. Click "Update Roles" to save your changes.
                </p>
              </div>

              {/* Roles to Add Preview */}
              {newRoles.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--user-management-gray-700)' }}>
                    Roles to be Added:
                  </h4>
                  <div className="user-management-current-roles">
                    {newRoles.map(role => (
                      <div key={role} className="user-management-role-item user-management-role-item-new">
                        <span className={getRoleBadgeClass(role)}>
                          {getRoleLabel(role)}
                        </span>
                        <button 
                          type="button" 
                          className="user-management-remove-role-btn" 
                          onClick={() => setNewRoles(prev => prev.filter(r => r !== role))}
                          title={`Remove ${getRoleLabel(role)} from selection`}
                          disabled={isLoading}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--user-management-gray-700)' }}>
                Available Roles:
              </h4>
              <div className="user-management-checkbox-group">
                {getAvailableRoles().length > 0 ? (
                  getAvailableRoles().map(role => (
                    <label key={role.value} className="user-management-checkbox-label">
                      <input
                        type="checkbox"
                        value={role.value}
                        checked={newRoles.includes(role.value)}
                        onChange={handleNewRoleChange}
                        disabled={isLoading}
                      />
                      <span className="user-management-checkbox-custom"></span>
                      <span>{role.label}</span>
                    </label>
                  ))
                ) : (
                  <p className="user-management-no-available-roles">
                    All available roles are already assigned to this user
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div>
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.05)',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-exclamation-triangle" style={{ color: '#dc2626' }}></i>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Remove User Roles</h4>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--user-management-gray-700)' }}>
                  <strong>Warning:</strong> Removing roles will immediately revoke the user's access to related features. This action cannot be undone.
                </p>
              </div>
              
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--user-management-gray-700)' }}>
                Current Roles (Click to Remove):
              </h4>
              <div className="user-management-current-roles">
                {currentRoles.length > 0 ? (
                  currentRoles.map(role => (
                    <div key={role} className="user-management-role-item" style={{ 
                      border: '1px solid rgba(220, 38, 38, 0.2)',
                      backgroundColor: 'rgba(220, 38, 38, 0.05)'
                    }}>
                      <span className={getRoleBadgeClass(role)}>
                        {getRoleLabel(role)}
                      </span>
                      <button 
                        type="button" 
                        className="user-management-remove-role-btn" 
                        onClick={() => handleRemoveRole(role)}
                        title={`Remove ${getRoleLabel(role)} role`}
                        disabled={isLoading}
                        style={{
                          backgroundColor: 'rgba(220, 38, 38, 0.1)',
                          color: '#dc2626'
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="user-management-no-roles">No roles to remove - user has no assigned roles</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="user-management-modal-actions">
          <button 
            type="button" 
            className="user-management-btn user-management-btn-secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
            Close
          </button>
          
          {activeTab === 'add' && newRoles.length > 0 && (
            <button 
              type="button" 
              className="user-management-btn user-management-btn-primary" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Adding Roles...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Add Selected Roles ({newRoles.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRolesModal;