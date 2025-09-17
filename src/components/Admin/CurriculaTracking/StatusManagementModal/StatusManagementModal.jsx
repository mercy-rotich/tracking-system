// src/components/Admin/CurriculaTracking/StatusManagementModal/StatusManagementModal.jsx

import React, { useState } from 'react';

const StatusManagementModal = ({ curriculum, onClose, onStatusChange }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  const statusActions = [
    {
      id: 'activate',
      label: 'Activate Tracking',
      icon: 'fas fa-play',
      color: 'var(--tracking-success)',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      description: 'Activate this tracking to make it available for workflow processing',
      disabled: curriculum?.isActive,
      confirmMessage: 'Are you sure you want to activate this tracking? This will make it available for workflow processing.'
    },
    {
      id: 'deactivate',
      label: 'Deactivate Tracking',
      icon: 'fas fa-pause',
      color: 'var(--tracking-warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      description: 'Temporarily deactivate this tracking (can be reactivated later)',
      disabled: !curriculum?.isActive,
      confirmMessage: 'Are you sure you want to deactivate this tracking? This will pause the approval process but can be reversed later.'
    }
  ];

  const getSelectedActionInfo = () => {
    return statusActions.find(action => action.id === selectedAction);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    
    if (!selectedAction) {
      alert('Please select an action to perform.');
      return;
    }

    if (!confirmationStep) {
      setConfirmationStep(true);
      return;
    }

    const actionInfo = getSelectedActionInfo();
    
    setIsProcessing(true);

    try {
      const isCurrentlyActive = curriculum?.isActive;
      await onStatusChange(curriculum.id, isCurrentlyActive, statusNotes);
      onClose();
    } catch (error) {
      console.error('Error changing tracking status:', error);
      alert('Failed to change tracking status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setConfirmationStep(false);
    setSelectedAction('');
    setStatusNotes('');
  };

  const selectedActionInfo = getSelectedActionInfo();

  if (confirmationStep) {
    return (
      <div className="tracking-modal-overlay" onClick={onClose}>
        <div className="tracking-modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
          <div className="tracking-modal-header">
            <div className="tracking-modal-title">
              <i className="fas fa-exclamation-triangle" style={{ color: 'var(--tracking-warning)' }}></i>
              Confirm Status Change
            </div>
            <button className="tracking-modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="tracking-modal-body">
            {/* Confirmation Details */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: selectedActionInfo?.bgColor,
              border: `1px solid ${selectedActionInfo?.borderColor}`,
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 1rem',
                backgroundColor: selectedActionInfo?.color,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                <i className={selectedActionInfo?.icon}></i>
              </div>
              
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: 'var(--tracking-text-primary)', 
                marginBottom: '0.5rem' 
              }}>
                {selectedActionInfo?.label}
              </h3>
              
              <p style={{ 
                color: 'var(--tracking-text-secondary)', 
                fontSize: '0.875rem',
                lineHeight: '1.5',
                marginBottom: '1rem'
              }}>
                {selectedActionInfo?.confirmMessage}
              </p>

              {/* Curriculum Info */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                padding: '1rem',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  {curriculum?.title}
                </div>
                <div style={{ color: 'var(--tracking-text-muted)' }}>
                  {curriculum?.trackingId} • {curriculum?.school}
                </div>
              </div>
            </div>

            {/* Status Notes */}
            <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
              <label className="tracking-form-label">
                Reason for Status Change (Optional)
              </label>
              <textarea
                className="tracking-form-control"
                rows="3"
                placeholder="Add any notes about why you're changing the status..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>

            {/* Impact Information */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px'
            }}>
              <h5 style={{ 
                margin: '0 0 0.5rem 0', 
                color: 'var(--tracking-text-primary)',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: 'var(--tracking-danger)' }}></i>
                Impact of This Action
              </h5>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.75rem', lineHeight: 1.4 }}>
                {selectedAction === 'deactivate' ? (
                  <>
                    <li>The tracking will be temporarily suspended from the workflow</li>
                    <li>No further stage actions can be performed until reactivated</li>
                    <li>Current assignee will be notified of the status change</li>
                    <li>All data and progress will be preserved</li>
                    <li>This action can be reversed by reactivating the tracking</li>
                  </>
                ) : (
                  <>
                    <li>The tracking will be restored to active status</li>
                    <li>Workflow processing will resume from the current stage</li>
                    <li>Current assignee will be notified of the reactivation</li>
                    <li>All previously saved data and progress will remain intact</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="tracking-modal-footer">
            <button 
              type="button"
              className="tracking-btn tracking-btn-outline"
              onClick={resetForm}
              disabled={isProcessing}
            >
              <i className="fas fa-arrow-left"></i>
              Back
            </button>
            
            <button 
              type="button"
              className="tracking-btn tracking-btn-outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              className={`tracking-btn ${
                selectedAction === 'activate' ? 'tracking-btn-success' : 'tracking-btn-warning'
              }`}
              onClick={handleStatusChange}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className={selectedActionInfo?.icon}></i>
                  Confirm {selectedActionInfo?.label}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className="fas fa-cog"></i>
            Manage Tracking Status - {curriculum?.trackingId}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="tracking-modal-body">
          {/* Current Status Display */}
          <div className="tracking-curriculum-info" style={{
            padding: '1rem',
            backgroundColor: 'var(--tracking-bg-secondary)',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--tracking-text-primary)' }}>
              {curriculum?.title}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginBottom: '0.25rem' }}>
                  Current Status
                </div>
                <span className={`tracking-badge ${
                  curriculum?.isActive ? 'tracking-badge-success' : 'tracking-badge-warning'
                }`}>
                  <i className={`fas fa-${curriculum?.isActive ? 'check-circle' : 'pause-circle'}`}></i>
                  {curriculum?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginBottom: '0.25rem' }}>
                  Workflow Status
                </div>
                <span className={`tracking-badge tracking-badge-${curriculum?.status}`}>
                  {curriculum?.statusDisplayName}
                </span>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginBottom: '0.25rem' }}>
                  Current Stage
                </div>
                <span className="tracking-badge tracking-badge-neutral">
                  {curriculum?.currentStageDisplayName}
                </span>
              </div>
            </div>

            {/* Additional Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <strong>School:</strong> {curriculum?.school}
              </div>
              <div>
                <strong>Department:</strong> {curriculum?.department}
              </div>
              <div>
                <strong>Current Assignee:</strong> {curriculum?.currentAssigneeName || 'Not assigned'}
              </div>
              <div>
                <strong>Last Updated:</strong> {curriculum?.lastUpdated || 'Unknown'}
              </div>
            </div>
          </div>

          <form onSubmit={handleStatusChange}>
            <div className="tracking-form-group">
              <label className="tracking-form-label">Select Action *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {statusActions.map(action => (
                  <div
                    key={action.id}
                    className={`tracking-action-option ${selectedAction === action.id ? 'selected' : ''} ${action.disabled ? 'disabled' : ''}`}
                    style={{
                      padding: '1.25rem',
                      border: `2px solid ${selectedAction === action.id ? action.color : 'var(--tracking-border)'}`,
                      borderRadius: '8px',
                      cursor: action.disabled ? 'not-allowed' : 'pointer',
                      opacity: action.disabled ? 0.5 : 1,
                      backgroundColor: selectedAction === action.id ? action.bgColor : 'var(--tracking-bg-card)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => !action.disabled && setSelectedAction(action.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: action.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.125rem'
                      }}>
                        <i className={action.icon}></i>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                          {action.label}
                          {selectedAction === action.id && (
                            <i className="fas fa-check-circle" style={{ 
                              marginLeft: '0.5rem', 
                              color: 'var(--tracking-success)' 
                            }}></i>
                          )}
                        </div>
                        {action.disabled && (
                          <span className="tracking-badge tracking-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                            Not Available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)', lineHeight: '1.4' }}>
                      {action.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'var(--tracking-bg-secondary)',
              borderRadius: '8px'
            }}>
              <h5 style={{ 
                margin: '0 0 0.75rem 0', 
                color: 'var(--tracking-text-primary)',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="fas fa-history"></i>
                Status History
              </h5>
              
              <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Created:</strong> {curriculum?.submittedDate || 'Unknown'}
                  <span style={{ marginLeft: '1rem', color: 'var(--tracking-text-muted)' }}>
                    Initial submission
                  </span>
                </div>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Last Status Change:</strong> {curriculum?.lastUpdated || 'Unknown'}
                  <span style={{ marginLeft: '1rem', color: 'var(--tracking-text-muted)' }}>
                    Updated to {curriculum?.statusDisplayName}
                  </span>
                </div>
                
                <div>
                  <strong>Current State:</strong> {curriculum?.isActive ? 'Active' : 'Inactive'}
                  <span style={{ marginLeft: '1rem', color: 'var(--tracking-text-muted)' }}>
                    {curriculum?.isActive ? 'Available for workflow processing' : 'Suspended from workflow'}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Information */}
            {selectedAction && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px'
              }}>
                <h5 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: 'var(--tracking-text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-info-circle" style={{ color: 'var(--tracking-info)' }}></i>
                  What happens next?
                </h5>
                <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-secondary)', lineHeight: '1.4' }}>
                  {selectedAction === 'deactivate' ? 
                    'This tracking will be temporarily removed from the active workflow. You can reactivate it later to resume processing.' :
                    'This tracking will be restored to the active workflow and can proceed through the approval stages.'
                  }
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="tracking-modal-footer">
          <button 
            type="button"
            className="tracking-btn tracking-btn-outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            className={`tracking-btn ${
              selectedAction === 'activate' ? 'tracking-btn-success' : 'tracking-btn-warning'
            }`}
            onClick={handleStatusChange}
            disabled={isProcessing || !selectedAction}
          >
            {selectedAction === 'activate' ? (
              <>
                <i className="fas fa-play"></i>
                Continue to Activate
              </>
            ) : (
              <>
                <i className="fas fa-pause"></i>
                Continue to Deactivate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusManagementModal;