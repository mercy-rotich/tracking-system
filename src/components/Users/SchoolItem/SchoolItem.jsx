
import React, { useState } from 'react';
import ProgramCard from '../ProgramCard/ProgramCard';
import './SchoolItem.css';

const SchoolItem = ({ school, onProgramClick, onFocus, onBlur, isFocused }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMouseEnter = () => {
    if (onFocus) onFocus();
  };

  const handleMouseLeave = () => {
    if (onBlur) onBlur();
  };

  const getSchoolIconGradient = (index) => {
    const gradients = [
      'user-gradient-green',
      'user-gradient-gold', 
      'user-gradient-blue',
      'user-gradient-purple'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div 
      className={`user-school-item ${isExpanded ? 'user-school-item--expanded' : ''} ${isFocused ? 'user-school-item--focused' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="user-school-header" onClick={handleToggleExpanded}>
        <div className="user-school-info">
          <div className={`user-school-icon user-school-icon--${getSchoolIconGradient(0)}`}>
            <i className={school.icon} />
          </div>
          <div className="user-school-details">
            <h3>School of {school.name}</h3>
            <div className="user-school-meta">
              {school.departments} departments • {school.total} curricula
            </div>
          </div>
        </div>
        <div className="user-school-stats">
          <span className="user-stat-badge">{school.total}</span>
          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} user-expand-icon`} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="user-programs-container">
          <div className="user-programs-grid">
            {school.programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                schoolName={school.name}
                onClick={() => onProgramClick(school.name, program)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolItem;