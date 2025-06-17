import React, { useState, useMemo, useEffect } from 'react';

const UsersTable = ({ users, filters, onEdit, onManageRoles, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to first page when users array changes (new user added)
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  // Filter users based on search and filter criteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !filters.search || 
        user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.username.toLowerCase().includes(filters.search.toLowerCase());

      const matchesRole = !filters.role || user.roles.includes(filters.role);
      const matchesStatus = !filters.status || user.status === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleBadgeClass = (role) => {
    const roleClasses = {
      'ADMIN': 'user-management-admin',
      'DEAN': 'user-management-dean',
      'QA': 'user-management-qa',
      'DEPT_REP': 'user-management-dept',
      'SENATE': 'user-management-senate'
    };
    return roleClasses[role] || 'user-management-dept';
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'ADMIN': 'Admin',
      'DEAN': 'Dean of School',
      'QA': 'Quality Assurance',
      'DEPT_REP': 'Department Rep',
      'SENATE': 'Senate'
    };
    return roleNames[role] || role;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        className={`user-management-pagination-btn ${currentPage === 1 ? 'user-management-disabled' : ''}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i>
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`user-management-pagination-btn ${i === currentPage ? 'user-management-active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Show ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <button key="ellipsis" className="user-management-pagination-btn user-management-disabled">
            ...
          </button>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          className="user-management-pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        className={`user-management-pagination-btn ${currentPage === totalPages ? 'user-management-disabled' : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <i className="fas fa-chevron-right"></i>
      </button>
    );

    return buttons;
  };

  return (
    <div className="user-management-table-section">
      <div className="user-management-table-header">
        <h2>All Users ({filteredUsers.length})</h2>
      </div>
      
      <div className="user-management-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users-message">
            <i className="fas fa-users"></i>
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <table className="user-management-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th>School/Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-management-user-info">
                      <div className="user-management-user-avatar">{user.avatar}</div>
                      <div className="user-management-user-details">
                        <h4>{user.firstName} {user.lastName}</h4>
                        <p>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map(role => (
                        <span key={role} className={`user-management-role-badge ${getRoleBadgeClass(role)}`}>
                          {getRoleDisplayName(role)}
                        </span>
                      ))
                    ) : (
                      <span className="user-management-role-badge user-management-dept">
                        No Roles
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`user-management-status-badge user-management-${user.status}`}>
                      <i className="fas fa-circle"></i>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td>{user.department || 'N/A'}</td>
                  <td>
                    <div className="user-management-action-buttons">
                      <button 
                        className="user-management-action-btn user-management-roles"
                        onClick={() => onManageRoles(user)}
                      >
                        Manage Roles
                      </button>
                      <button 
                        className="user-management-action-btn user-management-edit"
                        onClick={() => onEdit(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="user-management-action-btn user-management-delete"
                        onClick={() => onDelete(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination - only show if there are users */}
      {filteredUsers.length > 0 && (
        <div className="user-management-pagination">
          <div className="user-management-pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="user-management-pagination-controls">
            {renderPaginationButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;