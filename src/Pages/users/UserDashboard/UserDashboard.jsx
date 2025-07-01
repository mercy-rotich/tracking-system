import React, { useState, useEffect } from 'react';
import { useCurriculum } from '../../../context/CurriculumContext';
import UserDashboardCards from '../../../components/Users/UserDashboardCards/UserDashboardCards';
import UserSearchSection from '../../../components/Users/UserSearchSection/UserSearchSection';
import SchoolsList from '../../../components/Users/SchoolsList/SchoolsList';
import './UserDashboard.css';

const UserDashboard = () => {
  const { 
    data, 
    filteredSchools, 
    searchTerm, 
    setSearchTerm, 
    activeFilter, 
    setActiveFilter,
    loading,
    isInitialized,
    refreshData,
    searchCurriculaByName,
    testConnection
  } = useCurriculum();
  
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

 
  useEffect(() => {
    const checkConnection = async () => {
      const result = await testConnection();
      setConnectionStatus(result);
    };
    
    checkConnection();
  }, [testConnection]);

  useEffect(() => {
    if (!data.totalCurricula) return;
    
    const target = data.totalCurricula;
    const increment = target / 60; 
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedCount(Math.floor(current));
    }, 30);

    return () => clearInterval(timer);
  }, [data.totalCurricula]);

  const handleSearch = async (value) => {
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

  const handleFilter = (filter) => {
    setActiveFilter(filter);
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
      
      const result = await testConnection();
      setConnectionStatus(result);
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };


  const stats = {
    totalCurricula: animatedCount,
    totalSchools: data.schools.length,
    totalPrograms: data.schools.reduce((sum, school) => sum + school.programs.length, 0),
    totalDepartments: data.totalDepartments || data.schools.reduce((sum, school) => sum + school.departments, 0)
  };

 
  if (!isInitialized) {
    return (
      <div className="user-dashboard">
        <div className="user-dashboard-loading">
          <div className="user-dashboard-loading-container">
            <div className="user-dashboard-loading-spinner">
              <div className="spinner"></div>
            </div>
            <h3>Loading Curriculum Dashboard...</h3>
            <p>Fetching the latest curriculum data...</p>
          </div>
        </div>
      </div>
    );
  }

  
  

  return (
    <div className="user-dashboard">
      {/* Header with refresh button */}
      <div className="user-dashboard-header">
        <div className="dashboard-title">
          
          <p>Browse and explore academic curricula across all schools and programs</p>
          
        </div>
        <button 
          className="dashboard-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh all data"
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          Refresh
        </button>
      </div>

      {/* Dashboard Cards */}
      <UserDashboardCards 
        totalCurricula={stats.totalCurricula}
        totalSchools={stats.totalSchools}
        totalPrograms={stats.totalPrograms}
        totalDepartments={stats.totalDepartments}
        loading={loading}
      />

      {/* Search Section */}
      <UserSearchSection 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        activeFilter={activeFilter}
        onFilter={handleFilter}
        isSearching={isSearching}
        disabled={loading}
      />

      {/* Search Status */}
      {isSearching && (
        <div className="user-search-status">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Searching across all curricula...</span>
        </div>
      )}

      {/* Schools List or Empty State */}
      {filteredSchools.length > 0 ? (
        <SchoolsList 
          schools={filteredSchools} 
          loading={loading}
        />
      ) : isInitialized && !loading ? (
        <div className="user-dashboard-empty">
          <div className="empty-state-container">
            <i className="fas fa-search"></i>
            <h3>No schools found</h3>
            <p>
              {searchTerm 
                ? `No schools or curricula match your search for "${searchTerm}"`
                : `No schools found with the current filter "${activeFilter}"`
              }
            </p>
            
            {/* Show different messages based on data availability */}
            {data.totalCurricula === 0 ? (
              <div className="no-data-message">
                <p>No curriculum data is currently available.</p>
                <div className="empty-actions">
                  <button 
                    className="refresh-btn-primary"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                    Try Loading Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-actions">
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                    Clear Search
                  </button>
                )}
                {activeFilter !== 'all' && (
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setActiveFilter('all')}
                  >
                    <i className="fas fa-filter"></i>
                    Show All Programs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Loading overlay for refresh */}
      {loading && isInitialized && (
        <div className="user-dashboard-loading-overlay">
          <div className="loading-message">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Updating data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;