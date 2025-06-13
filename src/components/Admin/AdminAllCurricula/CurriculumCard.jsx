import React from 'react';
import { getStatusBadge } from './BadgeComponents';

const CurriculumCard = ({ 
  curriculum, 
  isLoading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="curriculum-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">{curriculum.title}</h3>
          {getStatusBadge(curriculum.status)}
        </div>
      </div>

      <div className="card-content">
        
      </div>

      <div className="card-actions">
        <div className="action-buttons">
          <button 
            className="btn btn-sm btn-outline"
            onClick={() => onEdit(curriculum)}
            disabled={isLoading}
          >
            <i className="fas fa-edit"></i>
            Edit
          </button>
          
          {curriculum.status === 'pending' && (
            <>
              <button 
                className="btn btn-sm btn-success"
                onClick={() => onApprove(curriculum)}
                disabled={isLoading}
              >
                <i className="fas fa-check"></i>
                Approve
              </button>
              <button 
                className="btn btn-sm btn-warning"
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
            disabled={isLoading}
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