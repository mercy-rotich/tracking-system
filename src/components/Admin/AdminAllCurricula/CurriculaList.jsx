import React from 'react';
import { getStatusBadge } from './BadgeComponents';

const CurriculaList = ({ 
  curricula, 
  totalCount,
  filteredCount,
  isLoading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject,
  hideSchoolColumn = false,
  hideDepartmentColumn = false,
  showingDepartmentView = false 
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

  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  const renderActions = (curriculum) => {
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
          className="curricula-table-action-btn curricula-table-edit"
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

  if (safeCurricula.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-book-open"></i>
        <h3>No curricula found</h3>
        <p>Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  
  const shouldHideSchoolDepartment = hideSchoolColumn && hideDepartmentColumn;
  const containerClasses = `curricula-table-container ${shouldHideSchoolDepartment ? 'hide-school-department' : ''}`;

  return (
    <div className={containerClasses}>
      {/* Table header for department view */}
      {showingDepartmentView && safeCurricula.length > 0 && (
        <div className="curricula-table-department-header">
          <div className="curricula-table-department-info">
            <h3 className="curricula-table-department-title">
              {safeCurricula[0].department} Department
            </h3>
            <p className="curricula-table-department-subtitle">
              {safeCurricula[0].schoolName} • {safeCurricula.length} curricula
            </p>
          </div>
        </div>
      )}

      <div className="curricula-table-wrapper">
        <table className="curricula-table">
          <thead className="curricula-table-header">
            <tr>
              <th className="curricula-table-th curricula-table-th-title">Curriculum Title</th>
              {!hideSchoolColumn && (
                <th className="curricula-table-th curricula-table-th-school">School</th>
              )}
              {!hideDepartmentColumn && (
                <th className="curricula-table-th curricula-table-th-department">Department</th>
              )}
              <th className="curricula-table-th curricula-table-th-status">Status</th>
              <th className="curricula-table-th curricula-table-th-updated">Last Updated</th>
              <th className="curricula-table-th curricula-table-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody className="curricula-table-body">
            {safeCurricula.map((curriculum) => (
              <tr key={curriculum.id} className="curricula-table-row">
                <td className="curricula-table-td curricula-table-td-title">
                  <div className="curricula-table-title-content">
                    <span className="curricula-table-title-text">{curriculum.title}</span>
                    <span className="curricula-table-title-id">{curriculum.id}</span>
                  </div>
                </td>
                {!hideSchoolColumn && (
                  <td className="curricula-table-td curricula-table-td-school">
                    {curriculum.schoolName || 'School of Computing & Informatics'}
                  </td>
                )}
                {!hideDepartmentColumn && (
                  <td className="curricula-table-td curricula-table-td-department">
                    {curriculum.department}
                  </td>
                )}
                <td className="curricula-table-td curricula-table-td-status">
                  {getStatusBadge(curriculum.status)}
                </td>
                <td className="curricula-table-td curricula-table-td-updated">
                  <div className="curricula-table-date-content">
                    <span className="curricula-table-date-main">{formatDate(curriculum.lastModified)}</span>
                    <span className="curricula-table-date-relative">{getTimeSince(curriculum.lastModified)}</span>
                  </div>
                </td>
                <td className="curricula-table-td curricula-table-td-actions">
                  {renderActions(curriculum)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {safeCurricula.length > 0 && (
        <div className="curricula-table-footer">
          <p className="curricula-table-footer-text">
            Showing {safeCurricula.length} of {filteredCount} curricula
            {filteredCount !== totalCount && (
              <span> (filtered from {totalCount} total)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default CurriculaList;