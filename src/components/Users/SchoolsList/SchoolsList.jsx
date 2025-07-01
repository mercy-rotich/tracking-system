import React, { useState } from 'react';
import SchoolItem from '../SchoolItem/SchoolItem';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import './SchoolsList.css';

const SchoolsList = ({ schools, loading = false }) => {
  const { isOpen, modalData, openModal, closeModal } = useModal();
  const [focusedSchool, setFocusedSchool] = useState(null);

  const handleProgramClick = (schoolName, program) => {
    const modalContent = {
      title: `${program.name} Programs - ${schoolName}`,
      type: 'program-details',
      data: { schoolName, program }
    };
    openModal(modalContent);
  };

  const handleSchoolFocus = (schoolId) => {
    setFocusedSchool(schoolId);
  };

  const handleSchoolBlur = () => {
    setFocusedSchool(null);
  };

  
  if (loading) {
    return (
      <section className="user-schools-section">
        <div className="user-section-header">
          <h2 className="user-section-title">
            <i className="fas fa-university" />
            Academic Schools
          </h2>
        </div>
        <div className="user-schools-loading">
          <div className="schools-loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading schools and programs...</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!schools || schools.length === 0) {
    return (
      <section className="user-schools-section">
        <div className="user-section-header">
          <h2 className="user-section-title">
            <i className="fas fa-university" />
            Academic Schools
          </h2>
        </div>
        <div className="user-schools-empty">
          <div className="user-empty-state">
            <i className="fas fa-search" />
            <h3>No schools found</h3>
            <p>Try adjusting your search terms or filters to find curricula</p>
            <div className="empty-state-suggestions">
              <div className="suggestion-item">
                <i className="fas fa-lightbulb"></i>
                <span>Try searching for specific program names like "Engineering" or "Business"</span>
              </div>
              <div className="suggestion-item">
                <i className="fas fa-filter"></i>
                <span>Use the program filters to narrow down your search</span>
              </div>
              <div className="suggestion-item">
                <i className="fas fa-times"></i>
                <span>Clear your current search and filters to see all available curricula</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="user-schools-section">
        <div className="user-section-header">
          <h2 className="user-section-title">
            <i className="fas fa-university" />
            Academic Schools
          </h2>
          <div className="user-schools-count">
            {schools.length} school{schools.length !== 1 ? 's' : ''} found
          </div>
        </div>
        
        {/* Summary stats */}
        <div className="user-schools-summary">
          <div className="summary-stat">
            <i className="fas fa-book"></i>
            <span>{schools.reduce((sum, school) => sum + school.total, 0)} Total Curricula</span>
          </div>
          <div className="summary-stat">
            <i className="fas fa-graduation-cap"></i>
            <span>{schools.reduce((sum, school) => sum + school.programs.length, 0)} Programs</span>
          </div>
          <div className="summary-stat">
            <i className="fas fa-layer-group"></i>
            <span>{schools.reduce((sum, school) => sum + school.departments, 0)} Departments</span>
          </div>
        </div>
        
        <div className="user-schools-list">
          {schools.map((school) => (
            <SchoolItem
              key={school.id}
              school={school}
              onProgramClick={handleProgramClick}
              onFocus={() => handleSchoolFocus(school.id)}
              onBlur={handleSchoolBlur}
              isFocused={focusedSchool === school.id}
            />
          ))}
        </div>

        {/* Footer info */}
        <div className="user-schools-footer">
          <p>
            Showing {schools.length} schools with{' '}
            {schools.reduce((sum, school) => sum + school.total, 0)} curricula across{' '}
            {schools.reduce((sum, school) => sum + school.programs.length, 0)} programs
          </p>
        </div>
      </section>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={modalData.title}
          type={modalData.type}
          data={modalData.data}
        />
      )}
    </>
  );
};

export default SchoolsList;