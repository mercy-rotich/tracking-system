import React from 'react';

const FiltersSection = ({ 
  searchTerm, setSearchTerm, 
  statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter,
  sortBy, setSortBy,
  viewMode, setViewMode 
}) => {
  return (
    <div className="filters-section">
      <div className="filters-header">
      <div class="controls-section">
            <div class="search-container">
                <i class="fas fa-search search-icon"></i>
                <input type="text" class="search-input" placeholder="Search curricula, departments, or schools..." id="searchInput"/>
            </div>
            <div class="view-toggles">
                <button class="toggle-btn active">
                    <i class="fas fa-th-large"></i>
                    Card View
                </button>
                <button class="toggle-btn">
                    <i class="fas fa-list"></i>
                    List View
                </button>
            </div>
        </div>
      </div>
      
      
      
    </div>
  );
};

export default FiltersSection;
