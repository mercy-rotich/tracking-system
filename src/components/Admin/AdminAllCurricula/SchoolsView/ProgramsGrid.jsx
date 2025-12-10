import React from 'react';

const ProgramCard = ({ program, schoolId, onProgramClick }) => {
  return (
    <div className="admin-program-card">
      <div 
        className="admin-program-header"
        onClick={() => onProgramClick(schoolId, program.id)}
        title={`Click to view ${program.count} curricula in ${program.enhancedDepartments.length} departments`}
      >
        <span className="admin-program-name">{program.name}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-secondary)', 
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Curricula
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="admin-program-count">{program.count}</span>
            <i className="fas fa-chevron-right" style={{ 
              color: 'var(--must-green-primary)', 
              fontSize: '0.875rem',
              transition: 'transform 0.2s ease'
            }}></i>
          </div>
        </div>
      </div>
      <div 
        className="admin-program-meta"
        onClick={() => onProgramClick(schoolId, program.id)}
      >
        {program.enhancedDepartments.length} departments • {program.count} curricula
        <div style={{ 
          fontSize: '0.75rem', 
          color: 'var(--must-green-primary)', 
          marginTop: '0.25rem',
          fontWeight: '500'
        }}>
          <i className="fas fa-mouse-pointer" style={{ marginRight: '0.25rem' }}></i>
          Click to view curricula
        </div>
      </div>
      <div className="admin-program-status">
        {program.statusStats.approved > 0 && (
          <span className="status-micro approved" title={`${program.statusStats.approved} approved`}>
            {program.statusStats.approved}
          </span>
        )}
        {program.statusStats.pending > 0 && (
          <span className="status-micro pending" title={`${program.statusStats.pending} pending`}>
            {program.statusStats.pending}
          </span>
        )}
        {program.statusStats.draft > 0 && (
          <span className="status-micro draft" title={`${program.statusStats.draft} draft`}>
            {program.statusStats.draft}
          </span>
        )}
        {program.statusStats.rejected > 0 && (
          <span className="status-micro rejected" title={`${program.statusStats.rejected} rejected`}>
            {program.statusStats.rejected}
          </span>
        )}
      </div>
      
      {program.enhancedDepartments.length > 0 && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'var(--background-secondary)', 
          borderRadius: '6px',
          fontSize: '0.8rem',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontWeight: '600', 
            marginBottom: '0.5rem', 
            color: 'var(--text-primary)' 
          }}>
            <span>Departments</span>
            <span>Curricula</span>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.25rem',
            maxWidth: '100%'
          }}>
            {program.enhancedDepartments.map((dept, index) => (
              <div key={dept.id || index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                color: 'var(--text-secondary)',
                minWidth: 0
              }}>
                <span style={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  marginRight: '0.5rem'
                }}>
                  {dept.name}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  fontWeight: '500',
                  flexShrink: 0
                }}>
                  {dept.curriculumCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'linear-gradient(135deg, rgba(0, 191, 99, 0.1), rgba(0, 191, 99, 0.05))',
        borderRadius: '6px',
        border: '1px solid rgba(0, 191, 99, 0.2)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onProgramClick(schoolId, program.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 191, 99, 0.15), rgba(0, 191, 99, 0.08))';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 191, 99, 0.1), rgba(0, 191, 99, 0.05))';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--must-green-primary)',
          fontWeight: '600',
          fontSize: '0.875rem'
        }}>
          <i className="fas fa-table"></i>
          <span>View Curricula Table</span>
          <i className="fas fa-arrow-right"></i>
        </div>
      </div>
    </div>
  );
};

const ProgramsGrid = ({ 
  programs, 
  schoolId, 
  isLoading, 
  error, 
  onProgramClick, 
  onRetry 
}) => {
  if (isLoading) {
    return (
      <div className="admin-programs-container">
        <div className="admin-departments-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading departments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-programs-container">
        <div className="admin-departments-error">
          <div>
            <i className="fas fa-exclamation-triangle"></i>
            <span>{error}</span>
          </div>
          <button 
            className="btn btn-sm btn-outline"
            onClick={onRetry}
          >
            <i className="fas fa-redo"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className="admin-programs-container">
        <div className="admin-departments-empty">
          <i className="fas fa-graduation-cap"></i>
          <span>No academic programs with curricula found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-programs-container">
      <div className="admin-programs-grid">
        {programs.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            schoolId={schoolId}
            onProgramClick={onProgramClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgramsGrid;
