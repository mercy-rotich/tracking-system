import React from 'react';
import { getStatusBadge } from '../BadgeComponents';
import Pagination from '../Pagination';
import LoadingSpinner from '../../../common/LoadingSpinner';
import CurriculumActions from './CurriculumActions';
import BreadcrumbNavigation from './BreadcrumbNavigation';

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getTimeSince = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'Just now';
};

const ProgramDetailsView = ({
  navigationPath,
  programViewData,
  school,
  program,
  isLoading,
  isLoadingSchoolsData,
  onBack,
  onRetry,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  pagination
}) => {
  if (isLoading || isLoadingSchoolsData) {
    return (
      <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
        <BreadcrumbNavigation path={navigationPath} />
        <div className="content-section">
          <LoadingSpinner message="Loading program curricula..." />
        </div>
      </div>
    );
  }

  if (!programViewData || programViewData.length === 0) {
    return (
      <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
        <BreadcrumbNavigation path={navigationPath} />
        <div className="curricula-table-program-header">
          <div className="curricula-table-program-info">
            <h3 className="curricula-table-program-title">
              {program?.name || 'Unknown Program'} - {school?.name || 'Unknown School'}
            </h3>
            <p className="curricula-table-program-subtitle">
              No curricula found with current filters
            </p>
          </div>
          <div className="curricula-table-program-actions">
            <button 
              className="btn btn-sm btn-outline"
              onClick={onBack}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Schools
            </button>
          </div>
        </div>
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>No curricula available for this program with current filters.</p>
          <button 
            className="btn btn-primary" 
            onClick={onRetry}
          >
            <i className="fas fa-refresh"></i>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const groupedByDepartment = programViewData.reduce((acc, curriculum) => {
    const department = curriculum.department || 'Unknown Department';
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(curriculum);
    return acc;
  }, {});

  const departmentNames = Object.keys(groupedByDepartment).sort();

  return (
    <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
      <BreadcrumbNavigation path={navigationPath} />
      <div className="curricula-table-program-header">
        <div className="curricula-table-program-info">
          <h3 className="curricula-table-program-title">
            {program?.name || 'Unknown Program'} - {school?.name || 'Unknown School'}
          </h3>
          <p className="curricula-table-program-subtitle">
            {programViewData.length} curricula across {departmentNames.length} departments
          </p>
        </div>
        <div className="curricula-table-program-actions">
          <button 
            className="btn btn-sm btn-outline"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Schools
          </button>
        </div>
      </div>

      <div className="admin-departments-container">
        {departmentNames.map((departmentName) => {
          const departmentCurricula = groupedByDepartment[departmentName];
          
          return (
            <div key={departmentName} className="admin-department-section">
              <div className="admin-department-header">
                <div className="admin-department-info">
                  <i className="fas fa-layer-group admin-department-icon"></i>
                  <span className="admin-department-name">{departmentName} department</span>
                </div>
                <div className="admin-department-count">
                  {departmentCurricula.length}
                </div>
              </div>

              <div className="admin-department-content">
                <div className="curricula-table-wrapper">
                  <table className="curricula-table">
                    <thead className="curricula-table-header">
                      <tr>
                        <th className="curricula-table-th">Curriculum Title</th>
                        <th className="curricula-table-th">Status</th>
                        <th className="curricula-table-th">Last Updated</th>
                        <th className="curricula-table-th">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="curricula-table-body">
                      {departmentCurricula.map((curriculum) => (
                        <tr key={curriculum.id} className="curricula-table-row">
                          <td className="curricula-table-td">
                            <div className="curricula-table-title-content">
                              <span className="curricula-table-title-text">{curriculum.title}</span>
                              <span className="curricula-table-title-id">{curriculum.code || curriculum.id}</span>
                            </div>
                          </td>
                          <td className="curricula-table-td">
                            {getStatusBadge(curriculum.status)}
                          </td>
                          <td className="curricula-table-td">
                            <div className="curricula-table-date-content">
                              <span className="curricula-table-date-main">{formatDate(curriculum.lastModified)}</span>
                              <span className="curricula-table-date-relative">{getTimeSince(curriculum.lastModified)}</span>
                            </div>
                          </td>
                          <td className="curricula-table-td">
                            <CurriculumActions
                              curriculum={curriculum}
                              isLoading={isLoading}
                              onApprove={onApprove}
                              onReject={onReject}
                              onEdit={onEdit}
                              onDelete={onDelete}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrevious={pagination.hasPrevious}
          onPageChange={pagination.onPageChange}
          onPreviousPage={pagination.onPreviousPage}
          onNextPage={pagination.onNextPage}
          onPageSizeChange={() => {}}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ProgramDetailsView;
