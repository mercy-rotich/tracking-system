
import React from 'react';
import './UserSearchSection.css';

const UserSearchSection = ({ searchTerm, onSearch, activeFilter, onFilter }) => {
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
    onFilter(filterId);
  };

  return (
    <section className="user-search-section">
      <div className="user-search-header">
        <h2 className="user-search-title">Find Curricula</h2>
      </div>
      
      <div className="user-search-controls">
        <div className="user-search-input-container">
          <i className="fas fa-search user-search-input-icon" />
          <input
            type="text"
            className="user-search-box"
            placeholder="Search curricula, programs, or departments..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search curricula"
          />
          {searchTerm && (
            <button
              className="user-search-clear"
              onClick={() => onSearch('')}
              aria-label="Clear search"
            >
              <i className="fas fa-times" />
            </button>
          )}
        </div>
      </div>
      
      <div className="user-filter-tabs">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            className={`user-filter-tab ${activeFilter === tab.id ? 'user-filter-tab--active' : ''}`}
            onClick={() => handleFilterClick(tab.id)}
            aria-pressed={activeFilter === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default UserSearchSection;