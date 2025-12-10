import React from 'react';

const CurriculumActions = ({ 
  curriculum, 
  isLoading, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete 
}) => {
  if (curriculum.status === 'pending') {
    return (
      <div className="curricula-table-actions">
        <button 
          className="curricula-table-action-btn curricula-table-approve"
          onClick={() => onApprove(curriculum)}
          disabled={isLoading}
          title="Approve"
        >
          <i className="fas fa-check"></i>
        </button>
        <button 
          className="curricula-table-action-btn curricula-table-reject"
          onClick={() => onReject(curriculum)}
          disabled={isLoading}
          title="Reject"
        >
          <i className="fas fa-times"></i>
        </button>
        <button 
          className="curricula-table-action-btn curricula-table-view"
          onClick={() => onEdit(curriculum)}
          disabled={isLoading}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="curricula-table-actions">
      <button 
        className="curricula-table-action-btn curricula-table-view"
        onClick={() => onEdit(curriculum)}
        disabled={isLoading}
        title="Edit"
      >
        <i className="fas fa-edit"></i>
      </button>
      <button 
        className="curricula-table-action-btn curricula-table-delete"
        onClick={() => onDelete(curriculum)}
        disabled={isLoading}
        title="Delete"
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default CurriculumActions;
