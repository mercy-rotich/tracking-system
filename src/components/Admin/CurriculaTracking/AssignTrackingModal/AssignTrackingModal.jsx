import React, { useState, useEffect } from 'react';

const AssignTrackingModal = ({ curriculum, onClose, onAssign }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  // Mock users data 
  useEffect(() => {
    const mockUsers = [
      { 
        id: 1, 
        name: 'Dr. Sarah Mitchell', 
        email: 'qa.director@university.edu',
        role: 'QA Director',
        department: 'Quality Assurance',
        isActive: true
      },
      { 
        id: 2, 
        name: 'Dr. Grace Mbugua', 
        email: 'hod.earl.chil.educ@se.university.edu',
        role: 'HOD',
        department: 'Early Childhood Education',
        isActive: true
      },
      { 
        id: 3, 
        name: 'Prof. John Doe', 
        email: 'john.doe@university.edu',
        role: 'Dean',
        department: 'School of Engineering',
        isActive: true
      },
      { 
        id: 4, 
        name: 'Dr. Jane Smith', 
        email: 'jane.smith@university.edu',
        role: 'Senate Member',
        department: 'Academic Senate',
        isActive: true
      },
      { 
        id: 5, 
        name: 'Dr. Robert Johnson', 
        email: 'robert.johnson@university.edu',
        role: 'Vice Chancellor',
        department: 'Administration',
        isActive: true
      },
      { 
        id: 6, 
        name: 'Dr. Mary Wilson', 
        email: 'mary.wilson@university.edu',
        role: 'CUE Representative',
        department: 'External Affairs',
        isActive: false
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers.filter(user => user.isActive));
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.isActive && (
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users.filter(user => user.isActive));
    }
  }, [searchTerm, users]);

  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      alert('Please select a user to assign this tracking to.');
      return;
    }

    const selectedUser = users.find(user => user.id === parseInt(selectedUserId));
    const confirmMessage = `Are you sure you want to assign this tracking to ${selectedUser?.name}?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsAssigning(true);

    try {
      await onAssign(curriculum.id, selectedUserId, assignmentNotes);
      onClose();
    } catch (error) {
      console.error('Error assigning tracking:', error);
      alert('Failed to assign tracking. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const getSelectedUserInfo = () => {
    if (!selectedUserId) return null;
    return users.find(user => user.id === parseInt(selectedUserId));
  };

  const getRoleColor = (role) => {
    const roleColors = {
      'QA Director': 'var(--tracking-success)',
      'HOD': 'var(--tracking-primary)',
      'Dean': 'var(--tracking-secondary)',
      'Senate Member': 'var(--tracking-warning)',
      'Vice Chancellor': 'var(--tracking-danger)',
      'CUE Representative': 'var(--tracking-accent)'
    };
    return roleColors[role] || 'var(--tracking-text-muted)';
  };

  const selectedUser = getSelectedUserInfo();

  return (
    <div className="tracking-modal-overlay" onClick={onClose}>
      <div className="tracking-modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
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
          {/* Curriculum Information */}
          <div className="tracking-curriculum-info" style={{
            padding: '1rem',
            backgroundColor: 'var(--tracking-bg-secondary)',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--tracking-text-primary)', fontSize: '1.125rem' }}>
              {curriculum?.title}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <strong>School:</strong> {curriculum?.school}
              </div>
              <div>
                <strong>Department:</strong> {curriculum?.department}
              </div>
              <div>
                <strong>Current Stage:</strong> {curriculum?.currentStageDisplayName}
              </div>
              <div>
                <strong>Status:</strong>
                <span className={`tracking-badge tracking-badge-${curriculum?.status}`} style={{ marginLeft: '0.5rem' }}>
                  {curriculum?.statusDisplayName}
                </span>
              </div>
            </div>
            
            {curriculum?.currentAssigneeName && (
              <div style={{ 
                marginTop: '0.75rem', 
                padding: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--tracking-text-primary)', marginBottom: '0.25rem' }}>
                  <i className="fas fa-user-check" style={{ marginRight: '0.5rem', color: 'var(--tracking-warning)' }}></i>
                  Currently Assigned To:
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--tracking-text-secondary)' }}>
                  {curriculum.currentAssigneeName}
                  {curriculum.currentAssigneeEmail && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--tracking-text-muted)' }}>
                      📧 {curriculum.currentAssigneeEmail}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAssign}>
            {/* User Search */}
            <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
              <label className="tracking-form-label">
                <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
                Search Users
              </label>
              <input
                type="text"
                className="tracking-form-control"
                placeholder="Search by name, email, role, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--tracking-text-muted)',
                pointerEvents: 'none'
              }}></i>
            </div>

            {/* User Selection */}
            <div className="tracking-form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="tracking-form-label">
                Select User to Assign *
              </label>
              
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid var(--tracking-border)',
                borderRadius: '8px',
                backgroundColor: 'var(--tracking-bg-card)'
              }}>
                {filteredUsers.length === 0 ? (
                  <div style={{ 
                    padding: '2rem', 
                    textAlign: 'center', 
                    color: 'var(--tracking-text-muted)' 
                  }}>
                    <i className="fas fa-user-slash" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                    <div>No users found matching your search</div>
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`tracking-user-option ${selectedUserId === String(user.id) ? 'selected' : ''}`}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--tracking-border-light)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: selectedUserId === String(user.id) ? 'rgba(0, 214, 102, 0.05)' : 'transparent',
                        borderLeft: selectedUserId === String(user.id) ? '4px solid var(--tracking-primary)' : '4px solid transparent'
                      }}
                      onClick={() => setSelectedUserId(String(user.id))}
                      onMouseEnter={(e) => {
                        if (selectedUserId !== String(user.id)) {
                          e.target.style.backgroundColor = 'var(--tracking-bg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedUserId !== String(user.id)) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: getRoleColor(user.role),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '1rem', 
                            fontWeight: '600', 
                            color: 'var(--tracking-text-primary)',
                            marginBottom: '0.25rem'
                          }}>
                            {user.name}
                            {selectedUserId === String(user.id) && (
                              <i className="fas fa-check-circle" style={{ 
                                marginLeft: '0.5rem', 
                                color: 'var(--tracking-success)' 
                              }}></i>
                            )}
                          </div>
                          <div style={{ 
                            fontSize: '0.875rem', 
                            color: 'var(--tracking-text-secondary)',
                            marginBottom: '0.25rem'
                          }}>
                            📧 {user.email}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="tracking-badge tracking-badge-primary" style={{ fontSize: '0.75rem' }}>
                              {user.role}
                            </span>
                            <span className="tracking-badge tracking-badge-neutral" style={{ fontSize: '0.75rem' }}>
                              {user.department}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assignment Notes */}
            <div className="tracking-form-group" style={{ marginBottom: '1rem' }}>
              <label className="tracking-form-label">
                Assignment Notes (Optional)
              </label>
              <textarea
                className="tracking-form-control"
                rows="3"
                placeholder="Add any notes about this assignment..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
              />
            </div>

            {/* Selected User Summary */}
            {selectedUser && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(0, 214, 102, 0.05)',
                border: '1px solid rgba(0, 214, 102, 0.2)',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <h5 style={{ 
                  margin: '0 0 0.75rem 0', 
                  color: 'var(--tracking-text-primary)',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <i className="fas fa-user-check" style={{ color: 'var(--tracking-success)' }}></i>
                  Assignment Summary
                </h5>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                  <strong>{selectedUser.name}</strong> will be assigned as the current assignee for this tracking.
                  <br />
                  <strong>Role:</strong> {selectedUser.role} • <strong>Department:</strong> {selectedUser.department}
                  <br />
                  <strong>Email:</strong> {selectedUser.email}
                </div>
              </div>
            )}

            {/* Assignment Information */}
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
                <li>Assignment notes will be logged with timestamp and your user information</li>
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

export default AssignTrackingModal;