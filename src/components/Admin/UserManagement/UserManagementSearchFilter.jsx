import React from 'react';


const UserManagementSearchFilter = ({ 
  filters, 
  onSearch, 
  onRoleFilter, 
  onStatusFilter, 
  onClearFilters 
}) => {
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleRoleChange = (e) => {
    onRoleFilter(e.target.value);
  };

  const handleStatusChange = (e) => {
    onStatusFilter(e.target.value);
  };

  return (
    <div className="user-management-search-filter-section">
      <div className="user-management-search-filter-grid">
        <div className="user-management-form-group">
          <label htmlFor="search">Search Users</label>
          <div className="user-management-search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="search"
              className="user-management-form-control"
              placeholder="Search by name, email, or username..."
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div className="user-management-form-group">
          <label htmlFor="roleFilter">Filter by Role</label>
          <select
            id="roleFilter"
            className="user-management-form-control"
            value={filters.role}
            onChange={handleRoleChange}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="DEAN">Dean of School</option>
            <option value="QA">Quality Assurance</option>
            <option value="DEPT_REP">Department Rep</option>
            <option value="SENATE">Senate</option>
          </select>
        </div>
        
        <div className="user-management-form-group">
          <label htmlFor="statusFilter">Filter by Status</label>
          <select
            id="statusFilter"
            className="user-management-form-control"
            value={filters.status}
            onChange={handleStatusChange}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="user-management-form-group">
          <button className="user-management-btn user-management-btn-outline" onClick={onClearFilters}>
            <i className="fas fa-filter"></i>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSearchFilter;