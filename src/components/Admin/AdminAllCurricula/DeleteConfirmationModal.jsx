import React from 'react';

const DeleteConfirmationModal = ({ isOpen, curriculum, onConfirm, onClose }) => {
  if (!isOpen || !curriculum) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm Delete</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="delete-content">
          <div className="delete-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Delete Curriculum</h3>
          <p>
            Are you sure you want to delete <strong>"{curriculum.title}"</strong>? 
            This action cannot be undone and will affect {curriculum.enrollments} enrolled students.
          </p>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            <i className="fas fa-trash"></i>
            Delete Curriculum
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;