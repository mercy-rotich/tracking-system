
import React from 'react';
import { getStatusBadge } from '../../../components/Admin/AdminAllCurricula/BadgeComponents';
import Pagination from './Pagination';

const CurriculumTable = ({
  curricula,
  isLoading,
  
  // Pagination
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  
  // Actions
  onEdit,
  onDelete,
  onApprove,
  onReject,
  
  // Utilities
  getSchoolName,
  getProgramName,
  onRefresh
}) => {

  const getTimeSince = (dateString) => {
    if (!dateString) return 'Unknown';
    
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
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-CA');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const renderCurriculumActions = (curriculum) => {
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

  const enrichedCurricula = curricula.map(curriculum => ({
    ...curriculum,
    schoolName: curriculum.schoolName || getSchoolName(curriculum.schoolId),
    programName: curriculum.programName || getProgramName(curriculum.programId)
  }));

  if (isLoading) {
    return (
      <div className="curricula-table-container">
        <div className="content-section">
          <div className="curricula-loading-spinner">
            <div className="spinner"></div>
            <p>Loading page {currentPage + 1} of curricula...</p>
          </div>
        </div>
      </div>
    );
  }

  if (enrichedCurricula.length === 0) {
    return (
      <div className="curricula-table-container">
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>Try adjusting your search criteria or filters</p>
          <button 
            className="btn btn-primary" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <i className="fas fa-refresh"></i>
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="curricula-table-container">
      <div className="curricula-table-wrapper">
        <table className="curricula-table">
          <thead className="curricula-table-header">
            <tr>
              <th className="curricula-table-th curricula-table-th-title">Curriculum Title</th>
              <th className="curricula-table-th curricula-table-th-school">School</th>
              <th className="curricula-table-th curricula-table-th-department">Department</th>
              <th className="curricula-table-th curricula-table-th-status">Status</th>
              <th className="curricula-table-th curricula-table-th-updated">Last Updated</th>
              <th className="curricula-table-th curricula-table-th-actions">Actions</th>
            </tr>
          </thead>
          <tbody className="curricula-table-body">
            {enrichedCurricula.map((curriculum) => (
              <tr key={curriculum.id} className="curricula-table-row">
                <td className="curricula-table-td curricula-table-td-title">
                  <div className="curricula-table-title-content">
                    <span className="curricula-table-title-text">{curriculum.title}</span>
                    <span className="curricula-table-title-id">{curriculum.code || curriculum.id}</span>
                  </div>
                </td>
                <td className="curricula-table-td curricula-table-td-school">
                  {curriculum.schoolName}
                </td>
                <td className="curricula-table-td curricula-table-td-department">
                  {curriculum.department}
                </td>
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
                  {renderCurriculumActions(curriculum)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalElements={totalElements}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={onPageChange}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CurriculumTable;