import React, { useState } from 'react';

const DeleteRoleModal = ({ user, onClose, onDeleteRole }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'ADMIN': 'Admin',
      'DEAN': 'Dean of School',
      'QA': 'Quality Assurance',
      'DEPT_REP': 'Department Rep',
      'SENATE': 'Senate'
    };
    return roleNames[role] || role;
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) {
      alert('Please select a role to delete');
      return;
    }

    setIsLoading(true);
    
    try {
      await onDeleteRole(user.id, selectedRole);
      onClose();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside modal to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, isLoading]);

  return (
    <div 
      className="user-management-modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div className="user-management-modal-container user-management-confirm-modal">
        <div className="user-management-modal-header">
          <h2>Delete User Role</h2>
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
          <div className="user-management-user-info-display">
            <div className="user-management-user-avatar">
              {user.avatar || `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
            </div>
            <div>
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="user-management-delete-role-content">
            <p>Select a role to remove from this user:</p>
            
            {user.roles && user.roles.length > 0 ? (
              <div className="user-management-role-selection">
                {user.roles.map(role => (
                  <label key={role} className="user-management-role-option">
                    <input
                      type="radio"
                      name="roleToDelete"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      disabled={isLoading}
                    />
                    <span className="user-management-role-label">
                      <span className={`user-management-role-badge user-management-${role.toLowerCase().replace('_', '')}`}>
                        {getRoleDisplayName(role)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="user-management-no-roles">
                This user has no roles to delete.
              </p>
            )}

            {selectedRole && (
              <div className="user-management-warning-message">
                <i className="fas fa-exclamation-triangle"></i>
                <p>
                  Are you sure you want to remove the <strong>{getRoleDisplayName(selectedRole)}</strong> role 
                  from <strong>{user.firstName} {user.lastName}</strong>? This action cannot be undone.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="user-management-modal-actions">
          <button
            type="button"
            className="user-management-btn user-management-btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="user-management-btn user-management-btn-danger"
            onClick={handleDeleteRole}
            disabled={isLoading || !selectedRole || !user.roles || user.roles.length === 0}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Removing Role...
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
  );
};

export default DeleteRoleModal;