
import React, { useState, useEffect } from 'react';
import { getStatusBadge } from '../../../components/Admin/AdminAllCurricula/BadgeComponents';
import Pagination from './Pagination';

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
  
  // Service
  curriculumService
}) => {
  
  const [expandedSchools, setExpandedSchools] = useState(new Set());
  const [selectedProgramView, setSelectedProgramView] = useState(null);
  const [showingCurriculaFor, setShowingCurriculaFor] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]);
  const [schoolsViewData, setSchoolsViewData] = useState([]);
  const [programViewData, setProgramViewData] = useState([]);
  const [isLoadingSchoolsData, setIsLoadingSchoolsData] = useState(false);
  
  // Program view pagination
  const [programCurrentPage, setProgramCurrentPage] = useState(0);
  const [programPageSize] = useState(20);
  const [programTotalPages, setProgramTotalPages] = useState(0);
  const [programHasNext, setProgramHasNext] = useState(false);
  const [programHasPrevious, setProgramHasPrevious] = useState(false);
  const [programTotalElements, setProgramTotalElements] = useState(0);

  
  useEffect(() => {
    if (!showingCurriculaFor) {
      loadSchoolsViewData();
    }
  }, [searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy]);

  const loadSchoolsViewData = async () => {
    setIsLoadingSchoolsData(true);
    try {
      console.log('🔄 Loading data for schools view...');
      
      let result;
      
      if (searchTerm && searchTerm.length >= 2) {
        result = await curriculumService.searchByName(searchTerm, 0, 500);
      } else if (selectedSchool !== 'all') {
        result = await curriculumService.getCurriculumsBySchool(selectedSchool, 0, 500);
      } else if (selectedProgram !== 'all') {
        const academicLevelMap = { bachelor: 1, masters: 2, phd: 3 };
        const academicLevelId = academicLevelMap[selectedProgram];
        if (academicLevelId) {
          result = await curriculumService.getCurriculumsByAcademicLevel(academicLevelId, 0, 500);
        } else {
          result = await curriculumService.getAllCurriculums(0, 500);
        }
      } else {
        result = await curriculumService.getAllCurriculums(0, 500);
      }
      
      let filteredCurricula = result.curriculums;
      
      if (selectedDepartment !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.department === selectedDepartment);
      }
      
      if (statusFilter !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.status === statusFilter);
      }
      
      
      filteredCurricula.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdDate || b.lastModified) - new Date(a.createdDate || a.lastModified);
          case 'oldest':
            return new Date(a.createdDate || a.lastModified) - new Date(b.createdDate || b.lastModified);
          case 'title':
            return (a.title || '').localeCompare(b.title || '');
          case 'department':
            return (a.department || '').localeCompare(b.department || '');
          default:
            return 0;
        }
      });
      
      setSchoolsViewData(filteredCurricula);
      
    } catch (error) {
      console.error('❌ Error loading schools view data:', error);
      setSchoolsViewData([]);
    } finally {
      setIsLoadingSchoolsData(false);
    }
  };

  const loadProgramViewData = async (schoolId, programId, page = 0) => {
    try {
      console.log(`🔄 Loading curricula for school ${schoolId}, program ${programId}, page ${page + 1}...`);
      
      const result = await curriculumService.getCurriculumsBySchool(schoolId, page, programPageSize);
      
      let filteredCurricula = result.curriculums.filter(c => c.programId === programId);
      
      if (selectedDepartment !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.department === selectedDepartment);
      }
      
      if (statusFilter !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.status === statusFilter);
      }
      
    
      filteredCurricula.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdDate || b.lastModified) - new Date(a.createdDate || a.lastModified);
          case 'oldest':
            return new Date(a.createdDate || a.lastModified) - new Date(b.createdDate || b.lastModified);
          case 'title':
            return (a.title || '').localeCompare(b.title || '');
          case 'department':
            return (a.department || '').localeCompare(b.department || '');
          default:
            return 0;
        }
      });
      
      setProgramViewData(filteredCurricula);
      
      
      const totalProgramCurricula = result.pagination?.totalElements || filteredCurricula.length;
      const estimatedProgramTotal = Math.ceil(totalProgramCurricula * (filteredCurricula.length / Math.max(result.curriculums.length, 1)));
      
      setProgramTotalElements(estimatedProgramTotal);
      setProgramTotalPages(Math.ceil(estimatedProgramTotal / programPageSize));
      setProgramHasNext(page < Math.ceil(estimatedProgramTotal / programPageSize) - 1);
      setProgramHasPrevious(page > 0);
      
    } catch (error) {
      console.error('❌ Error loading program view data:', error);
      setProgramViewData([]);
    }
  };

  const toggleSchool = (schoolId) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
      if (showingCurriculaFor && showingCurriculaFor.schoolId === schoolId) {
        setShowingCurriculaFor(null);
        setSelectedProgramView(null);
        setNavigationPath([]);
      }
    } else {
      newExpanded.add(schoolId);
    }
    setExpandedSchools(newExpanded);
  };

  const handleProgramClick = async (schoolId, programId) => {
    const school = schools.find(s => s.id === schoolId);
    const program = programs.find(p => p.id === programId);
    
    setShowingCurriculaFor({ schoolId, programId });
    setSelectedProgramView({ schoolId, programId });
    setProgramCurrentPage(0);
    
    setNavigationPath([
      { label: 'Schools', action: () => handleBackToSchools() },
      { label: school?.name || 'Unknown School', action: () => handleBackToSchools() },
      { label: program?.name || 'Unknown Program', action: null }
    ]);
    
    await loadProgramViewData(schoolId, programId, 0);
  };

  const handleBackToSchools = async () => {
    setShowingCurriculaFor(null);
    setSelectedProgramView(null);
    setNavigationPath([]);
    setProgramCurrentPage(0);
    await loadSchoolsViewData();
  };

  const getSchoolStats = (schoolId) => {
    const schoolCurricula = schoolsViewData.filter(c => 
      c.schoolId?.toString() === schoolId?.toString()
    );
    
    const departments = [...new Set(schoolCurricula.map(c => c.department))];
    
    const statusStats = {
      approved: schoolCurricula.filter(c => c.status === 'approved').length,
      pending: schoolCurricula.filter(c => c.status === 'pending').length,
      draft: schoolCurricula.filter(c => c.status === 'draft').length,
      rejected: schoolCurricula.filter(c => c.status === 'rejected').length
    };
    
    return {
      total: schoolCurricula.length,
      departments: departments.length,
      programs: getProgramsForSchool(schoolId).length,
      statusStats
    };
  };

  const getProgramsForSchool = (schoolId) => {
    const schoolCurricula = schoolsViewData.filter(c => 
      c.schoolId?.toString() === schoolId?.toString()
    );
    
    return programs.map(program => {
      const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
      const departments = [...new Set(programCurricula.map(c => c.department))];
      
      const statusStats = {
        approved: programCurricula.filter(c => c.status === 'approved').length,
        pending: programCurricula.filter(c => c.status === 'pending').length,
        draft: programCurricula.filter(c => c.status === 'draft').length,
        rejected: programCurricula.filter(c => c.status === 'rejected').length
      };
      
      return {
        ...program,
        count: programCurricula.length,
        departments: departments.length,
        statusStats
      };
    }).filter(program => program.count > 0);
  };

  const getCurriculaForProgram = (schoolId, programId) => {
    if (showingCurriculaFor) {
      return programViewData;
    }
    return schoolsViewData.filter(c => 
      c.schoolId?.toString() === schoolId?.toString() && c.programId === programId
    );
  };

  // Program pagination handlers
  const goToProgramPage = async (page) => {
    if (page >= 0 && page < programTotalPages && showingCurriculaFor) {
      setProgramCurrentPage(page);
      await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, page);
    }
  };

  const goToPreviousProgramPage = async () => {
    if (programHasPrevious && showingCurriculaFor) {
      const newPage = programCurrentPage - 1;
      setProgramCurrentPage(newPage);
      await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, newPage);
    }
  };

  const goToNextProgramPage = async () => {
    if (programHasNext && showingCurriculaFor) {
      const newPage = programCurrentPage + 1;
      setProgramCurrentPage(newPage);
      await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, newPage);
    }
  };

  // Utility functions
  const getTimeSince = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''} ago`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-CA');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const renderCurriculumActions = (curriculum) => {
    if (curriculum.status === 'pending') {
      return (
        <div className="curricula-table-actions">
          <button 
            className="curricula-table-action-btn curricula-table-approve"
            onClick={() => onApprove(curriculum)}
            disabled={isLoading}
            title="Approve"
          >
            <i className="fas fa-check"></i>
          </button>
          <button 
            className="curricula-table-action-btn curricula-table-reject"
            onClick={() => onReject(curriculum)}
            disabled={isLoading}
            title="Reject"
          >
            <i className="fas fa-times"></i>
          </button>
          <button 
            className="curricula-table-action-btn curricula-table-view"
            onClick={() => onEdit(curriculum)}
            disabled={isLoading}
            title="Edit"
          >
            <i className="fas fa-edit"></i>
          </button>
        </div>
      );
    }

    return (
      <div className="curricula-table-actions">
        <button 
          className="curricula-table-action-btn curricula-table-view"
          onClick={() => onEdit(curriculum)}
          disabled={isLoading}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button 
          className="curricula-table-action-btn curricula-table-delete"
          onClick={() => onDelete(curriculum)}
          disabled={isLoading}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    );
  };

  const renderBreadcrumbs = () => {
    if (navigationPath.length === 0) return null;

    return (
      <div className="breadcrumb-navigation">
        <div className="breadcrumb-container">
          {navigationPath.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <i className="fas fa-chevron-right breadcrumb-separator"></i>}
              <button
                className={`breadcrumb-item ${!item.action ? 'current' : ''}`}
                onClick={item.action}
                disabled={!item.action}
              >
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  
  if (showingCurriculaFor) {
    const programCurricula = getCurriculaForProgram(showingCurriculaFor.schoolId, showingCurriculaFor.programId);
    const school = schools.find(s => s.id === showingCurriculaFor.schoolId);
    const program = programs.find(p => p.id === showingCurriculaFor.programId);

    if (isLoading) {
      return (
        <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
          {renderBreadcrumbs()}
          <div className="content-section">
            <div className="curricula-loading-spinner">
              <div className="spinner"></div>
              <p>Loading program curricula...</p>
            </div>
          </div>
        </div>
      );
    }

    if (programCurricula.length === 0) {
      return (
        <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
          {renderBreadcrumbs()}
          <div className="curricula-table-program-header">
            <div className="curricula-table-program-info">
              <h3 className="curricula-table-program-title">
                {program?.name} - {school?.name}
              </h3>
              <div className="curricula-table-program-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={handleBackToSchools}
                >
                  <i className="fas fa-arrow-left"></i>
                  Back to Schools
                </button>
              </div>
            </div>
          </div>
          <div className="empty-state">
            <i className="fas fa-book-open"></i>
            <h3>No curricula found</h3>
            <p>No curricula available for this program with current filters.</p>
          </div>
        </div>
      );
    }

    // Group curricula by department
    const groupedByDepartment = programCurricula.reduce((acc, curriculum) => {
      const department = curriculum.department;
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(curriculum);
      return acc;
    }, {});

    const departmentNames = Object.keys(groupedByDepartment).sort();

    return (
      <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
        {renderBreadcrumbs()}
        <div className="curricula-table-program-header">
          <div className="curricula-table-program-info">
            <h3 className="curricula-table-program-title">
              {program?.name} - {school?.name}
            </h3>
            <p className="curricula-table-program-subtitle">
              {programCurricula.length} curricula across {departmentNames.length} departments
            </p>
          </div>
          <div className="curricula-table-program-actions">
            <button 
              className="btn btn-sm btn-outline"
              onClick={handleBackToSchools}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Schools
            </button>
          </div>
        </div>

        <div className="admin-departments-container">
          {departmentNames.map((departmentName) => {
            const departmentCurricula = groupedByDepartment[departmentName];
            
            return (
              <div key={departmentName} className="admin-department-section">
                <div className="admin-department-header">
                  <div className="admin-department-info">
                    <i className="fas fa-layer-group admin-department-icon"></i>
                    <span className="admin-department-name">{departmentName}</span>
                  </div>
                  <div className="admin-department-count">
                    {departmentCurricula.length}
                  </div>
                </div>

                <div className="admin-department-content">
                  <div className="curricula-table-wrapper">
                    <table className="curricula-table">
                      <thead className="curricula-table-header">
                        <tr>
                          <th className="curricula-table-th">Curriculum Title</th>
                          <th className="curricula-table-th">Status</th>
                          <th className="curricula-table-th">Last Updated</th>
                          <th className="curricula-table-th">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="curricula-table-body">
                        {departmentCurricula.map((curriculum) => (
                          <tr key={curriculum.id} className="curricula-table-row">
                            <td className="curricula-table-td">
                              <div className="curricula-table-title-content">
                                <span className="curricula-table-title-text">{curriculum.title}</span>
                                <span className="curricula-table-title-id">{curriculum.code || curriculum.id}</span>
                              </div>
                            </td>
                            <td className="curricula-table-td">
                              {getStatusBadge(curriculum.status)}
                            </td>
                            <td className="curricula-table-td">
                              <div className="curricula-table-date-content">
                                <span className="curricula-table-date-main">{formatDate(curriculum.lastModified)}</span>
                                <span className="curricula-table-date-relative">{getTimeSince(curriculum.lastModified)}</span>
                              </div>
                            </td>
                            <td className="curricula-table-td">
                              {renderCurriculumActions(curriculum)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Pagination
          currentPage={programCurrentPage}
          pageSize={programPageSize}
          totalElements={programTotalElements}
          totalPages={programTotalPages}
          hasNext={programHasNext}
          hasPrevious={programHasPrevious}
          onPageChange={goToProgramPage}
          onPreviousPage={goToPreviousProgramPage}
          onNextPage={goToNextProgramPage}
          onPageSizeChange={() => {}} 
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (isLoadingSchoolsData) {
    return (
      <div className="content-section">
        <div className="curricula-loading-spinner">
          <div className="spinner"></div>
          <p>Loading schools data...</p>
        </div>
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
        <p>No curricula found or data is still loading.</p>
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
    const stats = getSchoolStats(school.id);
    return { ...school, stats };
  }).filter(school => school.stats.total > 0);

  if (schoolsWithData.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-university"></i>
        <h3>No schools found</h3>
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
      <div className="admin-section-header">
        <h2 className="admin-section-title">
          <i className="fas fa-university"></i>
          Academic Schools
        </h2>
        <span className="admin-schools-count">
          {schoolsWithData.length} schools found
        </span>
      </div>
      
      <div className="admin-schools-list">
        {schoolsWithData.map((school) => {
          const schoolPrograms = getProgramsForSchool(school.id);
          const isExpanded = expandedSchools.has(school.id);

          return (
            <div key={school.id} className="admin-school-item">
              <div 
                className="admin-school-header" 
                onClick={() => toggleSchool(school.id)}
              >
                <div className="admin-school-info">
                  <div className="admin-school-icon">
                    <i className="fas fa-university"></i>
                  </div>
                  <div className="admin-school-details">
                    <h3>{school.name}</h3>
                    <div className="admin-school-meta">
                      {school.stats.programs} Academic levels • {school.stats.departments} departments • {school.stats.total} curricula
                    </div>
                    <div className="admin-school-status-summary">
                      {school.stats.statusStats.approved > 0 && (
                        <span className="status-mini approved">{school.stats.statusStats.approved} approved</span>
                      )}
                      {school.stats.statusStats.pending > 0 && (
                        <span className="status-mini pending">{school.stats.statusStats.pending} pending</span>
                      )}
                      {school.stats.statusStats.draft > 0 && (
                        <span className="status-mini draft">{school.stats.statusStats.draft} draft</span>
                      )}
                      {school.stats.statusStats.rejected > 0 && (
                        <span className="status-mini rejected">{school.stats.statusStats.rejected} rejected</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="admin-school-stats">
                  <span className="admin-stat-badge">{school.stats.total}</span>
                  <i className={`fas fa-chevron-down admin-expand-icon ${isExpanded ? 'expanded' : ''}`}></i>
                </div>
              </div>

              {isExpanded && (
                <div className="admin-programs-container">
                  <div className="admin-programs-grid">
                    {schoolPrograms.map(program => (
                      <div 
                        key={program.id} 
                        className="admin-program-card"
                        onClick={() => handleProgramClick(school.id, program.id)}
                      >
                        <div className="admin-program-header">
                          <span className="admin-program-name">{program.name}</span>
                          <span className="admin-program-count">{program.count}</span>
                        </div>
                        <div className="admin-program-meta">
                          {program.departments} departments
                        </div>
                        <div className="admin-program-status">
                          {program.statusStats.approved > 0 && (
                            <span className="status-micro approved" title="Approved">{program.statusStats.approved}</span>
                          )}
                          {program.statusStats.pending > 0 && (
                            <span className="status-micro pending" title="Pending">{program.statusStats.pending}</span>
                          )}
                          {program.statusStats.draft > 0 && (
                            <span className="status-micro draft" title="Draft">{program.statusStats.draft}</span>
                          )}
                          {program.statusStats.rejected > 0 && (
                            <span className="status-micro rejected" title="Rejected">{program.statusStats.rejected}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolsView;