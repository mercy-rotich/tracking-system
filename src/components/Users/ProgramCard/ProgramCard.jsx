
import React from 'react';
import './ProgramCard.css';

const ProgramCard = ({ program, schoolName, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(schoolName, program);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div 
      className="user-program-card"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View ${program.name} programs in ${schoolName}`}
    >
      <div className="user-program-header">
        <span className="user-program-name">{program.name} Programs</span>
        <span className="user-program-count">{program.count}</span>
      </div>
      
      <div className="user-program-details">
        <div className="user-program-meta">
          <i className="fas fa-layer-group" />
          {program.departments.length} department{program.departments.length !== 1 ? 's' : ''}
        </div>
        
        <div className="user-program-type">
          <i className={`fas fa-${program.type === 'masters' ? 'graduation-cap' : program.type === 'phd' ? 'user-graduate' : 'book'}`} />
          {program.type.charAt(0).toUpperCase() + program.type.slice(1)} Level
        </div>
      </div>
      
      <div className="user-program-action">
        <span>View Details</span>
        <i className="fas fa-arrow-right" />
      </div>
    </div>
  );
};

export default ProgramCard;