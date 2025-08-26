// Enhanced tracking modal components for new features

import React, { useState, useEffect } from 'react';

// ===============================
// EDIT TRACKING MODAL
// ===============================

const EditTrackingModal = ({ curriculum, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    proposedCurriculumName: '',
    proposedCurriculumCode: '',
    proposedDurationSemesters: '',
    curriculumDescription: '',
    schoolId: '',
    departmentId: '',
    academicLevelId: '',
    proposedEffectiveDate: '',
    proposedExpiryDate: '',
    initialNotes: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (curriculum) {
      setFormData({
        proposedCurriculumName: curriculum.proposedCurriculumName || curriculum.title || '',
        proposedCurriculumCode: curriculum.proposedCurriculumCode || curriculum.code || '',
        proposedDurationSemesters: curriculum.proposedDurationSemesters?.toString() || curriculum.durationSemesters?.toString() || '',
        curriculumDescription: curriculum.curriculumDescription || curriculum.description || '',
        schoolId: curriculum.schoolId?.toString() || '',
        departmentId: curriculum.departmentId?.toString() || '',
        academicLevelId: curriculum.academicLevelId?.toString() || '',
        proposedEffectiveDate: curriculum.proposedEffectiveDate || '',
        proposedExpiryDate: curriculum.proposedExpiryDate || '',
        initialNotes: curriculum.initialNotes || ''
      });
    }
  }, [curriculum]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setDocuments(files);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updateData = {
        ...formData,
        documents
      };

      await onUpdate(curriculum.id, updateData);
      onClose();
    } catch (error) {
      console.error('Error updating tracking:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className="fas fa-edit"></i>
            Edit Tracking - {curriculum?.trackingId}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="tracking-modal-body">
          <form onSubmit={handleUpdate}>
            <div className="tracking-form-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="tracking-form-group">
                <label className="tracking-form-label">Curriculum Name *</label>
                <input
                  type="text"
                  name="proposedCurriculumName"
                  value={formData.proposedCurriculumName}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  required
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">Curriculum Code *</label>
                <input
                  type="text"
                  name="proposedCurriculumCode"
                  value={formData.proposedCurriculumCode}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  required
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">Duration (Semesters) *</label>
                <input
                  type="number"
                  name="proposedDurationSemesters"
                  value={formData.proposedDurationSemesters}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  min="1"
                  required
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">School ID *</label>
                <input
                  type="number"
                  name="schoolId"
                  value={formData.schoolId}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  required
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">Department ID *</label>
                <input
                  type="number"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  required
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">Academic Level ID *</label>
                <input
                  type="number"
                  name="academicLevelId"
                  value={formData.academicLevelId}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                  required
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">Effective Date</label>
                <input
                  type="date"
                  name="proposedEffectiveDate"
                  value={formData.proposedEffectiveDate}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                />
              </div>

              <div className="tracking-form-group">
                <label className="tracking-form-label">Expiry Date</label>
                <input
                  type="date"
                  name="proposedExpiryDate"
                  value={formData.proposedExpiryDate}
                  onChange={handleInputChange}
                  className="tracking-form-control"
                />
              </div>
            </div>

            <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
              <label className="tracking-form-label">Description *</label>
              <textarea
                name="curriculumDescription"
                value={formData.curriculumDescription}
                onChange={handleInputChange}
                className="tracking-form-control"
                rows="3"
                required
              />
            </div>

            <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
              <label className="tracking-form-label">Initial Notes</label>
              <textarea
                name="initialNotes"
                value={formData.initialNotes}
                onChange={handleInputChange}
                className="tracking-form-control"
                rows="2"
              />
            </div>

            <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
              <label className="tracking-form-label">Additional Documents</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="tracking-form-control"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem' }}>
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </div>
            </div>
          </form>
        </div>

        <div className="tracking-modal-footer">
          <button 
            type="button"
            className="tracking-btn tracking-btn-outline"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            className="tracking-btn tracking-btn-primary"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Update Tracking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================
// ASSIGN TRACKING MODAL
// ===============================

const AssignTrackingModal = ({ curriculum, onClose, onAssign }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([
    // Mock users - replace with actual API call
    { id: 1, name: 'Dr. Sarah Mitchell', email: 'qa.director@university.edu' },
    { id: 2, name: 'Dr. Grace Mbugua', email: 'hod.earl.chil.educ@se.university.edu' },
    { id: 3, name: 'Prof. John Doe', email: 'john.doe@university.edu' },
    { id: 4, name: 'Dr. Jane Smith', email: 'jane.smith@university.edu' }
  ]);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      alert('Please select a user to assign this tracking to.');
      return;
    }

    setIsAssigning(true);

    try {
      await onAssign(curriculum.id, selectedUserId);
      onClose();
    } catch (error) {
      console.error('Error assigning tracking:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tracking-modal-header">
          <div className="tracking-modal-title">
            <i className="fas fa-user-plus"></i>
            Assign Tracking - {curriculum?.trackingId}
          </div>
          <button className="tracking-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="tracking-modal-body">
          <div className="tracking-curriculum-info" style={{
            padding: '1rem',
            backgroundColor: 'var(--tracking-bg-secondary)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
              {curriculum?.title}
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
              {curriculum?.school} • {curriculum?.department}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem' }}>
              Current Stage: {curriculum?.currentStage?.replace('_', ' ')}
            </div>
            {curriculum?.currentAssigneeName && (
              <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-muted)', marginTop: '0.25rem' }}>
                Currently assigned to: {curriculum.currentAssigneeName}
              </div>
            )}
          </div>

          <form onSubmit={handleAssign}>
            <div className="tracking-form-group">
              <label className="tracking-form-label">Select User to Assign *</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="tracking-form-control"
                required
              >
                <option value="">-- Select a user --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
                <i className="fas fa-info-circle"></i> Assignment Details
              </h5>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <li>The selected user will become the current assignee for this tracking</li>
                <li>They will receive notifications about stage changes and required actions</li>
                <li>The assignment can be changed later if needed</li>
                <li>Previous assignment history will be preserved</li>
              </ul>
            </div>
          </form>
        </div>

        <div className="tracking-modal-footer">
          <button 
            type="button"
            className="tracking-btn tracking-btn-outline"
            onClick={onClose}
            disabled={isAssigning}
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            className="tracking-btn tracking-btn-primary"
            onClick={handleAssign}
            disabled={isAssigning || !selectedUserId}
          >
            {isAssigning ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Assigning...
              </>
            ) : (
              <>
                <i className="fas fa-user-check"></i>
                Assign Tracking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================
// TRACKING STATUS ACTIONS MODAL
// ===============================

const TrackingStatusModal = ({ curriculum, onClose, onStatusChange }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const statusActions = [
    {
      id: 'reactivate',
      label: 'Reactivate Tracking',
      icon: 'fas fa-play',
      color: 'var(--tracking-success)',
      description: 'Reactivate this tracking to resume the approval process',
      disabled: curriculum?.isActive
    },
    {
      id: 'deactivate',
      label: 'Deactivate Tracking',
      icon: 'fas fa-pause',
      color: 'var(--tracking-warning)',
      description: 'Temporarily deactivate this tracking (can be reactivated later)',
      disabled: !curriculum?.isActive
    }
  ];

  const handleStatusChange = async (e) => {
    e.preventDefault();
    
    if (!selectedAction) {
      alert('Please select an action to perform.');
      return;
    }

    const confirmMessage = selectedAction === 'deactivate' 
      ? 'Are you sure you want to deactivate this tracking? This will pause the approval process.'
      : 'Are you sure you want to reactivate this tracking? This will resume the approval process.';

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);

    try {
      await onStatusChange(curriculum.id, selectedAction);
      onClose();
    } catch (error) {
      console.error('Error changing tracking status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" onClick={(e) => e.stopPropagation()}>
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
          <div className="tracking-curriculum-info" style={{
            padding: '1rem',
            backgroundColor: 'var(--tracking-bg-secondary)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--tracking-text-primary)' }}>
              {curriculum?.title}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className={`tracking-badge ${
                curriculum?.isActive ? 'tracking-badge-success' : 'tracking-badge-warning'
              }`}>
                {curriculum?.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="tracking-badge tracking-badge-primary">
                {curriculum?.status?.replace('_', ' ')}
              </span>
              <span className="tracking-badge tracking-badge-neutral">
                {curriculum?.currentStage?.replace('_', ' ')}
              </span>
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
                      padding: '1rem',
                      border: `2px solid ${selectedAction === action.id ? action.color : 'var(--tracking-border)'}`,
                      borderRadius: '8px',
                      cursor: action.disabled ? 'not-allowed' : 'pointer',
                      opacity: action.disabled ? 0.5 : 1,
                      backgroundColor: selectedAction === action.id ? `${action.color}10` : 'var(--tracking-bg-card)'
                    }}
                    onClick={() => !action.disabled && setSelectedAction(action.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <i className={action.icon} style={{ color: action.color, fontSize: '1.125rem' }}></i>
                      <span style={{ fontWeight: '600', color: 'var(--tracking-text-primary)' }}>
                        {action.label}
                      </span>
                      {action.disabled && (
                        <span className="tracking-badge tracking-badge-neutral" style={{ fontSize: '0.6875rem' }}>
                          Not Available
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
                      {action.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              selectedAction === 'reactivate' ? 'tracking-btn-success' : 'tracking-btn-warning'
            }`}
            onClick={handleStatusChange}
            disabled={isProcessing || !selectedAction}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : (
              selectedAction === 'reactivate' ? (
                <>
                  <i className="fas fa-play"></i>
                  Reactivate
                </>
              ) : (
                <>
                  <i className="fas fa-pause"></i>
                  Deactivate
                </>
              )
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export {
  EditTrackingModal,
  AssignTrackingModal,
  TrackingStatusModal
};