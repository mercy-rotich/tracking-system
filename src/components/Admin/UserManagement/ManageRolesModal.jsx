import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import './ManageRoles.css'

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const ManageRolesModal = ({ user, onClose, onUpdateRoles, onDeleteRole }) => {
  const [currentRoles, setCurrentRoles] = useState([]);
  const [newRoles, setNewRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('view'); 

  const allRoles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'DEAN', label: 'Dean of School' },
    { value: 'QA', label: 'Quality Assurance' },
    { value: 'DEPT_REP', label: 'Department Rep' },
    { value: 'SENATE', label: 'Senate' },
    { value: 'STAFF', label: 'Staff' }
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
    console.log(' Starting role deletion process...');
    console.log(' User ID:', user.id);
    console.log(' Role to delete:', roleToDelete);

    try {
      const token = authService.getToken();
      
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      
      const endpoint = `${API_BASE_URL}/users/${user.id}/roles/${roleToDelete}/delete`;
      console.log(' DELETE endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(' DELETE response status:', response.status);
      console.log(' DELETE response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Role deletion successful:', result);

        if (result.data && result.data.roles) {
          setCurrentRoles(result.data.roles);
          
          
          if (onUpdateRoles) {
            onUpdateRoles(user.id, result.data.roles);
          }
        } else {
        
          setCurrentRoles(prev => prev.filter(role => role !== roleToDelete));
          
          if (onUpdateRoles) {
            const updatedRoles = currentRoles.filter(role => role !== roleToDelete);
            onUpdateRoles(user.id, updatedRoles);
          }
        }

        
        setShowDeleteConfirm(false);
        setRoleToDelete(null);

        
        const roleLabel = getRoleLabel(roleToDelete);
        alert(`Successfully removed ${roleLabel} role from ${user.firstName} ${user.lastName}`);

      
        if (onDeleteRole) {
          try {
            await onDeleteRole(user.id, roleToDelete);
          } catch (callbackError) {
            console.warn('Legacy onDeleteRole callback failed:', callbackError);
          }
        }

      } else {
        const errorData = await response.json().catch(() => ({ 
          message: `HTTP ${response.status} - ${response.statusText}`,
          status: response.status 
        }));
        
        console.error('❌ Role deletion failed:', errorData);
        
        let errorMessage = 'Failed to remove role: ';
        
        if (response.status === 401) {
          errorMessage += 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage += 'You do not have permission to remove roles.';
        } else if (response.status === 404) {
          errorMessage += 'User or role not found.';
        } else if (response.status === 422) {
          errorMessage += 'Invalid request. The role might not be assigned to this user.';
        } else {
          errorMessage += errorData.message || `Server error (${response.status})`;
        }
        
        alert(errorMessage);
      }

    } catch (error) {
      console.error('💥 Network error deleting role:', error);
      
      let errorMessage = 'Failed to remove role: ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      
   
      console.log(' Role deletion debugging info:', {
        user: {
          id: user.id,
          email: user.email,
          type_of_id: typeof user.id
        },
        roleToDelete: roleToDelete,
        endpoint: `${API_BASE_URL}/users/${user.id}/roles/${roleToDelete}/delete`,
        hasToken: !!authService.getToken(),
        tokenPreview: authService.getToken()?.substring(0, 20) + '...'
      });
      
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
    if (newRoles.length === 0) {
      alert('Please select at least one role to assign.');
      return;
    }

    setIsLoading(true);
    console.log(' Starting role assignment process...');
    console.log(' User:', { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}` });
    console.log('Roles to assign:', newRoles);

    try {
      const token = authService.getToken();
      
      if (!token) {
        alert('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      console.log('Token present:', !!token);
      console.log(' API Base URL:', API_BASE_URL);

      
      const assignmentPromises = newRoles.map(async (role) => {
        const endpoint = `${API_BASE_URL}/users/assign-role`;
        
       
        const requestBodyOptions = [
         
          {
            userId: user.id,
            role: role
          },
          
          {
            userId: user.id.toString(),
            role: role
          },
          
          {
            userId: parseInt(user.id),
            role: role
          },
          
          {
            user_id: user.id,
            role: role
          },
          {
            userId: user.id,
            roleName: role
          },
          {
            user_id: user.id,
            role_name: role
          }
        ];
        
        console.log('🔗 Assigning role:', role, 'to user:', user.id);
        
        let lastError = null;
        
        for (let i = 0; i < requestBodyOptions.length; i++) {
          const requestBody = requestBodyOptions[i];
          console.log(`🧪 Trying format ${i + 1} for role ${role}:`, requestBody);
          
          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });

            console.log(`📡 Response status for ${role}:`, response.status);

            if (response.ok) {
              const result = await response.json();
              console.log(`✅ Successfully assigned ${role}:`, result);
              return result;
            } else {
              const errorData = await response.json().catch(() => ({ 
                message: `HTTP ${response.status}`,
                status: response.status 
              }));
              
              console.error(`❌ Format ${i + 1} failed for ${role}:`, errorData);
              lastError = errorData;
              
              if (response.status === 401 || response.status === 403) {
                throw new Error(errorData.message || 'Authentication/Authorization failed');
              }
              
              continue;
            }
          } catch (fetchError) {
            console.error(`💥 Network error with format ${i + 1} for ${role}:`, fetchError);
            lastError = fetchError;
            continue;
          }
        }
        throw new Error(lastError?.message || `Failed to assign role ${role} - all request formats failed`);
      });

      const results = await Promise.all(assignmentPromises);
      
      console.log('✅ All role assignments completed:', results);
      
     
      const lastResult = results[results.length - 1];
      const updatedUserData = lastResult?.data;
      
      if (updatedUserData && updatedUserData.roles) {
       
        setCurrentRoles(updatedUserData.roles);
        
        if (onUpdateRoles) {
          onUpdateRoles(user.id, updatedUserData.roles);
        }
        
        console.log('🔄 Updated local state with roles:', updatedUserData.roles);
      } else {
        
        const expectedRoles = [...currentRoles, ...newRoles];
        setCurrentRoles(expectedRoles);
        
        if (onUpdateRoles) {
          onUpdateRoles(user.id, expectedRoles);
        }
        
        console.log('🔄 Updated local state with expected roles:', expectedRoles);
      }
      
      
      setNewRoles([]);
      
     
      const assignedRoleNames = newRoles.map(role => {
        const roleObj = allRoles.find(r => r.value === role);
        return roleObj ? roleObj.label : role;
      }).join(', ');
      
      alert(`Successfully assigned ${assignedRoleNames} role(s) to ${user.firstName} ${user.lastName}`);
      
      onClose();
      
    } catch (error) {
      console.error('💥 Error assigning roles:', error);
      
   
      let errorMessage = 'Failed to assign roles: ';
      
      if (error.message.includes('validation')) {
        errorMessage += 'Request validation failed. Please check the required fields.';
      } else if (error.message.includes('401') || error.message.includes('Authentication')) {
        errorMessage += 'Authentication failed. Please log in again.';
      } else if (error.message.includes('403') || error.message.includes('Authorization')) {
        errorMessage += 'You do not have permission to assign roles.';
      } else if (error.message.includes('404')) {
        errorMessage += 'API endpoint not found. Please check the endpoint URL.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Server error. Please try again later or contact support.';
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
      
      
      console.log(' Debugging info:', {
        user: {
          id: user.id,
          email: user.email,
          type_of_id: typeof user.id
        },
        selectedRoles: newRoles,
        apiEndpoint: `${API_BASE_URL}/users/assign-role`,
        hasToken: !!authService.getToken(),
        tokenPreview: authService.getToken()?.substring(0, 20) + '...'
      });
      
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
      'SENATE': 'user-management-role-badge-senate',
      'STAFF': 'user-management-role-badge-staff'
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
          
          <div className="user-management-user-info-header">
            <div className="user-management-user-avatar">
              {user.avatar || `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
            </div>
            <div className="user-management-user-details">
              <h4>{user.firstName} {user.lastName}</h4>
              <p>{user.email}</p>
              {/*  debugging info */}
              <small style={{ color: '#666', fontSize: '0.75rem' }}>
                ID: {user.id} | Type: {typeof user.id}
              </small>
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
                  Select the roles you want to add to this user. Click "Assign Selected Roles" to save your changes.
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
                  Assigning Roles...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Assign Selected Roles ({newRoles.length})
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