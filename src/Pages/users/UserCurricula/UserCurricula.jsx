
import React, { useState, useMemo } from 'react';
import { useCurriculum } from '../../../context/CurriculumContext';
import UserCurriculaTable from '../UserCurriculaTable/UserCurriculaTable';
import './UserCurricula.css';

const UserCurricula = () => {
  const { getFilteredCurricula } = useCurriculum();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCurricula = useMemo(() => {
    return getFilteredCurricula(statusFilter, searchTerm);
  }, [getFilteredCurricula, statusFilter, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleViewCurriculum = (curriculum) => {
    alert(`Viewing details for: ${curriculum.title}\n\nThis would open a detailed curriculum view with course structure, requirements, and documentation.`);
  };

  const filterTabs = [
    { id: 'all', label: 'All Status' },
    { id: 'approved', label: 'Approved' },
    { id: 'pending', label: 'Pending' },
    { id: 'review', label: 'Under Review' }
  ];

  return (
    <div className="user-curricula-page">
      {/* Search Section */}
      <section className="user-curricula-search">
        <div className="user-search-header">
          <h2 className="user-search-title">All Curricula</h2>
          <div className="user-curricula-count">
            {filteredCurricula.length} curricula found
          </div>
        </div>
        
        <div className="user-search-controls">
          <div className="user-search-input-container">
            <i className="fas fa-search user-search-input-icon" />
            <input
              type="text"
              className="user-search-box"
              placeholder="Search curricula by title, school, or department..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search curricula"
            />
            {searchTerm && (
              <button
                className="user-search-clear"
                onClick={() => setSearchTerm('')}
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
              className={`user-filter-tab ${statusFilter === tab.id ? 'user-filter-tab--active' : ''}`}
              onClick={() => handleStatusFilter(tab.id)}
              aria-pressed={statusFilter === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Curricula Table */}
      <UserCurriculaTable 
        curricula={filteredCurricula}
        onViewCurriculum={handleViewCurriculum}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default UserCurricula;