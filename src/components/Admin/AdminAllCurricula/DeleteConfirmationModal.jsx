import React, { useState } from 'react';

const DeleteConfirmationModal = ({ 
  isOpen, 
  curriculum, 
  deleteType = 'soft', 
  onConfirm, 
  onClose 
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedDeleteType, setSelectedDeleteType] = useState(deleteType);

  if (!isOpen || !curriculum) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(selectedDeleteType);
    } catch (error) {
      console.error('Error in delete confirmation:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (!isConfirming) {
      onClose();
    }
  };

  const getDeleteInfo = () => {
    if (selectedDeleteType === 'permanent') {
      return {
        title: 'Permanently Delete Curriculum',
        icon: 'fa-exclamation-triangle',
        iconColor: '#ef4444',
        description: 'This curriculum will be permanently removed from the system and cannot be recovered.',
        actionText: 'Permanently Delete',
        buttonClass: 'btn-danger',
        warningText: 'This action is irreversible!'
      };
    } else {
      return {
        title: 'Inactivate Curriculum',
        icon: 'fa-eye-slash',
        iconColor: '#f59e0b',
        description: 'This curriculum will be marked as inactive and hidden from public view, but can be reactivated later.',
        actionText: 'Inactivate',
        buttonClass: 'btn-warning',
        warningText: 'This can be undone by reactivating the curriculum.'
      };
    }
  };

  const deleteInfo = getDeleteInfo();

  return (
    <div className="modal-overlay" onClick={!isConfirming ? onClose : undefined}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm Action</h2>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={isConfirming}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="delete-content" style={{ padding: '1.5rem' }}>
          {/* Delete Type Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1rem', 
              fontWeight: '600',
              color: '#374151' 
            }}>
              Choose Action Type:
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Soft Delete Option */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                border: `2px solid ${selectedDeleteType === 'soft' ? '#f59e0b' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedDeleteType === 'soft' ? 'rgba(245, 158, 11, 0.05)' : '#ffffff',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio"
                  name="deleteType"
                  value="soft"
                  checked={selectedDeleteType === 'soft'}
                  onChange={(e) => setSelectedDeleteType(e.target.value)}
                  disabled={isConfirming}
                  style={{ marginTop: '0.125rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-eye-slash" style={{ color: '#f59e0b' }}></i>
                    Inactivate (Recommended)
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    Hide from public view but keep in system. Can be reactivated later.
                  </div>
                </div>
              </label>

              {/* Permanent Delete Option */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                border: `2px solid ${selectedDeleteType === 'permanent' ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedDeleteType === 'permanent' ? 'rgba(239, 68, 68, 0.05)' : '#ffffff',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="radio"
                  name="deleteType"
                  value="permanent"
                  checked={selectedDeleteType === 'permanent'}
                  onChange={(e) => setSelectedDeleteType(e.target.value)}
                  disabled={isConfirming}
                  style={{ marginTop: '0.125rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#374151',
                    marginBottom: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                    Permanently Delete
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    Completely remove from system. This action cannot be undone.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Curriculum Information */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '0.875rem', 
              fontWeight: '600',
              color: '#374151' 
            }}>
              Curriculum Details:
            </h4>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
              <div><strong>Title:</strong> {curriculum.title}</div>
              <div><strong>Code:</strong> {curriculum.code}</div>
              <div><strong>Department:</strong> {curriculum.department}</div>
              <div><strong>Status:</strong> {curriculum.status}</div>
              {curriculum.enrollments > 0 && (
                <div style={{ color: '#ef4444', fontWeight: '500', marginTop: '0.5rem' }}>
                  <i className="fas fa-users" style={{ marginRight: '0.25rem' }}></i>
                  {curriculum.enrollments} students currently enrolled
                </div>
              )}
            </div>
          </div>

          {/* Action Confirmation */}
          <div style={{
            padding: '1rem',
            backgroundColor: selectedDeleteType === 'permanent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${selectedDeleteType === 'permanent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <i 
                className={`fas ${deleteInfo.icon}`} 
                style={{ 
                  fontSize: '2rem', 
                  color: deleteInfo.iconColor,
                  marginBottom: '0.5rem'
                }}
              ></i>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '1.125rem', 
                fontWeight: '600',
                color: '#374151' 
              }}>
                {deleteInfo.title}
              </h3>
              <p style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '0.875rem', 
                color: '#6b7280',
                lineHeight: '1.4' 
              }}>
                {deleteInfo.description}
              </p>
              <div style={{ 
                fontSize: '0.8rem', 
                fontWeight: '600',
                color: deleteInfo.iconColor 
              }}>
                {deleteInfo.warningText}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={handleClose}
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={`btn ${deleteInfo.buttonClass}`}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className={`fas ${deleteInfo.icon}`}></i>
                {deleteInfo.actionText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;