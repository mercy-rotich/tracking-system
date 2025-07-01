import React, { useState, useMemo } from 'react';
import { useCurriculum } from '../../../context/CurriculumContext';
import UserCurriculaTable from '../UserCurriculaTable/UserCurriculaTable';
import './UserCurricula.css';

const UserCurricula = () => {
  const { 
    getFilteredCurricula, 
    loading, 
    isInitialized,
    searchCurriculaByName,
    refreshData,
    testConnection,
    data
  } = useCurriculum();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

 
  const filteredCurricula = useMemo(() => {
    if (!isInitialized) return [];
    return getFilteredCurricula(statusFilter, searchTerm);
  }, [getFilteredCurricula, statusFilter, searchTerm, isInitialized]);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (value.length >= 3) {
      setIsSearching(true);
      try {
        await searchCurriculaByName(value);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleViewCurriculum = (curriculum) => {
  
    alert(`Viewing details for: ${curriculum.title}\n\nSchool: ${curriculum.school}\nDepartment: ${curriculum.department}\nStatus: ${curriculum.status}\nDuration: ${curriculum.duration}\n\nThis would open a detailed curriculum view with course structure, requirements, and documentation.`);
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Status' },
    { id: 'approved', label: 'Approved' },
    { id: 'pending', label: 'Pending' },
    { id: 'review', label: 'Under Review' }
  ];

  
  if (!isInitialized || loading) {
    return (
      <div className="user-curricula-page">
        <div className="curricula-loading-container">
          <div className="curricula-loading-spinner">
            <div className="spinner"></div>
            <p>Loading curricula data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-curricula-page">
      {/* Search Section */}
      <section className="user-curricula-search">
        <div className="user-search-header">
          <h2 className="user-search-title">All Curricula</h2>
          <div className="user-curricula-header-actions">
            <div className="user-curricula-count">
              {filteredCurricula.length} curricula found
            </div>
            <button 
              className="user-refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh data"
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>
        
        <div className="user-search-controls">
          <div className="user-search-input-container">
            <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} user-search-input-icon`} />
            <input
              type="text"
              className="user-search-box"
              placeholder="Search curricula by title, school, or department..."
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search curricula"
              disabled={loading}
            />
            {searchTerm && (
              <button
                className="user-search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                disabled={loading}
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
              disabled={loading}
            >
              {tab.label}
              {statusFilter === tab.id && (
                <span className="user-filter-count">
                  {filteredCurricula.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Search Status */}
      {isSearching && (
        <div className="user-search-status">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Searching curricula...</span>
        </div>
      )}

      {/* Empty State */}
      {filteredCurricula.length === 0 && !loading && !isSearching && (
        <div className="user-curricula-empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          
          {data.totalCurricula === 0 ? (
            <div className="no-data-available">
              <p>No curriculum data is currently available.</p>
              <p>This might be because:</p>
              <ul>
                <li>The curriculum database is empty</li>
                <li>The API is not accessible</li>
                <li>There are temporary connectivity issues</li>
              </ul>
              <div className="user-empty-actions">
                <button 
                  className="user-refresh-btn-secondary"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                  Try Again
                </button>
                <button 
                  className="user-test-connection-btn"
                  onClick={async () => {
                    const result = await testConnection();
                    alert(result.success ? 'Connection successful!' : `Connection failed: ${result.error}`);
                  }}
                  disabled={loading}
                >
                  <i className="fas fa-wifi"></i>
                  Test Connection
                </button>
              </div>
            </div>
          ) : (
            <div className="filtered-empty">
              <p>
                {searchTerm 
                  ? `No curricula match your search for "${searchTerm}"`
                  : `No curricula found with status "${statusFilter}"`
                }
              </p>
              <div className="user-empty-actions">
                {searchTerm && (
                  <button 
                    className="user-clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                    Clear Search
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button 
                    className="user-clear-filter-btn"
                    onClick={() => setStatusFilter('all')}
                  >
                    <i className="fas fa-filter"></i>
                    Show All Status
                  </button>
                )}
                <button 
                  className="user-refresh-btn-secondary"
                  onClick={handleRefresh}
                >
                  <i className="fas fa-sync-alt"></i>
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Curricula Table */}
      {filteredCurricula.length > 0 && (
        <UserCurriculaTable 
          curricula={filteredCurricula}
          onViewCurriculum={handleViewCurriculum}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          loading={loading}
        />
      )}
    </div>
  );
};

export default UserCurricula;