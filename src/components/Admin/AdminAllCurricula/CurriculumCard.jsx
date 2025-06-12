import React from 'react';
import { getStatusBadge, getDifficultyBadge } from './BadgeComponents';

const CurriculumCard = ({ curriculum, isLoading, onEdit, onDelete, onApprove, onReject }) => {
  return (
    <div className="curriculum-card">
      <div className="card-header">
        <h3 className="card-title">{curriculum.title}</h3>
        <div className="card-meta">
          <span className="card-author">
            <i className="fas fa-user"></i>
            {curriculum.author}
          </span>
          <span className="card-category">{curriculum.category}</span>
          {getDifficultyBadge(curriculum.difficulty)}
        </div>
        <p className="card-description">{curriculum.description}</p>
      </div>

      <div className="card-stats">
        <div className="stat-item">
          <h4 className="stat-item-value">{curriculum.enrollments}</h4>
          <p className="stat-item-label">Enrollments</p>
        </div>
        <div className="stat-item">
          <h4 className="stat-item-value">★ {curriculum.rating}</h4>
          <p className="stat-item-label">Rating</p>
        </div>
        <div className="stat-item">
          <h4 className="stat-item-value">{curriculum.duration}</h4>
          <p className="stat-item-label">Duration</p>
        </div>
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
