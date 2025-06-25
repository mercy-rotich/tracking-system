import React from 'react';
import { getStatusBadge } from './BadgeComponents';

const CurriculumListItem = ({ 
  curriculum, 
  isLoading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}) => {

  if (!curriculum) {
    return null;
  }

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
  };

  const renderActions = () => {
    if (curriculum.status === 'pending') {
      return (
        <div className="curricula-structured-actions">
          <button 
            className="curricula-structured-action-btn curricula-structured-approve"
            onClick={() => onApprove(curriculum)}
            disabled={isLoading}
            title="Approve"
          >
            <i className="fas fa-check"></i>
          </button>
          <button 
            className="curricula-structured-action-btn curricula-structured-reject"
            onClick={() => onReject(curriculum)}
            disabled={isLoading}
            title="Reject"
          >
            <i className="fas fa-times"></i>
          </button>
          <button 
            className="curricula-structured-action-btn curricula-structured-edit"
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
      <div className="curricula-structured-actions">
        <button 
          className="curricula-structured-action-btn curricula-structured-edit"
          onClick={() => onEdit(curriculum)}
          disabled={isLoading}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button 
          className="curricula-structured-action-btn curricula-structured-delete"
          onClick={() => onDelete(curriculum)}
          disabled={isLoading}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    );
  };

  return (
    <div className={`curricula-structured-item ${isLoading ? 'curricula-structured-loading' : ''}`}>
      <div className="curricula-structured-item-content">
        <div className="curricula-structured-item-left">
          <h4 className="curricula-structured-item-title">{curriculum.title}</h4>
          <div className="curricula-structured-item-meta">
            {getStatusBadge(curriculum.status)}
            <span className="curricula-structured-meta-divider">•</span>
            <span className="curricula-structured-updated">
              <i className="fas fa-clock"></i>
              Updated {getTimeSince(curriculum.lastModified)}
            </span>
          </div>
        </div>

        <div className="curricula-structured-item-right">
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

export default CurriculumListItem;