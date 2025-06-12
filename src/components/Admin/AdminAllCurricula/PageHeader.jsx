import React from 'react';

const PageHeader = ({ onAddNew }) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div>
          <h1 className="page-title">All Curricula</h1>
          <p className="page-subtitle">Manage and oversee all educational curricula in the system</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => window.print()}
          >
            <i className="fas fa-print"></i>
            Print Report
          </button>
          <button 
            className="btn btn-primary"
            onClick={onAddNew}
          >
            <i className="fas fa-plus"></i>
            Add New Curriculum
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;