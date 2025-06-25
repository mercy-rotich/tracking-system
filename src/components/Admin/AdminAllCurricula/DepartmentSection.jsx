import React from 'react';
import CurriculumCard from './CurriculumCard';

const DepartmentSection = ({ 
  departmentName, 
  curricula, 
  programName,
  isLoading, 
  onEdit, 
  onDelete, 
  onApprove, 
  onReject 
}) => {
  // Safety check for curricula prop
  const safeCurricula = curricula || [];

  
  const statusCounts = safeCurricula.reduce((acc, curriculum) => {
    acc[curriculum.status] = (acc[curriculum.status] || 0) + 1;
    return acc;
  }, {});

  const total = safeCurricula.length;
  const approved = statusCounts.approved || 0;
  const pending = statusCounts.pending || 0;
  const rejected = statusCounts.rejected || 0;
  const draft = statusCounts.draft || 0;

  return (
    <div className="curricula-department-section">
      {/* Department Header with Statistics */}
      <div className="curricula-department-header">
        <div className="curricula-department-info">
          <h2 className="curricula-department-name">{departmentName} Department</h2>
          <p className="curricula-department-subtitle">{programName} Programs</p>
        </div>
        
        <div className="curricula-department-stats">
          <div className="curricula-stat-pill curricula-stat-total">Total: {total}</div>
          <div className="curricula-stat-pill curricula-stat-approved">Approved: {approved}</div>
          <div className="curricula-stat-pill curricula-stat-pending">Pending: {pending}</div>
          {draft > 0 && <div className="curricula-stat-pill curricula-stat-draft">Draft: {draft}</div>}
          {rejected > 0 && <div className="curricula-stat-pill curricula-stat-rejected">Rejected: {rejected}</div>}
        </div>
      </div>

      
      <div className="curricula-department-content">
        <div className="curricula-grid">
          {safeCurricula.map((curriculum) => (
            <CurriculumCard
              key={curriculum.id}
              curriculum={curriculum}
              isLoading={isLoading}
              onEdit={onEdit}
              onDelete={onDelete}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentSection;