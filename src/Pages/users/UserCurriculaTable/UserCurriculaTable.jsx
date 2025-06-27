
import React from 'react';
import './UserCurriculaTable.css';

const UserCurriculaTable = ({ curricula, onViewCurriculum, searchTerm, statusFilter }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'user-status-approved';
      case 'pending':
        return 'user-status-pending';
      case 'review':
        return 'user-status-review';
      default:
        return 'user-status-approved';
    }
  };

  if (curricula.length === 0) {
    return (
      <section className="user-curricula-section">
        <div className="user-section-header">
          <h2 className="user-section-title">
            <i className="fas fa-list" />
            Curriculum Database
          </h2>
        </div>
        <div className="user-curricula-empty">
          <div className="user-empty-state">
            <i className="fas fa-search" />
            <h3>No curricula found</h3>
            <p>
              {searchTerm
                ? `No curricula match "${searchTerm}"`
                : statusFilter !== 'all'
                ? `No curricula with status "${statusFilter}"`
                : 'No curricula available'
              }
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="user-curricula-section">
      <div className="user-section-header">
        <h2 className="user-section-title">
          <i className="fas fa-list" />
          Curriculum Database
        </h2>
        <div className="user-curricula-results">
          {curricula.length} result{curricula.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="user-table-container">
        <table className="user-curricula-table">
          <thead className="user-table-header">
            <tr>
              <th>Curriculum Title</th>
              <th>School</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {curricula.map((curriculum, index) => (
              <tr 
                key={curriculum.id || `${curriculum.title}-${index}`} 
                className="user-table-row"
              >
                <td className="user-curriculum-title">
                  {curriculum.title}
                </td>
                <td className="user-school-name">
                  School of {curriculum.school}
                </td>
                <td className="user-department-name">
                  {curriculum.department}
                </td>
                <td>
                  <span className={`user-status-badge ${getStatusBadgeClass(curriculum.status)}`}>
                    {curriculum.status}
                  </span>
                </td>
                <td className="user-last-updated">
                  {formatDate(curriculum.lastUpdated)}
                </td>
                <td>
                  <button 
                    className="user-view-btn"
                    onClick={() => onViewCurriculum(curriculum)}
                    aria-label={`View details for ${curriculum.title}`}
                  >
                    <i className="fas fa-eye" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UserCurriculaTable;