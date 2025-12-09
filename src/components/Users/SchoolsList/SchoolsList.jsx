import React from 'react';
import SchoolItem from '../SchoolItem/SchoolItem';
import './SchoolsList.css';

const SchoolsList = ({ schools, loading, onProgramClick }) => {
  if (loading) {
    return (
      <div className="schools-list-loading">
        <div className="spinner"></div>
        <p>Loading academic schools...</p>
      </div>
    );
  }

  if (!schools || schools.length === 0) {
    return null;
  }

  return (
    <div className="schools-list-section">
      <h2 className="schools-list-title">
        Browse by School
        <span className="school-count">{schools.length} Schools</span>
      </h2>
      
      <div className="schools-grid">
        {schools.map((school, index) => (
         
          <SchoolItem 
            key={school.id || index} 
            school={school}
            onProgramClick={onProgramClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SchoolsList;