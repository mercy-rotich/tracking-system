import React from 'react';
import CurriculumCard from './CurriculumCard';

const CurriculaGrid = ({ 
  curricula, 
  totalCount,
  filteredCount,
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
        <div className="results-summary">
          <span className="results-count">
            Showing {curricula.length} of {filteredCount} curricula
          </span>
          {filteredCount !== totalCount && (
            <span className="total-count">
              (Total: {totalCount})
            </span>
          )}
        </div>
        
        {curricula.length > 0 && (
          <div className="results-actions">
            <button className="btn btn-sm btn-outline">
              <i className="fas fa-download"></i>
              Export Results
            </button>
          </div>
        )}
      </div>

      {curricula.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>Try adjusting your search criteria or filters, or add a new curriculum.</p>
          <div className="empty-state-suggestions">
            <h4>Suggestions:</h4>
            <ul>
              <li>Clear active filters</li>
              <li>Try different search terms</li>
              <li>Check if you have the right school/program selected</li>
            </ul>
          </div>
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

      {/* Pagination could go here if needed */}
      {curricula.length > 0 && (
        <div className="pagination-info">
          <p>
            Displaying {curricula.length} curriculum{curricula.length !== 1 ? 'a' : ''}
            {filteredCount < totalCount && (
              <span> (filtered from {totalCount} total)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CurriculaGrid;