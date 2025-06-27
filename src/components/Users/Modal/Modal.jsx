
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, type, data }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderModalContent = () => {
    if (type === 'program-details' && data) {
      return (
        <div className="user-modal-body">
          {data.program.departments.map((dept) => (
            <div key={dept.id || dept.name} className="user-department-item">
              <div className="user-department-header">
                <span>
                  <i className="fas fa-layer-group" />
                  {dept.name}
                </span>
                <span className="user-department-count">{dept.curricula.length}</span>
              </div>
              <div className="user-curriculum-list">
                {dept.curricula.map((curriculum) => (
                  <div key={curriculum.id || curriculum.title} className="user-curriculum-item">
                    <i className="fas fa-file-alt user-curriculum-icon" />
                    <span className="user-curriculum-name">{curriculum.title}</span>
                    <span className={`user-status-badge user-status-${curriculum.status}`}>
                      {curriculum.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="user-modal-body">
        <p>Content not available</p>
      </div>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="user-modal-overlay" onClick={handleBackdropClick}>
      <div className="user-modal-content user-fade-in">
        <div className="user-modal-header">
          <h3 className="user-modal-title">{title}</h3>
          <button 
            className="user-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fas fa-times" />
          </button>
        </div>
        {renderModalContent()}
      </div>
    </div>,
    document.body
  );
};

export default Modal;