import React from 'react';
import { getStatusBadge, getDifficultyBadge } from './BadgeComponents';

const CurriculumCard = ({ curriculum, isLoading, onEdit, onDelete, onApprove, onReject }) => {
  return (
    <div className="curriculum-card">
      <div className="card-header">
        <h3 className="card-title">{curriculum.title}</h3>
        
        
      </div>

     

      <div className="card-actions">
        {getStatusBadge(curriculum.status)}
        <div className="action-buttons">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => onEdit(curriculum)}
          >
            <i className="fas fa-edit"></i>
            Edit
          </button>
          {curriculum.status === 'pending' && (
            <>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => onApprove(curriculum)}
                disabled={isLoading}
              >
                <i className="fas fa-check"></i>
                Approve
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => onReject(curriculum)}
                disabled={isLoading}
              >
                <i className="fas fa-times"></i>
                Reject
              </button>
            </>
          )}
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(curriculum)}
          >
            <i className="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCard;
