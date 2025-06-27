import React from 'react';
import CurriculumCard from './CurriculumCard';
import CurriculaList from './CurriculaList';
import CurriculaByDepartment from './CurriculaByDepartment';

const CurriculaGrid = ({ 
  curricula, 
  totalCount,
  filteredCount,
  isLoading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject,
  viewMode = 'card' 
}) => {
  // Safety check for curricula prop
  const safeCurricula = curricula || [];
  
  if (isLoading) {
    return (
      <div className="content-section">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // List view 
  if (viewMode === 'list') {
    return (
      <CurriculaList
        curricula={safeCurricula}
        totalCount={totalCount}
        filteredCount={filteredCount}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onApprove={onApprove}
        onReject={onReject}
        hideSchoolColumn={false}
        hideDepartmentColumn={false}
        showingDepartmentView={false}
      />
    );
  }

  // Card view 
  if (viewMode === 'card') {
    return (
      <CurriculaByDepartment
        curricula={safeCurricula}
        totalCount={totalCount}
        filteredCount={filteredCount}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onApprove={onApprove}
        onReject={onReject}
        viewMode="card" 
      />
    );
  }

  // Department view 
  if (viewMode === 'department') {
    return (
      <CurriculaByDepartment
        curricula={safeCurricula}
        totalCount={totalCount}
        filteredCount={filteredCount}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onApprove={onApprove}
        onReject={onReject}
        viewMode="list" 
      />
    );
  }

  // Grid view 
  return (
    <div className="content-section">
      <div className="content-header">
        <div className="results-summary">
          <span className="results-count">
            Showing {safeCurricula.length} of {filteredCount} curricula
          </span>
          {filteredCount !== totalCount && (
            <span className="total-count">
              (Total: {totalCount})
            </span>
          )}
        </div>

        {safeCurricula.length > 0 && (
          <div className="results-actions">
            <button className="btn btn-sm btn-outline">
              <i className="fas fa-download"></i>
              Export Results
            </button>
          </div>
        )}
      </div>

      {safeCurricula.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>Try adjusting your search criteria or filters, or add a new curriculum.</p>
        </div>
      ) : (
        <div className="curricula-grid">
          {safeCurricula.map((curriculum) => (
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

      {safeCurricula.length > 0 && (
        <div className="pagination-info">
          <p>
            Displaying {safeCurricula.length} curriculum{safeCurricula.length !== 1 ? 'a' : ''}
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