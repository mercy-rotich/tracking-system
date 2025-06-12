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
        <h2 className="filters-title">Filter & Search</h2>
        <div className="view-toggle">
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            <i className="fas fa-th"></i>
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list"></i>
          </button>
        </div>
      </div>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label className="filter-label">Search Curricula</label>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, author, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Science">Data Science</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="enrollments">Most Enrollments</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;
