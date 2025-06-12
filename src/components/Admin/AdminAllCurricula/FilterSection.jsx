import React from 'react';



const FiltersSection = ({ 
  searchTerm, setSearchTerm, 
  statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter,
  sortBy, setSortBy,
  viewMode, setViewMode 
}) => {
  
  // Define filterOptions at the component level where it's used
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Approved' }, 
    { value: 'pending', label: 'Pending' }, 
    { value: 'rejected', label: 'Rejected' }  
  ];

  return (
    <div className="filters-section">
      <div className="filters-header">
        <div className="controls-section">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search curricula, departments, or schools..." 
              id="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`filter-btn ${statusFilter === option.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="view-toggles">
            <button 
              className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
            >
              <i className="fas fa-th-large"></i>
              Card View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
              List View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;