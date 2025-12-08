import React from 'react';

const FilterSection = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isSearching,
  viewMode,
  onViewModeChange,
  showAdvancedFilters,
  selectedSchool,
  setSelectedSchool,
  selectedProgram,
  setSelectedProgram,
  selectedDepartment,
  setSelectedDepartment,
  sortBy,
  setSortBy,
  schools = [],
  programs = [],
  departments = []
}) => {
  
  const statusOptions = [
    { value: 'all', label: 'All Status', count: null },
    { value: 'approved', label: 'Approved', count: null },
    { value: 'pending', label: 'Pending', count: null },
    { value: 'draft', label: 'Draft', count: null },
    { value: 'rejected', label: 'Rejected', count: null }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'department', label: 'Department A-Z' }
  ];

  return (
    <div className="filter-section">
      <div className="view-mode-toggle">
        <div className="view-toggle-buttons">
          <button 
            className={`view-toggle-btn ${viewMode === 'schools' ? 'active' : ''}`}
            onClick={() => onViewModeChange('schools')}
          >
            <i className="fas fa-sitemap"></i>
            Schools View
          </button>
          <button 
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
          >
            <i className="fas fa-table"></i>
            All Curricula
          </button>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-container">
          <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} search-icon`}></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search curricula, departments, or schools..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-btn ${statusFilter === option.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
              {option.count && (
                <span className="filter-count">{option.count}</span>
              )}
            </button>
          ))}
        </div>

        {showAdvancedFilters && (
          <div className="advanced-filters-row">
            <div className="filter-item">
              <select 
                value={selectedSchool} 
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="filter-select-compact"
                title="Filter by School"
              >
                <option value="all">All Schools</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select 
                value={selectedProgram} 
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="filter-select-compact"
                title="Filter by Program"
              >
                <option value="all">All Programs</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="filter-select-compact"
                title="Filter by Department"
              >
                <option value="all">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select-compact"
                title="Sort By"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;