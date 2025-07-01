import React, { useState, useEffect } from 'react';
import './AdminCurriculaPage.css';
import NotificationBanner from '../../../components/Admin/AdminAllCurricula/NotificationBanner';
import PageHeader from '../../../components/Admin/AdminAllCurricula/PageHeader';
import StatsGrid from '../../../components/Admin/AdminAllCurricula/StatusGrid';
import FiltersSection from '../../../components/Admin/AdminAllCurricula/FilterSection';
import CurriculumModal from '../../../components/Admin/AdminAllCurricula/CurriculumModal';
import DeleteConfirmationModal from '../../../components/Admin/AdminAllCurricula/DeleteConfirmationModal';
import { getStatusBadge } from '../../../components/Admin/AdminAllCurricula/BadgeComponents';

import curriculumService from '../../../services/curriculumService';

const AdminCurriculaPage = () => {
  const [curricula, setCurricula] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs] = useState([
    { id: 'phd', name: "PhD Program", displayName: "PhD Program", icon: 'graduation-cap' },
    { id: 'bachelor', name: "Bachelor's Degree", displayName: "Bachelor's Degree", icon: 'user-graduate' },
    { id: 'masters', name: "Master's Degree", displayName: "Master's Degree", icon: 'user-tie' }
  ]);
  
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
 
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [viewMode, setViewMode] = useState('schools'); 
  
  // Pagination states for table view
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Schools view states and pagination
  const [expandedSchools, setExpandedSchools] = useState(new Set());
  const [selectedProgramView, setSelectedProgramView] = useState(null);
  const [showingCurriculaFor, setShowingCurriculaFor] = useState(null);
  const [navigationPath, setNavigationPath] = useState([]);
  const [schoolsViewData, setSchoolsViewData] = useState([]);
  const [programViewData, setProgramViewData] = useState([]);
  const [programCurrentPage, setProgramCurrentPage] = useState(0);
  const [programTotalPages, setProgramTotalPages] = useState(0);
  const [programHasNext, setProgramHasNext] = useState(false);
  const [programHasPrevious, setProgramHasPrevious] = useState(false);
  const [programTotalElements, setProgramTotalElements] = useState(0);
  const [isLoadingSchoolsData, setIsLoadingSchoolsData] = useState(false);
  
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    draft: 0,
    rejected: 0
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 Initializing AdminCurriculaPage...');
        
        
        await loadSchoolsAndDepartments();
        await loadStatsOverview();
        
        
        setIsInitialized(true);
        
        console.log('✅ AdminCurriculaPage initialized');
      } catch (error) {
        console.error('❌ Error initializing AdminCurriculaPage:', error);
        showNotification('Failed to initialize page data', 'error');
      }
    };
    
    initializeData();
  }, []);

  
  useEffect(() => {
    if (viewMode === 'table' && isInitialized) {
      console.log('🔄 Table view useEffect triggered');
      loadCurriculaData();
    }
  }, [currentPage, pageSize, searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy, viewMode, isInitialized]);

  
  useEffect(() => {
    console.log('🔄 Schools view useEffect triggered:', { 
      viewMode, 
      isInitialized,
      searchTerm, 
      selectedSchool, 
      selectedProgram, 
      selectedDepartment, 
      statusFilter, 
      sortBy 
    });
    
    if (viewMode === 'schools' && isInitialized) {
      const loadData = async () => {
        try {
          await loadSchoolsViewData();
        } catch (error) {
          console.error('❌ Error in schools view useEffect:', error);
          showNotification('Failed to load schools view data', 'error');
        }
      };
      
      loadData();
    }
  }, [viewMode, searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy, isInitialized]);

  const loadSchoolsAndDepartments = async () => {
    try {
      console.log('🔄 Loading schools and departments...');
      const schoolsData = await curriculumService.getSchoolsFromCurriculums();
      const departmentsData = await curriculumService.getDepartmentsFromCurriculums();
      
      console.log('✅ Schools loaded:', schoolsData);
      console.log('✅ Departments loaded:', departmentsData);
      
      setSchools(schoolsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('❌ Error loading schools/departments:', error);
      throw error; 
    }
  };

  const loadStatsOverview = async () => {
    try {
     
      const result = await curriculumService.getAllCurriculums(0, 200);
      const totalFromApi = result.pagination?.totalElements || result.curriculums.length;
      
     
      const statusCounts = result.curriculums.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      
      
      const sampleSize = result.curriculums.length;
      let finalStats = {
        total: totalFromApi,
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        draft: statusCounts.draft || 0,
        rejected: statusCounts.rejected || 0
      };
      
      if (sampleSize < totalFromApi && sampleSize > 50) {
        const ratio = totalFromApi / sampleSize;
        finalStats = {
          total: totalFromApi,
          approved: Math.round((statusCounts.approved || 0) * ratio),
          pending: Math.round((statusCounts.pending || 0) * ratio),
          draft: Math.round((statusCounts.draft || 0) * ratio),
          rejected: Math.round((statusCounts.rejected || 0) * ratio)
        };
      }
      
      setStats(finalStats);
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    }
  };

  
  const loadCurriculaData = async () => {
    setIsLoading(true);
    try {
      console.log(`🔄 Loading page ${currentPage + 1} of curricula...`);
      
      let result;
      
      
      if (searchTerm && searchTerm.length >= 2) {
        setIsSearching(true);
        result = await curriculumService.searchByName(searchTerm, currentPage, pageSize);
      } else if (selectedSchool !== 'all') {
        result = await curriculumService.getCurriculumsBySchool(selectedSchool, currentPage, pageSize);
      } else if (selectedProgram !== 'all') {
        
        const academicLevelMap = { bachelor: 1, masters: 2, phd: 3 };
        const academicLevelId = academicLevelMap[selectedProgram];
        if (academicLevelId) {
          result = await curriculumService.getCurriculumsByAcademicLevel(academicLevelId, currentPage, pageSize);
        } else {
          result = await curriculumService.getAllCurriculums(currentPage, pageSize);
        }
      } else {
        result = await curriculumService.getAllCurriculums(currentPage, pageSize);
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
      
      setCurricula(filteredCurricula);
      
      
      if (result.pagination) {
        setTotalElements(result.pagination.totalElements || 0);
        setTotalPages(result.pagination.totalPages || 0);
        setHasNext(result.pagination.hasNext || false);
        setHasPrevious(result.pagination.hasPrevious || false);
      }
      
      console.log(`✅ Loaded page ${currentPage + 1}: ${filteredCurricula.length} curricula`);
      
    } catch (error) {
      console.error('❌ Error loading curricula:', error);
      showNotification(`Failed to load curricula: ${error.message}`, 'error');
      setCurricula([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const loadSchoolsViewData = async () => {
    setIsLoadingSchoolsData(true);
    try {
      console.log('🔄 Loading data for schools view...');
      console.log('Schools available:', schools.length);
      console.log('Current filters:', { searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy });
      
      let result;
      
      if (searchTerm && searchTerm.length >= 2) {
        console.log(' Searching by name:', searchTerm);
        result = await curriculumService.searchByName(searchTerm, 0, 500);
      } else if (selectedSchool !== 'all') {
        console.log(' Filtering by school:', selectedSchool);
        result = await curriculumService.getCurriculumsBySchool(selectedSchool, 0, 500);
      } else if (selectedProgram !== 'all') {
        console.log(' Filtering by program:', selectedProgram);
        const academicLevelMap = { bachelor: 1, masters: 2, phd: 3 };
        const academicLevelId = academicLevelMap[selectedProgram];
        if (academicLevelId) {
          result = await curriculumService.getCurriculumsByAcademicLevel(academicLevelId, 0, 500);
        } else {
          result = await curriculumService.getAllCurriculums(0, 500);
        }
      } else {
        console.log(' Loading all curricula');
        result = await curriculumService.getAllCurriculums(0, 500);
      }
      
      let filteredCurricula = result.curriculums;
      console.log(' Raw curricula loaded:', filteredCurricula.length);
     
      if (selectedDepartment !== 'all') {
        const beforeFilter = filteredCurricula.length;
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.department === selectedDepartment);
        console.log(` Department filter applied: ${beforeFilter} → ${filteredCurricula.length}`);
      }
      
      if (statusFilter !== 'all') {
        const beforeFilter = filteredCurricula.length;
        filteredCurricula = filteredCurricula.filter(curriculum => curriculum.status === statusFilter);
        console.log(` Status filter applied: ${beforeFilter} → ${filteredCurricula.length}`);
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
      
      
      console.log('✅ Loaded curricula for schools view:', filteredCurricula.length);
      if (filteredCurricula.length > 0) {
        console.log(' Sample curriculum data:', filteredCurricula[0]);
        const uniqueSchoolIds = [...new Set(filteredCurricula.map(c => c.schoolId))];
        console.log(' Unique schoolIds in curricula:', uniqueSchoolIds);
        console.log(' Available schools:', schools.map(s => ({ id: s.id, name: s.name, type: typeof s.id })));
      }
      
    } catch (error) {
      console.error('❌ Error loading schools view data:', error);
      showNotification(`Failed to load schools data: ${error.message}`, 'error');
      setSchoolsViewData([]);
    } finally {
      setIsLoadingSchoolsData(false);
    }
  };

  
  const loadProgramViewData = async (schoolId, programId, page = 0) => {
    setIsLoading(true);
    try {
      console.log(`🔄 Loading curricula for school ${schoolId}, program ${programId}, page ${page + 1}...`);
      
      
      const result = await curriculumService.getCurriculumsBySchool(schoolId, page, pageSize);
      
      
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
      setProgramTotalPages(Math.ceil(estimatedProgramTotal / pageSize));
      setProgramHasNext(page < Math.ceil(estimatedProgramTotal / pageSize) - 1);
      setProgramHasPrevious(page > 0);
      
      console.log(`✅ Loaded ${filteredCurricula.length} curricula for program view`);
      
    } catch (error) {
      console.error('❌ Error loading program view data:', error);
      showNotification(`Failed to load program data: ${error.message}`, 'error');
      setProgramViewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage !== 0 && viewMode === 'table') {
      setCurrentPage(0);
    }
  }, [searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter]);

  useEffect(() => {
    if (selectedSchool !== 'all') {
      setSelectedDepartment('all');
    }
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedProgram !== 'all') {
      setSelectedDepartment('all');
    }
  }, [selectedProgram]);

  const refreshData = async () => {
    if (viewMode === 'table') {
      await loadCurriculaData();
    } else {
      await loadSchoolsViewData();
    }
    await loadStatsOverview();
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id?.toString() === schoolId?.toString());
    return school ? school.name : 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  const getAvailableDepartments = () => {
    return departments.map(dept => dept.name).sort();
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleViewModeChange = async (newMode) => {
    console.log('🔄 Changing view mode to:', newMode);
    
    setViewMode(newMode);
    
    if (newMode === 'table') {
      setShowingCurriculaFor(null);
      setSelectedProgramView(null);
      setNavigationPath([]);
      setExpandedSchools(new Set());
     
    } else if (newMode === 'schools') {
      try {
        
        if (!schools || schools.length === 0) {
          console.log('🔄 Schools data not loaded, loading now...');
          await loadSchoolsAndDepartments();
        }
        
      } catch (error) {
        console.error('❌ Error in handleViewModeChange:', error);
        showNotification('Failed to load schools view data', 'error');
      }
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

  
  const getCurriculaForProgram = (schoolId, programId) => {
    if (showingCurriculaFor) {
      return programViewData; // Use paginated API data
    }
    return schoolsViewData.filter(c => c.schoolId?.toString() === schoolId?.toString() && c.programId === programId);
  };

  
  const getProgramsForSchool = (schoolId) => {
    console.log(` Getting programs for school ${schoolId}...`);
    
    
    const schoolCurricula = schoolsViewData.filter(c => c.schoolId?.toString() === schoolId?.toString());
    console.log(`Found ${schoolCurricula.length} curricula for school ${schoolId}`);
    
    return programs.map(program => {
      const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
      const departments = [...new Set(programCurricula.map(c => c.department))];
      
      const statusStats = {
        approved: programCurricula.filter(c => c.status === 'approved').length,
        pending: programCurricula.filter(c => c.status === 'pending').length,
        draft: programCurricula.filter(c => c.status === 'draft').length,
        rejected: programCurricula.filter(c => c.status === 'rejected').length
      };
      
      console.log(` Program ${program.name}: ${programCurricula.length} curricula`);
      
      return {
        ...program,
        count: programCurricula.length,
        departments: departments.length,
        statusStats
      };
    }).filter(program => program.count > 0);
  };

  
  const getSchoolStats = (schoolId) => {
    console.log(` Getting stats for school ${schoolId} (type: ${typeof schoolId})`);
    
    
    const schoolCurricula = schoolsViewData.filter(c => {
      const matches = c.schoolId?.toString() === schoolId?.toString();
      if (!matches && c.schoolId !== undefined) {
        console.log(`❌ No match: curriculum schoolId ${c.schoolId} (${typeof c.schoolId}) vs school ${schoolId} (${typeof schoolId})`);
      }
      return matches;
    });
    
    console.log(` Found ${schoolCurricula.length} curricula for school ${schoolId}`);
    
    const departments = [...new Set(schoolCurricula.map(c => c.department))];
    
    const statusStats = {
      approved: schoolCurricula.filter(c => c.status === 'approved').length,
      pending: schoolCurricula.filter(c => c.status === 'pending').length,
      draft: schoolCurricula.filter(c => c.status === 'draft').length,
      rejected: schoolCurricula.filter(c => c.status === 'rejected').length
    };
    
    const stats = {
      total: schoolCurricula.length,
      departments: departments.length,
      programs: getProgramsForSchool(schoolId).length,
      statusStats
    };
    
    console.log(` School ${schoolId} stats:`, stats);
    return stats;
  };

  
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

  // Table view pagination functions
  const goToPage = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };


  const handleEdit = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowEditModal(true);
  };

  const handleDelete = (curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowDeleteModal(true);
  };

  const handleApprove = async (curriculum) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (viewMode === 'table') {
        await loadCurriculaData();
      } else {
        if (showingCurriculaFor) {
          await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, programCurrentPage);
        } else {
          await loadSchoolsViewData();
        }
      }
      await loadStatsOverview();
      
      showNotification(`"${curriculum.title}" has been approved successfully!`, 'success');
    } catch (error) {
      showNotification('Failed to approve curriculum. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (curriculum) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (viewMode === 'table') {
        await loadCurriculaData();
      } else {
        if (showingCurriculaFor) {
          await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, programCurrentPage);
        } else {
          await loadSchoolsViewData();
        }
      }
      await loadStatsOverview();
      
      showNotification(`"${curriculum.title}" has been rejected.`, 'success');
    } catch (error) {
      showNotification('Failed to reject curriculum. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurriculum = async (formData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (viewMode === 'table') {
        await loadCurriculaData();
      } else {
        if (showingCurriculaFor) {
          await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, programCurrentPage);
        } else {
          await loadSchoolsViewData();
        }
      }
      await loadStatsOverview();
      
      const action = showAddModal ? 'added' : 'updated';
      showNotification(`Curriculum ${action} successfully!`, 'success');
    } catch (error) {
      showNotification(`Failed to save curriculum: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedCurriculum(null);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (viewMode === 'table') {
        await loadCurriculaData();
      } else {
        if (showingCurriculaFor) {
          await loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, programCurrentPage);
        } else {
          await loadSchoolsViewData();
        }
      }
      await loadStatsOverview();
      
      showNotification(`"${selectedCurriculum.title}" has been deleted.`, 'success');
    } catch (error) {
      showNotification(`Failed to delete curriculum: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setSelectedCurriculum(null);
    }
  };

  
  const renderCurriculumActions = (curriculum) => {
    if (curriculum.status === 'pending') {
      return (
        <div className="curricula-table-actions">
          <button 
            className="curricula-table-action-btn curricula-table-approve"
            onClick={() => handleApprove(curriculum)}
            disabled={isLoading}
            title="Approve"
          >
            <i className="fas fa-check"></i>
          </button>
          <button 
            className="curricula-table-action-btn curricula-table-reject"
            onClick={() => handleReject(curriculum)}
            disabled={isLoading}
            title="Reject"
          >
            <i className="fas fa-times"></i>
          </button>
          <button 
            className="curricula-table-action-btn curricula-table-view"
            onClick={() => handleEdit(curriculum)}
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
          onClick={() => handleEdit(curriculum)}
          disabled={isLoading}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
          
        </button>
        <button 
          className="curricula-table-action-btn curricula-table-delete"
          onClick={() => handleDelete(curriculum)}
          disabled={isLoading}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    );
  };

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

  
  const renderSchoolsOverview = () => {
    console.log('🎨 Rendering schools overview...');
    console.log('State check:', {
      isLoadingSchoolsData,
      schoolsLength: schools?.length || 0,
      schoolsViewDataLength: schoolsViewData?.length || 0,
      isInitialized
    });

   
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

 
    if (!isInitialized) {
      return (
        <div className="content-section">
          <div className="curricula-loading-spinner">
            <div className="spinner"></div>
            <p>Initializing...</p>
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
            onClick={loadSchoolsAndDepartments}
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
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.9em' }}>
            <strong>Debug info:</strong><br/>
            Schools loaded: {schools.length}<br/>
            Curricula loaded: {schoolsViewData.length}<br/>
            Initialized: {isInitialized ? 'Yes' : 'No'}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={loadSchoolsViewData}
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
      console.log(` School ${school.name} (${school.id}) stats:`, stats);
      return { ...school, stats };
    }).filter(school => school.stats.total > 0);

    console.log(`📊 Schools with data: ${schoolsWithData.length} out of ${schools.length}`);

    if (schoolsWithData.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-university"></i>
          <h3>No schools found</h3>
          <p>No schools have curricula matching your current filters.</p>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.9em' }}>
            <strong>Debug info:</strong><br/>
            Total schools: {schools.length}<br/>
            Total curricula: {schoolsViewData.length}<br/>
            Schools with curricula: {schoolsWithData.length}<br/>
            Sample curriculum schoolIds: {schoolsViewData.slice(0, 3).map(c => c.schoolId).join(', ')}<br/>
            School IDs: {schools.slice(0, 3).map(s => s.id).join(', ')}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={loadSchoolsViewData}
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
                      <h3>School of {school.name}</h3>
                      <div className="admin-school-meta">
                        {school.stats.programs} programs • {school.stats.departments} departments • {school.stats.total} curricula
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

  
  const renderProgramCurriculaTable = () => {
    if (!showingCurriculaFor) return null;

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

    const groupedByDepartment = programCurricula.reduce((acc, curriculum) => {
      const department = curriculum.department;
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(curriculum);
      return acc;
    }, {});

    const departmentNames = Object.keys(groupedByDepartment).sort();
    const totalDepartments = departmentNames.length;

    
    const renderProgramPagination = () => {
      if (programTotalPages <= 1) return null;

      const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(0, programCurrentPage - Math.floor(maxVisible / 2));
        let end = Math.min(programTotalPages - 1, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
          start = Math.max(0, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        return pages;
      };

      return (
        <div className="pagination-container">
          <div className="pagination-info">
            <span>
              Showing {programCurrentPage * pageSize + 1} to {Math.min((programCurrentPage + 1) * pageSize, programTotalElements)} of {programTotalElements} curricula
            </span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              onClick={goToPreviousProgramPage}
              disabled={!programHasPrevious || isLoading}
            >
              <i className="fas fa-chevron-left"></i>
              Previous
            </button>
            
            <div className="pagination-pages">
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  className={`pagination-page ${page === programCurrentPage ? 'active' : ''}`}
                  onClick={() => goToProgramPage(page)}
                  disabled={isLoading}
                >
                  {page + 1}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn" 
              onClick={goToNextProgramPage}
              disabled={!programHasNext || isLoading}
            >
              Next
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="pagination-size">
            <label>Items per page:</label>
            <select 
              value={pageSize} 
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setPageSize(newSize);
                setProgramCurrentPage(0);
                if (showingCurriculaFor) {
                  loadProgramViewData(showingCurriculaFor.schoolId, showingCurriculaFor.programId, 0);
                }
              }}
              disabled={isLoading}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      );
    };

    return (
      <div className="curricula-table-container" style={{ marginTop: '2rem' }}>
        {renderBreadcrumbs()}
        <div className="curricula-table-program-header">
          <div className="curricula-table-program-info">
            <h3 className="curricula-table-program-title">
              {program?.name} - {school?.name}
            </h3>
            <p className="curricula-table-program-subtitle">
              {programCurricula.length} curricula across {totalDepartments} departments (Page {programCurrentPage + 1} of {programTotalPages})
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
            <button className="btn btn-sm btn-outline">
              <i className="fas fa-download"></i>
              Export
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

        {/* Program Pagination */}
        {renderProgramPagination()}

        <div className="curricula-table-footer">
          <p className="curricula-table-footer-text">
            Showing {programCurricula.length} curricula across {totalDepartments} departments for {program?.name} in {school?.name}
          </p>
        </div>
      </div>
    );
  };

  // Table view pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(totalPages - 1, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(0, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    };

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span>
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} curricula
          </span>
        </div>
        
        <div className="pagination-controls">
          <button 
            className="pagination-btn" 
            onClick={goToPreviousPage}
            disabled={!hasPrevious || isLoading}
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div className="pagination-pages">
            {getPageNumbers().map(page => (
              <button
                key={page}
                className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(page)}
                disabled={isLoading}
              >
                {page + 1}
              </button>
            ))}
          </div>
          
          <button 
            className="pagination-btn" 
            onClick={goToNextPage}
            disabled={!hasNext || isLoading}
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div className="pagination-size">
          <label>Items per page:</label>
          <select 
            value={pageSize} 
            onChange={(e) => changePageSize(parseInt(e.target.value))}
            disabled={isLoading}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    );
  };

  const renderCurriculaTable = () => {
    const enrichedCurricula = curricula.map(curriculum => ({
      ...curriculum,
      schoolName: curriculum.schoolName || getSchoolName(curriculum.schoolId),
      programName: curriculum.programName || getProgramName(curriculum.programId)
    }));

    if (isLoading) {
      return (
        <div className="content-section">
          <div className="curricula-loading-spinner">
            <div className="spinner"></div>
            <p>Loading page {currentPage + 1} of curricula...</p>
          </div>
        </div>
      );
    }

    if (enrichedCurricula.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-book-open"></i>
          <h3>No curricula found</h3>
          <p>Try adjusting your search criteria or filters</p>
          <button 
            className="btn btn-primary" 
            onClick={refreshData}
            disabled={isLoading}
          >
            <i className="fas fa-refresh"></i>
            Refresh Data
          </button>
        </div>
      );
    }

    return (
      <div className="curricula-table-container">
        <div className="curricula-table-wrapper">
          <table className="curricula-table">
            <thead className="curricula-table-header">
              <tr>
                <th className="curricula-table-th curricula-table-th-title">Curriculum Title</th>
                <th className="curricula-table-th curricula-table-th-school">School</th>
                <th className="curricula-table-th curricula-table-th-department">Department</th>
                <th className="curricula-table-th curricula-table-th-status">Status</th>
                <th className="curricula-table-th curricula-table-th-updated">Last Updated</th>
                <th className="curricula-table-th curricula-table-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody className="curricula-table-body">
              {enrichedCurricula.map((curriculum) => (
                <tr key={curriculum.id} className="curricula-table-row">
                  <td className="curricula-table-td curricula-table-td-title">
                    <div className="curricula-table-title-content">
                      <span className="curricula-table-title-text">{curriculum.title}</span>
                      <span className="curricula-table-title-id">{curriculum.code || curriculum.id}</span>
                    </div>
                  </td>
                  <td className="curricula-table-td curricula-table-td-school">
                    {curriculum.schoolName}
                  </td>
                  <td className="curricula-table-td curricula-table-td-department">
                    {curriculum.department}
                  </td>
                  <td className="curricula-table-td curricula-table-td-status">
                    {getStatusBadge(curriculum.status)}
                  </td>
                  <td className="curricula-table-td curricula-table-td-updated">
                    <div className="curricula-table-date-content">
                      <span className="curricula-table-date-main">{formatDate(curriculum.lastModified)}</span>
                      <span className="curricula-table-date-relative">{getTimeSince(curriculum.lastModified)}</span>
                    </div>
                  </td>
                  <td className="curricula-table-td curricula-table-td-actions">
                    {renderCurriculumActions(curriculum)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        
        {renderPagination()}
      </div>
    );
  };

 
  if (!isInitialized) {
    return (
      <div className='curricula-main-page'>
        <div className="curricula-page">
          <div className="content-section">
            <div className="curricula-loading-spinner">
              <div className="spinner"></div>
              <p>Initializing admin page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='curricula-main-page'>
      <div className="curricula-page">
        <NotificationBanner 
          notification={notification}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />

        <PageHeader onAddNew={() => setShowAddModal(true)} />

        <StatsGrid stats={stats} />

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <div className="view-toggle-buttons">
            <button 
              className={`view-toggle-btn ${viewMode === 'schools' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('schools')}
            >
              <i className="fas fa-sitemap"></i>
              Schools View
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('table')}
            >
              <i className="fas fa-table"></i>
              All Curricula
            </button>
          </div>
        </div>

       
        <FiltersSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          viewMode={viewMode}
          setViewMode={() => {}} 
          isSearching={isSearching}
        />

        {viewMode === 'table' && (
          <div className="advanced-filters-section">
            <div className="advanced-filters-content">
              <div className="filter-group">
                <label className="filter-label">School</label>
                <select 
                  className="filter-select"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                >
                  <option value="all">All Schools</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Program</label>
                <select 
                  className="filter-select"
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                >
                  <option value="all">All Programs</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Department</label>
                <select 
                  className="filter-select"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {getAvailableDepartments().map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select 
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="department">Department A-Z</option>
                </select>
              </div>
            </div>
          </div>
        )}

       
        {viewMode === 'table' ? (
          renderCurriculaTable()
        ) : (
          showingCurriculaFor ? (
            renderProgramCurriculaTable()
          ) : (
            renderSchoolsOverview()
          )
        )}

        {/* Modals */}
        {(showAddModal || showEditModal) && (
          <CurriculumModal
            isOpen={showAddModal || showEditModal}
            isEdit={showEditModal}
            curriculum={selectedCurriculum}
            schools={schools}
            programs={programs}
            onSave={handleSaveCurriculum}
            onClose={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedCurriculum(null);
            }}
          />
        )}

        {showDeleteModal && selectedCurriculum && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            curriculum={selectedCurriculum}
            onConfirm={handleDeleteConfirm}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCurriculum(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCurriculaPage;