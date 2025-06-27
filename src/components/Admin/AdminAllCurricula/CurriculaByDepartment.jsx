import React from 'react';
import DepartmentSection from './DepartmentSection';

const CurriculaByDepartment = ({ 
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
  if (isLoading) {
    return (
      <div className="content-section">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const safeCurricula = curricula || [];

  const groupedByDepartment = safeCurricula.reduce((acc, curriculum) => {
    const department = curriculum.department;
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(curriculum);
    return acc;
  }, {});

  const departmentNames = Object.keys(groupedByDepartment).sort();

  return (
    <div className="curricula-departments-container">
      <div className="curricula-departments-header">
        <div className="curricula-results-summary">
          <span className="curricula-results-count">
            Showing {safeCurricula.length} curricula across {departmentNames.length} departments
          </span>
          {filteredCount !== totalCount && (
            <span className="curricula-total-count">
              (Total: {totalCount})
            </span>
          )}
        </div>

        {safeCurricula.length > 0 && (
          <div className="curricula-results-actions">
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
        <div className="curricula-departments-list">
          {departmentNames.map((departmentName) => (
            <DepartmentSection
              key={departmentName}
              departmentName={departmentName}
              curricula={groupedByDepartment[departmentName]}
              programName={groupedByDepartment[departmentName][0]?.programName}
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onApprove={onApprove}
              onReject={onReject}
              viewMode={viewMode} // Pass viewMode to DepartmentSection
            />
          ))}
        </div>
      )}

      {safeCurricula.length > 0 && (
        <div className="curricula-departments-footer">
          <p>
            Displaying {safeCurricula.length} curriculum{safeCurricula.length !== 1 ? 'a' : ''} 
            across {departmentNames.length} department{departmentNames.length !== 1 ? 's' : ''}
            {filteredCount < totalCount && (
              <span> (filtered from {totalCount} total)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CurriculaByDepartment;