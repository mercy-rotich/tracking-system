import React from 'react';
import './SchoolNavigation.css'; // Import the external CSS file

const SchoolNavigation = ({
  schools,
  programs,
  departments,
  searchTerm,
  setSearchTerm,
  selectedSchool,
  setSelectedSchool,
  selectedProgram,
  setSelectedProgram,
  selectedDepartment,
  setSelectedDepartment,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) => {
  return (
    <div className='school-navigation'>
      <div className="hierarchical-navigation">
      {/* School Tabs */}
      <div className="navigation-section">
        <h3 className="nav-section-title">
          <i className="fas fa-university"></i>
          Schools
        </h3>
        <div className="navigation-tabs">
          <button
            className={`nav-tab ${selectedSchool === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSchool('all')}
          >
            <i className="fas fa-globe"></i>
            All Schools
          </button>
          {schools.map(school => (
            <button
              key={school.id}
              className={`nav-tab ${selectedSchool === school.id ? 'active' : ''}`}
              onClick={() => setSelectedSchool(school.id)}
            >
              <i className={`fas fa-${school.icon}`}></i>
              {school.name}
            </button>
          ))}
        </div>
        {/* Program Chips */}
     
        <h3 className="nav-section-title">
          <i className="fas fa-graduation-cap"></i>
          Programs
        </h3>
        <div className="navigation-chips">
          <span
            className={`nav-chip ${selectedProgram === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedProgram('all')}
          >
            <i className="fas fa-list"></i>
            All Programs
          </span>
          {programs.map(program => (
            <span
              key={program.id}
              className={`nav-chip ${selectedProgram === program.id ? 'active' : ''}`}
              onClick={() => setSelectedProgram(program.id)}
            >
              <i className={`fas fa-${program.icon}`}></i>
              {program.displayName}
            </span>
          ))}
        
      </div>
      </div>

      

      
      

    </div>
    </div>
  );
};

export default SchoolNavigation;