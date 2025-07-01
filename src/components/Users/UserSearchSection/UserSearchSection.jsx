import React from 'react';
import './UserSearchSection.css';

const UserSearchSection = ({ 
  searchTerm, 
  onSearch, 
  activeFilter, 
  onFilter, 
  isSearching = false,
  disabled = false 
}) => {
  const filterTabs = [
    { id: 'all', label: 'All Programs' },
    { id: 'masters', label: 'Masters' },
    { id: 'degree', label: 'Bachelor' },
    { id: 'phd', label: 'PhD' }
  ];

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  const handleFilterClick = (filterId) => {
    if (!disabled) {
      onFilter(filterId);
    }
  };

  return (
    <section className="user-search-section">
      <div className="user-search-header">
        <h2 className="user-search-title">Find Curricula</h2>
        <div className="user-search-subtitle">
          Search across all academic programs and departments
        </div>
      </div>
      
      <div className="user-search-controls">
        <div className="user-search-input-container">
          <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} user-search-input-icon`} />
          <input
            type="text"
            className="user-search-box"
            placeholder="Search curricula, programs, or departments..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search curricula"
            disabled={disabled}
          />
          {searchTerm && !disabled && (
            <button
              className="user-search-clear"
              onClick={() => onSearch('')}
              aria-label="Clear search"
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>
        
        {/* Search hints */}
        <div className="user-search-hints">
          <span className="search-hint">
            <i className="fas fa-lightbulb"></i>
            Try searching for: "Computer Science", "Engineering", "Business"
          </span>
        </div>
      </div>
      
   

      {/* Active filters display */}
      {(searchTerm || activeFilter !== 'all') && !disabled && (
        <div className="user-active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="active-filters-list">
            {searchTerm && (
              <span className="active-filter-tag">
                <i className="fas fa-search"></i>
                "{searchTerm}"
                <button 
                  className="remove-filter"
                  onClick={() => onSearch('')}
                  aria-label="Remove search filter"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            {activeFilter !== 'all' && (
              <span className="active-filter-tag">
                <i className="fas fa-filter"></i>
                {filterTabs.find(tab => tab.id === activeFilter)?.label}
                <button 
                  className="remove-filter"
                  onClick={() => onFilter('all')}
                  aria-label="Remove program filter"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search status */}
      {isSearching && (
        <div className="user-search-status">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Searching curricula...</span>
        </div>
      )}
    </section>
  );
};

export default UserSearchSection;