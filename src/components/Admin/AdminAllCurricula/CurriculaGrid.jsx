import React from 'react';
import CurriculumCard from './CurriculumCard';

const CurriculaGrid = ({ 
  curricula, 
  totalCount, 
  isLoading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}) => {
  if (isLoading) {
    return (
      <div className="content-section">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="content-header">
        <span className="results-count">
          Showing {curricula.length} of {totalCount} curricula
        </span>
      </div>

      {curricula.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>Try adjusting your search criteria or add a new curriculum.</p>
        </div>
      ) : (
        <div className="curricula-grid">
          {curricula.map((curriculum) => (
            <CurriculumCard
              key={curriculum.id}
              curriculum={curriculum}
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CurriculaGrid;
