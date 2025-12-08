import React, { useState, useEffect } from 'react';
import { getStatusBadge } from '../BadgeComponents';
import Pagination from '../Pagination';
import departmentService from '../../../../services/departmentService';
import LoadingSpinner from '../../../common/LoadingSpinner';
import './SchoolsView.css'

const SchoolsView = ({
  schools,
  programs,
  isLoading,
  
  // Filters
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
  const [selectedProgramView, setSelectedProgramView] = useState(null);
  const [showingCurriculaFor, setShowingCurriculaFor] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]);
  const [schoolsViewData, setSchoolsViewData] = useState([]);
  const [programViewData, setProgramViewData] = useState([]);
  const [isLoadingSchoolsData, setIsLoadingSchoolsData] = useState(false);
  const [schoolMapping, setSchoolMapping] = useState(new Map());
  
  
  const [schoolDepartments, setSchoolDepartments] = useState(new Map());
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(new Set());
  const [departmentErrors, setDepartmentErrors] = useState(new Map());
  
  
  const [programCurrentPage, setProgramCurrentPage] = useState(0);
  const [programPageSize] = useState(20);
  const [programTotalPages, setProgramTotalPages] = useState(0);
  const [programHasNext, setProgramHasNext] = useState(false);
  const [programHasPrevious, setProgramHasPrevious] = useState(false);
  const [programTotalElements, setProgramTotalElements] = useState(0);

  
  const [showInteractionHint, setShowInteractionHint] = useState(true);

  useEffect(() => {
    if (schools.length > 0 && schoolsViewData.length > 0) {
      createSchoolMapping();
    }
  }, [schools, schoolsViewData]);

  useEffect(() => {
    if (!showingCurriculaFor) {
      loadSchoolsViewData();
    }
  }, [searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy]);


  const loadSchoolDepartments = async (schoolId) => {
    if (schoolDepartments.has(schoolId) || isLoadingDepartments.has(schoolId)) {
      return;
    }

    console.log(`🏢 Loading departments for school: ${schoolId}`);
    
    
    setIsLoadingDepartments(prev => new Set(prev).add(schoolId));
    
    try {
      const departments = await departmentService.getDepartmentsBySchool(schoolId, 0, 100);
      
      setSchoolDepartments(prev => new Map(prev).set(schoolId, departments));
      setDepartmentErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(schoolId);
        return newErrors;
      });
      
      console.log(`✅ Loaded ${departments.length} departments for school ${schoolId}`);
      
    } catch (error) {
      console.error(`❌ Error loading departments for school ${schoolId}:`, error);
      
      let errorMessage = 'Failed to load departments';
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        errorMessage = 'Authentication required';
      } else if (error.message.includes('403')) {
        errorMessage = 'Permission denied';
      } else if (error.message.includes('404')) {
        errorMessage = 'Departments not found';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error';
      }
      
      setDepartmentErrors(prev => new Map(prev).set(schoolId, errorMessage));
      setSchoolDepartments(prev => new Map(prev).set(schoolId, []));
      
    } finally {
      setIsLoadingDepartments(prev => {
        const newSet = new Set(prev);
        newSet.delete(schoolId);
        return newSet;
      });
    }
  };

  
  const retryLoadDepartments = async (schoolId) => {
    
    setDepartmentErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(schoolId);
      return newErrors;
    });
    setSchoolDepartments(prev => {
      const newDepts = new Map(prev);
      newDepts.delete(schoolId);
      return newDepts;
    });
    
    
    await loadSchoolDepartments(schoolId);
  };

  
  const getDepartmentsForSchool = (schoolId) => {
    return schoolDepartments.get(schoolId) || [];
  };

  
  const isDepartmentsLoading = (schoolId) => {
    return isLoadingDepartments.has(schoolId);
  };

  // Get department error for a school
  const getDepartmentError = (schoolId) => {
    return departmentErrors.get(schoolId);
  };

  const createSchoolMapping = () => {
    const mapping = new Map();
    const curriculumSchools = new Map();
    
    schoolsViewData.forEach(curriculum => {
      if (curriculum.schoolId && curriculum.schoolName) {
        curriculumSchools.set(curriculum.schoolId, curriculum.schoolName);
      }
    });
    
    schools.forEach(apiSchool => {
      let mappedTo = null;
      
      if (curriculumSchools.has(apiSchool.id)) {
        mappedTo = apiSchool.id;
      } else if (apiSchool.code && curriculumSchools.has(apiSchool.code)) {
        mappedTo = apiSchool.code;
      } else {
        for (const [id, name] of curriculumSchools.entries()) {
          if (name === apiSchool.name) {
            mappedTo = id;
            break;
          }
        }
      }
      
      if (!mappedTo) {
        for (const [id, name] of curriculumSchools.entries()) {
          if (name && apiSchool.name) {
            const nameWords = name.toLowerCase().split(' ').filter(w => w.length > 2);
            const apiWords = apiSchool.name.toLowerCase().split(' ').filter(w => w.length > 2);
            const commonWords = nameWords.filter(word => 
              apiWords.some(apiWord => word.includes(apiWord) || apiWord.includes(word))
            );
            
            if (commonWords.length >= Math.min(nameWords.length, apiWords.length) * 0.5) {
              mappedTo = id;
              break;
            }
          }
        }
      }
      
      mapping.set(apiSchool.id, mappedTo);
    });
    
    setSchoolMapping(mapping);
    return mapping;
  };

  const loadSchoolsViewData = async () => {
    setIsLoadingSchoolsData(true);
    try {
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
      console.error('Error loading schools view data:', error);
      setSchoolsViewData([]);
    } finally {
      setIsLoadingSchoolsData(false);
    }
  };

  const getSchoolStatsEnhanced = (schoolId) => {
    const school = schools.find(s => s.id === schoolId);
    let schoolCurricula = [];
    
    const mappedId = schoolMapping.get(schoolId);
    if (mappedId) {
      schoolCurricula = schoolsViewData.filter(c => c.schoolId?.toString() === mappedId?.toString());
    }
    
    if (schoolCurricula.length === 0) {
      schoolCurricula = schoolsViewData.filter(c => c.schoolId?.toString() === schoolId?.toString());
      
      if (schoolCurricula.length === 0 && school?.code) {
        schoolCurricula = schoolsViewData.filter(c => c.schoolId?.toString() === school.code?.toString());
      }
      
      if (schoolCurricula.length === 0 && school?.name) {
        schoolCurricula = schoolsViewData.filter(c => c.schoolName === school.name);
      }
      
      if (schoolCurricula.length === 0 && school?.name) {
        const schoolKeywords = school.name.toLowerCase().split(' ').filter(word => 
          !['school', 'of', 'and', 'the', 'for', 'in'].includes(word) && word.length > 2
        );
        
        schoolCurricula = schoolsViewData.filter(c => {
          if (!c.schoolName) return false;
          const curriculumSchoolLower = c.schoolName.toLowerCase();
          return schoolKeywords.some(keyword => curriculumSchoolLower.includes(keyword));
        });
      }
    }
    
    const statusStats = {
      approved: schoolCurricula.filter(c => c.status === 'approved').length,
      pending: schoolCurricula.filter(c => c.status === 'pending').length,
      draft: schoolCurricula.filter(c => c.status === 'draft').length,
      rejected: schoolCurricula.filter(c => c.status === 'rejected').length
    };
    
    // Get departments count from backend data
    const backendDepartments = getDepartmentsForSchool(schoolId);
    const curriculumDepartments = [...new Set(schoolCurricula.map(c => c.department))].filter(Boolean);
    const totalDepartments = Math.max(backendDepartments.length, curriculumDepartments.length);
    
    return {
      total: schoolCurricula.length,
      departments: totalDepartments,
      programs: getProgramsForSchoolEnhanced(schoolId, schoolCurricula).length,
      statusStats,
      matchedCurricula: schoolCurricula
    };
  };

  const getProgramsForSchoolEnhanced = (schoolId, schoolCurricula = null) => {
    if (!schoolCurricula) {
      const stats = getSchoolStatsEnhanced(schoolId);
      schoolCurricula = stats.matchedCurricula || [];
    }
    
    return programs.map(program => {
      const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
      const departments = [...new Set(programCurricula.map(c => c.department))].filter(Boolean);
      
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

  const loadProgramViewData = async (schoolId, programId, page = 0) => {
    try {
      console.log(`🔄 Loading program view data for school ${schoolId}, program ${programId}, page ${page}`);
      
      const mappedId = schoolMapping.get(schoolId) || schoolId;
      

      const result = await curriculumService.getCurriculumsBySchool(mappedId, 0, 1000);
      console.log(`📊 Loaded ${result.curriculums.length} total curricula for school ${mappedId}`);
      
      // Filter by program first
      let filteredCurricula = result.curriculums.filter(c => c.programId === programId);
      console.log(`📊 After program filter (${programId}): ${filteredCurricula.length} curricula`);
      
      if (selectedDepartment !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.department === selectedDepartment);
        console.log(`📊 After department filter (${selectedDepartment}): ${filteredCurricula.length} curricula`);
      }
      
      if (statusFilter !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.status === statusFilter);
        console.log(`📊 After status filter (${statusFilter}): ${filteredCurricula.length} curricula`);
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
      
      
      const startIndex = page * programPageSize;
      const endIndex = startIndex + programPageSize;
      const paginatedCurricula = filteredCurricula.slice(startIndex, endIndex);
      
      console.log(`📊 Final paginated curricula (page ${page}): ${paginatedCurricula.length} of ${filteredCurricula.length} total`);
      
      setProgramViewData(paginatedCurricula);
      
     
      setProgramTotalElements(filteredCurricula.length);
      setProgramTotalPages(Math.ceil(filteredCurricula.length / programPageSize));
      setProgramHasNext(endIndex < filteredCurricula.length);
      setProgramHasPrevious(page > 0);
      
    } catch (error) {
      console.error('❌ Error loading program view data:', error);
      setProgramViewData([]);
      setProgramTotalElements(0);
      setProgramTotalPages(0);
      setProgramHasNext(false);
      setProgramHasPrevious(false);
    }
  };

  const toggleSchool = async (schoolId) => {
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
      
      await loadSchoolDepartments(schoolId);
      
      setShowInteractionHint(false);
    }
    setExpandedSchools(newExpanded);
  };

  const handleProgramClick = async (schoolId, programId) => {
    console.log(`🖱️ Program clicked: school ${schoolId}, program ${programId}`);
    
    const school = findSchool ? findSchool(schoolId) : schools.find(s => s.id === schoolId);
    const program = programs.find(p => p.id === programId);
    
    console.log(`🏫 School found:`, school);
    console.log(`🎓 Program found:`, program);
    
    setShowingCurriculaFor({ schoolId, programId });
    setSelectedProgramView({ schoolId, programId });
    setProgramCurrentPage(0);
    
    setNavigationPath([
      { label: 'Schools', action: () => handleBackToSchools() },
      { label: school?.name || getSchoolName(schoolId) || 'Unknown School', action: () => handleBackToSchools() },
      { label: program?.name || 'Unknown Program', action: null }
    ]);
    
    console.log(`🔄 Loading program view data...`);
    await loadProgramViewData(schoolId, programId, 0);
  };

  const handleBackToSchools = async () => {
    setShowingCurriculaFor(null);
    setSelectedProgramView(null);
    setNavigationPath([]);
    setProgramCurrentPage(0);
    await loadSchoolsViewData();
  };

  const getCurriculaForProgram = (schoolId, programId) => {
    if (showingCurriculaFor) {
      return programViewData;
    }
    
    const stats = getSchoolStatsEnhanced(schoolId);
    const schoolCurricula = stats.matchedCurricula || [];
    
    return schoolCurricula.filter(c => c.programId === programId);
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

  // UPDATED: Render academic programs with their departments using original styling
  const renderSchoolAcademicPrograms = (schoolId) => {
    const stats = getSchoolStatsEnhanced(schoolId);
    const schoolCurricula = stats.matchedCurricula || [];
    const schoolPrograms = getProgramsForSchoolEnhanced(schoolId, schoolCurricula);
    const backendDepartments = getDepartmentsForSchool(schoolId);
    const isLoading = isDepartmentsLoading(schoolId);
    const error = getDepartmentError(schoolId);

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
              onClick={() => retryLoadDepartments(schoolId)}
            >
              <i className="fas fa-redo"></i>
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (schoolPrograms.length === 0) {
      return (
        <div className="admin-programs-container">
          <div className="admin-departments-empty">
            <i className="fas fa-graduation-cap"></i>
            <span>No academic programs with curricula found</span>
          </div>
        </div>
      );
    }

    
    const enhancedPrograms = schoolPrograms.map(program => {
      const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
      const curriculumDepartments = [...new Set(programCurricula.map(c => c.department))].filter(Boolean);
      
    
      const matchedBackendDepts = backendDepartments.filter(backendDept => 
        curriculumDepartments.some(currDept => 
          backendDept.name.toLowerCase() === currDept.toLowerCase()
        )
      );
      
  
      const allDepartments = [];
      
      
      matchedBackendDepts.forEach(dept => {
        const curriculumCount = programCurricula.filter(c => c.department === dept.name).length;
        allDepartments.push({
          ...dept,
          curriculumCount,
          source: 'backend'
        });
      });
      
  
      curriculumDepartments.forEach(deptName => {
        const alreadyAdded = allDepartments.some(d => d.name.toLowerCase() === deptName.toLowerCase());
        if (!alreadyAdded) {
          const curriculumCount = programCurricula.filter(c => c.department === deptName).length;
          allDepartments.push({
            id: `curriculum_${deptName.replace(/\s+/g, '_')}`,
            name: deptName,
            curriculumCount,
            source: 'curriculum'
          });
        }
      });

      return {
        ...program,
        enhancedDepartments: allDepartments
      };
    });

    return (
      <div className="admin-programs-container">
        <div className="admin-programs-grid">
          {enhancedPrograms.map(program => (
            <div key={program.id} className="admin-program-card">
              <div 
                className="admin-program-header"
                onClick={() => handleProgramClick(schoolId, program.id)}
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
                onClick={() => handleProgramClick(schoolId, program.id)}
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
              
              {/* Call-to-action footer */}
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, rgba(0, 191, 99, 0.1), rgba(0, 191, 99, 0.05))',
                borderRadius: '6px',
                border: '1px solid rgba(0, 191, 99, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleProgramClick(schoolId, program.id)}
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
          ))}
        </div>
      </div>
    );
  };

  // Program view rendering 
  if (showingCurriculaFor) {
    console.log(`🔍 Rendering program view for:`, showingCurriculaFor);
    console.log(`📊 Program view data:`, programViewData);
    
    const school = findSchool ? findSchool(showingCurriculaFor.schoolId) : schools.find(s => s.id === showingCurriculaFor.schoolId);
    const program = programs.find(p => p.id === showingCurriculaFor.programId);

    console.log(`🏫 School for program view:`, school);
    console.log(`🎓 Program for program view:`, program);

    if (isLoading || isLoadingSchoolsData) {
      return (
        <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
          {renderBreadcrumbs()}
          <div className="content-section">
            <LoadingSpinner message="Loading program curricula..." />
          </div>
        </div>
      );
    }

    if (!programViewData || programViewData.length === 0) {
      console.log(`⚠️ No program curricula found`);
      return (
        <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
          {renderBreadcrumbs()}
          <div className="curricula-table-program-header">
            <div className="curricula-table-program-info">
              <h3 className="curricula-table-program-title">
                {program?.name || 'Unknown Program'} - {school?.name || getSchoolName(showingCurriculaFor.schoolId) || 'Unknown School'}
              </h3>
              <p className="curricula-table-program-subtitle">
                No curricula found with current filters
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
          <div className="empty-state">
            <i className="fas fa-book-open"></i>
            <h3>No curricula found</h3>
            <p>No curricula available for this program with current filters.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, 0)}
            >
              <i className="fas fa-refresh"></i>
              Retry Loading
            </button>
          </div>
        </div>
      );
    }

    // Group curricula by department for the program view
    const groupedByDepartment = programViewData.reduce((acc, curriculum) => {
      const department = curriculum.department || 'Unknown Department';
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(curriculum);
      return acc;
    }, {});

    const departmentNames = Object.keys(groupedByDepartment).sort();
    console.log(`📊 Grouped by departments:`, departmentNames, groupedByDepartment);

    return (
      <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
        {renderBreadcrumbs()}
        <div className="curricula-table-program-header">
          <div className="curricula-table-program-info">
            <h3 className="curricula-table-program-title">
              {program?.name || 'Unknown Program'} - {school?.name || getSchoolName(showingCurriculaFor.schoolId) || 'Unknown School'}
            </h3>
            <p className="curricula-table-program-subtitle">
              {programViewData.length} curricula across {departmentNames.length} departments
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
                    <span className="admin-department-name">{departmentName} department</span>
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

        {programTotalPages > 1 && (
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
        )}
      </div>
    );
  }

  // Handle loading state
  if (isLoadingSchoolsData) {
    return (
      <div className="content-section">
        <LoadingSpinner message="Loading schools data..." />
      </div>
    );
  }

  // Handle empty schools state
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

  // Handle empty curricula data state
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
    const stats = getSchoolStatsEnhanced(school.id);
    return { ...school, stats };
  }).filter(school => school.stats.total > 0);

  // Handle empty filtered schools state
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

  // Main schools view rendering
  return (
    <div className="admin-schools-section">
      {/* Global interaction hint */}
      {showInteractionHint && schoolsWithData.length > 0 && (
        <div className="global-interaction-hint">
          <div className="global-interaction-hint-content">
            <div className="global-interaction-hint-text">
              <i className="fas fa-lightbulb"></i>
              <span>💡 Tip: Click on any school card below to view its academic programs</span>
            </div>
            <button 
              className="global-interaction-hint-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowInteractionHint(false);
              }}
              title="Dismiss hint"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

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
            <div key={school.id} className="admin-school-item">
              <div 
                className={`admin-school-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleSchool(school.id)}
              >
                <div className="admin-school-info">
                  <div className="admin-school-icon">
                    <i className={`fas fa-${school.icon || 'university'}`}></i>
                  </div>
                  <div className="admin-school-details">
                    <h3>{school.name}</h3>
                    {school.code && (
                      <span className="admin-school-code">{school.code}</span>
                    )}
                    <div className="admin-school-meta">
                      {school.stats.programs} Academic levels • {school.stats.departments} departments • {school.stats.total} curricula
                    </div>

                    {/* Interaction hint */}
                    <div className="admin-school-interaction-hint">
                      <i className="fas fa-mouse-pointer"></i>
                      <span>{isExpanded ? 'Click to collapse academic programs' : 'Click to view academic programs'}</span>
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

            
                <div className="admin-school-actions">
                  <div className="admin-school-stats">
                    <span className="admin-stat-badge">{school.stats.total}</span>
                  </div>
                  
                  <div className="admin-school-expand-area">
                    <div className="admin-expand-button">
                      <span className="admin-expand-text">
                        {isExpanded ? 'Hide' : 'View'}
                      </span>
                      <i className={`fas fa-chevron-down admin-expand-icon ${isExpanded ? 'expanded' : ''}`}></i>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="admin-school-expanded-content">
                 
                  {renderSchoolAcademicPrograms(school.id)}
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