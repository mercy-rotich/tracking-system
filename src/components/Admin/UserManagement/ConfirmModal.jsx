import React from 'react';


const ConfirmModal = ({ user, onClose, onConfirm }) => {
  if (!user) return null;

  return (
    <div className="user-management-modal user-management-modal-show">
      <div className="user-management-modal-backdrop" onClick={onClose}></div>
      <div className="user-management-modal-content user-management-modal-sm">
        <div className="user-management-modal-header">
          <h3>Confirm Action</h3>
          <button className="user-management-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="user-management-modal-body">
          <div className="user-management-confirm-content">
            <div className="user-management-confirm-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <p>
              Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong>? 
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="user-management-modal-footer">
          <button 
            type="button" 
            className="user-management-btn user-management-btn-outline" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="user-management-btn user-management-btn-danger" 
            onClick={onConfirm}
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;