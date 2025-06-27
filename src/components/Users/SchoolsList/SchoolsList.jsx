
import React, { useState } from 'react';
import SchoolItem from '../SchoolItem/SchoolItem';
import Modal from '../Modal/Modal';
import { useModal } from '../../../hooks/useModal';
import './SchoolsList.css';

const SchoolsList = ({ schools }) => {
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

  if (schools.length === 0) {
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
            <p>Try adjusting your search terms or filters</p>
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