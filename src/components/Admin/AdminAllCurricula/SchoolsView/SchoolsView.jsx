import React, { useState } from 'react';
import LoadingSpinner from '../../../common/LoadingSpinner';
import SchoolCard from './SchoolCard';
import ProgramsGrid from './ProgramsGrid';
import ProgramDetailsView from './ProgramDetailsView';
import InteractionHint from './InteractionHint';
import { useSchoolsViewData, useProgramViewData, useSchoolMapping } from './useSchoolsData';
import { useDepartmentManagement } from './useDepartmentManagement';
import { getSchoolStatsEnhanced, getProgramsForSchoolEnhanced, enhanceProgramsWithDepartments } from './schoolsViewHelpers';
import './SchoolsView.css';

const SchoolsView = ({
  schools,
  programs,
  isLoading,
  searchTerm,
  selectedSchool,
  selectedProgram,
  selectedDepartment,
  statusFilter,
  sortBy,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefresh,
  curriculumService,
  getSchoolName,
  findSchool
}) => {
  const [expandedSchools, setExpandedSchools] = useState(new Set());
  const [showingCurriculaFor, setShowingCurriculaFor] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]);
  const [showInteractionHint, setShowInteractionHint] = useState(true);

  const { schoolsViewData, allSchoolsData, isLoadingSchoolsData, loadSchoolsViewData } = useSchoolsViewData(
    curriculumService,
    searchTerm,
    selectedSchool,
    selectedProgram,
    selectedDepartment,
    statusFilter,
    sortBy,
    showingCurriculaFor
  );

  const {
    programViewData,
    programCurrentPage,
    programPageSize,
    programTotalPages,
    programHasNext,
    programHasPrevious,
    programTotalElements,
    loadProgramViewData,
    goToProgramPage,
    goToNextProgramPage,
    goToPreviousProgramPage
  } = useProgramViewData(curriculumService);

  const { schoolMapping } = useSchoolMapping(schools, allSchoolsData, schoolsViewData);

  const {
    loadSchoolDepartments,
    retryLoadDepartments,
    getDepartmentsForSchool,
    isDepartmentsLoading,
    getDepartmentError
  } = useDepartmentManagement(curriculumService.departmentService || {
    getDepartmentsBySchool: async () => []
  });

  const toggleSchool = async (schoolId) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
      if (showingCurriculaFor && showingCurriculaFor.schoolId === schoolId) {
        setShowingCurriculaFor(null);
        setNavigationPath([]);
      }
    } else {
      newExpanded.add(schoolId);
      await loadSchoolDepartments(schoolId);
      setShowInteractionHint(false);
    }
    setExpandedSchools(newExpanded);
  };

  const handleProgramClick = async (schoolId, programId) => {
    const school = findSchool ? findSchool(schoolId) : schools.find(s => s.id === schoolId);
    const program = programs.find(p => p.id === programId);
    
    setShowingCurriculaFor({ schoolId, programId });
    
    setNavigationPath([
      { label: 'Schools', action: () => handleBackToSchools() },
      { label: school?.name || getSchoolName(schoolId) || 'Unknown School', action: () => handleBackToSchools() },
      { label: program?.name || 'Unknown Program', action: null }
    ]);
    
    await loadProgramViewData(schoolId, programId, schoolMapping, selectedDepartment, statusFilter, sortBy, 0);
  };

  const handleBackToSchools = async () => {
    setShowingCurriculaFor(null);
    setNavigationPath([]);
    await loadSchoolsViewData();
  };

  const renderSchoolAcademicPrograms = (schoolId) => {
    const stats = getSchoolStatsEnhanced(
      schoolId,
      schools,
      allSchoolsData,
      schoolsViewData,
      schoolMapping,
      getDepartmentsForSchool
    );
    const schoolCurricula = stats.matchedCurricula || [];
    const schoolPrograms = getProgramsForSchoolEnhanced(schoolId, programs, schoolCurricula);
    const backendDepartments = getDepartmentsForSchool(schoolId);
    const enhancedPrograms = enhanceProgramsWithDepartments(schoolPrograms, schoolCurricula, backendDepartments);

    return (
      <ProgramsGrid
        programs={enhancedPrograms}
        schoolId={schoolId}
        isLoading={isDepartmentsLoading(schoolId)}
        error={getDepartmentError(schoolId)}
        onProgramClick={handleProgramClick}
        onRetry={() => retryLoadDepartments(schoolId)}
      />
    );
  };

  if (showingCurriculaFor) {
    const school = findSchool 
      ? findSchool(showingCurriculaFor.schoolId) 
      : schools.find(s => s.id === showingCurriculaFor.schoolId);
    const program = programs.find(p => p.id === showingCurriculaFor.programId);

    return (
      <ProgramDetailsView
        navigationPath={navigationPath}
        programViewData={programViewData}
        school={school}
        program={program}
        isLoading={isLoading}
        isLoadingSchoolsData={isLoadingSchoolsData}
        onBack={handleBackToSchools}
        onRetry={() => loadProgramViewData(
          showingCurriculaFor.schoolId, 
          showingCurriculaFor.programId, 
          schoolMapping,
          selectedDepartment,
          statusFilter,
          sortBy,
          0
        )}
        onEdit={onEdit}
        onDelete={onDelete}
        onApprove={onApprove}
        onReject={onReject}
        pagination={{
          currentPage: programCurrentPage,
          pageSize: programPageSize,
          totalElements: programTotalElements,
          totalPages: programTotalPages,
          hasNext: programHasNext,
          hasPrevious: programHasPrevious,
          onPageChange: goToProgramPage,
          onPreviousPage: goToPreviousProgramPage,
          onNextPage: goToNextProgramPage
        }}
      />
    );
  }

  if (isLoadingSchoolsData) {
    return (
      <div className="content-section">
        <LoadingSpinner message="Loading schools data..." />
      </div>
    );
  }

  if (!schools || schools.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-university"></i>
        <h3>Loading schools...</h3>
        <p>Please wait while we load the schools data.</p>
        <button 
          className="btn btn-primary" 
          onClick={onRefresh}
          disabled={isLoadingSchoolsData}
        >
          <i className="fas fa-refresh"></i>
          Retry Loading Schools
        </button>
      </div>
    );
  }

  if (!schoolsViewData || schoolsViewData.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-book-open"></i>
        <h3>No curricula data</h3>
        <p>No curricula found with current filters.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => loadSchoolsViewData()}
          disabled={isLoadingSchoolsData}
        >
          <i className="fas fa-refresh"></i>
          Load Data
        </button>
      </div>
    );
  }

  const schoolsWithData = schools.map(school => {
    const stats = getSchoolStatsEnhanced(
      school.id,
      schools,
      allSchoolsData,
      schoolsViewData,
      schoolMapping,
      getDepartmentsForSchool
    );
    const schoolPrograms = getProgramsForSchoolEnhanced(school.id, programs, stats.matchedCurricula || []);
    return { 
      ...school, 
      stats: {
        ...stats,
        programs: schoolPrograms.length
      }
    };
  }).filter(school => school.stats.total > 0);

  if (schoolsWithData.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-university"></i>
        <h3>No schools found with curricula</h3>
        <p>No schools have curricula matching your current filters.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => loadSchoolsViewData()}
          disabled={isLoadingSchoolsData}
        >
          <i className="fas fa-refresh"></i>
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="admin-schools-section">
      <InteractionHint 
        show={showInteractionHint && schoolsWithData.length > 0}
        onDismiss={() => setShowInteractionHint(false)}
      />

      <div className="admin-section-header">
        <h2 className="admin-section-title">
          <i className="fas fa-university"></i>
          Academic Schools
        </h2>
        <span className="admin-schools-count">
          {schoolsWithData.length} schools found with curricula
        </span>
      </div>
      
      <div className="admin-schools-list">
        {schoolsWithData.map((school) => {
          const isExpanded = expandedSchools.has(school.id);

          return (
            <SchoolCard
              key={school.id}
              school={school}
              isExpanded={isExpanded}
              onToggle={() => toggleSchool(school.id)}
            >
              {renderSchoolAcademicPrograms(school.id)}
            </SchoolCard>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolsView;
