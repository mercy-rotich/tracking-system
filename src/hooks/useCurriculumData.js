import { useState } from 'react';
import curriculumService from '../services/curriculumService';
import departmentService from '../services/departmentService';
import statisticsService from '../services/statisticsService'; 

export const useCurriculumData = () => {
  const [curricula, setCurricula] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs] = useState([
    { id: 'phd', name: "PhD Program", displayName: "PhD Program", icon: 'graduation-cap' },
    { id: 'bachelor', name: "Bachelor's Degree", displayName: "Bachelor's Degree", icon: 'user-graduate' },
    { id: 'masters', name: "Master's Degree", displayName: "Master's Degree", icon: 'user-tie' }
  ]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    underReview: 0,
    draft: 0,
    rejected: 0,
    inProgress: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [expiringCurriculums, setExpiringCurriculums] = useState([]);

  const loadSchoolsAndDepartments = async () => {
    try {
      console.log('🔄 Loading schools and departments...');
      
      // Load schools from curriculum service
      const schoolsData = await curriculumService.getAllSchoolsEnhanced();
      console.log('✅ Schools loaded:', schoolsData);
      setSchools(schoolsData);

      
      try {
        const departmentsData = await departmentService.getAllDepartmentsSimple();
        console.log('✅ Departments loaded from service:', departmentsData);
        setDepartments(departmentsData);
      } catch (departmentError) {
        console.warn('⚠️ Department service failed, falling back to curriculum service:', departmentError.message);
        
        const fallbackDepartments = await curriculumService.getDepartmentsFromCurriculums();
        console.log('✅ Departments loaded from fallback:', fallbackDepartments);
        setDepartments(fallbackDepartments);
      }
      
      return { schools: schoolsData, departments };
    } catch (error) {
      console.error('❌ Error loading schools/departments:', error);
      
      // Set empty arrays on error
      setSchools([]);
      setDepartments([]);
      throw error;
    }
  };

  
  const loadStatsOverview = async () => {
    try {
      console.log('🔄 Loading enhanced stats overview for curricula page...');
      
     
      const newStats = await statisticsService.getMetricsForCurriculaPage();
      
      setStats(newStats);
      console.log('✅ Enhanced curricula page stats loaded:', newStats);
      
      return newStats;
    } catch (error) {
      console.error('❌ Error loading enhanced stats overview:', error);
      
      // Fallback 
      try {
        console.warn('⚠️ Enhanced stats failed, using fallback method...');
        
       
        try {
          const statsResult = await curriculumService.getCurriculumStats();
          console.log('✅ Stats loaded from curriculum service endpoint:', statsResult.data);
          
          // Transform to expected format
          const transformedStats = {
            total: statsResult.data.total || 0,
            approved: statsResult.data.approved || 0,
            pending: statsResult.data.pending || 0,
            underReview: statsResult.data.underReview || 0,
            draft: statsResult.data.draft || 0,
            rejected: statsResult.data.rejected || 0,
            inProgress: (statsResult.data.pending || 0) + (statsResult.data.underReview || 0) + (statsResult.data.draft || 0)
          };
          
          setStats(transformedStats);
          return transformedStats;
        } catch (statsError) {
          console.warn('⚠️ Stats endpoint failed, falling back to curriculum list:', statsError.message);
          
          // Fallback to the old method
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
            underReview: statusCounts.underReview || statusCounts.under_review || 0,
            draft: statusCounts.draft || 0,
            rejected: statusCounts.rejected || 0
          };
          
          // Calculate inProgress
          finalStats.inProgress = finalStats.pending + finalStats.underReview + finalStats.draft;
          
          
          if (sampleSize < totalFromApi && sampleSize > 50) {
            const ratio = totalFromApi / sampleSize;
            finalStats = {
              total: totalFromApi,
              approved: Math.round((statusCounts.approved || 0) * ratio),
              pending: Math.round((statusCounts.pending || 0) * ratio),
              underReview: Math.round((statusCounts.underReview || statusCounts.under_review || 0) * ratio),
              draft: Math.round((statusCounts.draft || 0) * ratio),
              rejected: Math.round((statusCounts.rejected || 0) * ratio)
            };
            
            // Recalculate inProgress after scaling
            finalStats.inProgress = finalStats.pending + finalStats.underReview + finalStats.draft;
          }
          
          setStats(finalStats);
          console.log('✅ Stats loaded from fallback method:', finalStats);
          return finalStats;
        }
      } catch (fallbackError) {
        console.error('❌ All stats loading methods failed:', fallbackError);
        
        const defaultStats = { 
          total: 0, 
          approved: 0, 
          pending: 0, 
          underReview: 0,
          draft: 0, 
          rejected: 0, 
          inProgress: 0 
        };
        
        setStats(defaultStats);
        return defaultStats;
      }
    }
  };

  const loadExpiringCurriculums = async () => {
    try {
      console.log('🔄 Loading expiring curriculums...');
      const result = await curriculumService.getExpiringCurriculums();
      setExpiringCurriculums(result.data);
      console.log('✅ Expiring curriculums loaded:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Error loading expiring curriculums:', error);
      setExpiringCurriculums([]);
      return [];
    }
  };

  const loadCurriculaData = async ({
    currentPage,
    pageSize,
    searchTerm,
    selectedSchool,
    selectedProgram,
    selectedDepartment,
    statusFilter,
    sortBy
  }) => {
    setIsLoading(true);
    try {
      console.log(`🔄 Loading page ${currentPage + 1} of curricula...`);
      console.log('Filters:', { searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy });
      
      let result;
      
      // Apply filters based on search criteria
      if (searchTerm && searchTerm.length >= 2) {
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
        filteredCurricula = filteredCurricula.filter(curriculum => 
          curriculum.department === selectedDepartment
        );
      }
      
      if (statusFilter !== 'all') {
        filteredCurricula = filteredCurricula.filter(curriculum => 
          curriculum.status === statusFilter
        );
      }
      
      // Apply sorting
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
      
      console.log(`✅ Loaded page ${currentPage + 1}: ${filteredCurricula.length} curricula`);
      
      return {
        curricula: filteredCurricula,
        pagination: result.pagination
      };
      
    } catch (error) {
      console.error('❌ Error loading curricula:', error);
      setCurricula([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      console.log('🔄 Refreshing all data...');
      
     
      statisticsService.clearCache();
      
      await Promise.all([
        loadStatsOverview(),
        loadSchoolsAndDepartments(),
        loadExpiringCurriculums()
      ]);
      console.log('✅ Data refresh completed');
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      throw error;
    }
  };

 
  const refreshStatistics = async () => {
    try {
      await statisticsService.refreshStatistics();
      await loadStatsOverview();
    } catch (error) {
      console.error('Error refreshing statistics:', error);
    }
  };

  const toggleCurriculumStatus = async (curriculum) => {
    try {
      console.log('🔄 Toggling curriculum status:', curriculum.id);
      
      const curriculumData = {
        name: curriculum.title,
        code: curriculum.code,
        durationSemesters: curriculum.durationSemesters,
        schoolId: parseInt(curriculum.schoolId),
        departmentId: curriculum.departmentId,
        academicLevelId: curriculumService.mapProgramToAcademicLevel(curriculum.programId)
      };

      // Add optional dates
      if (curriculum.effectiveDate) {
        curriculumData.effectiveDate = curriculum.effectiveDate;
      }
      if (curriculum.expiryDate) {
        curriculumData.expiryDate = curriculum.expiryDate;
      }

      const result = await curriculumService.toggleCurriculumStatus(curriculum.id, curriculumData);
      console.log('✅ Curriculum status toggled successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error toggling curriculum status:', error);
      throw error;
    }
  };

  const putCurriculumUnderReview = async (curriculum) => {
    try {
      console.log('🔄 Putting curriculum under review:', curriculum.id);
      
     
      const curriculumData = {
        name: curriculum.title,
        code: curriculum.code,
        durationSemesters: curriculum.durationSemesters,
        schoolId: parseInt(curriculum.schoolId),
        departmentId: curriculum.departmentId,
        academicLevelId: curriculumService.mapProgramToAcademicLevel(curriculum.programId)
      };

      // Add optional dates
      if (curriculum.effectiveDate) {
        curriculumData.effectiveDate = curriculum.effectiveDate;
      }
      if (curriculum.expiryDate) {
        curriculumData.expiryDate = curriculum.expiryDate;
      }

      const result = await curriculumService.putCurriculumUnderReview(curriculum.id, curriculumData);
      console.log('✅ Curriculum put under review successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error putting curriculum under review:', error);
      throw error;
    }
  };

  const findSchool = (identifier) => {
    if (!identifier || !schools.length) return null;
    
    const strategies = [
      (id) => schools.find(s => s.id?.toString() === id?.toString()),
      (id) => schools.find(s => s.code?.toString() === id?.toString()),
      (id) => schools.find(s => s.actualId?.toString() === id?.toString()),
      (id) => schools.find(s => s.curriculumId?.toString() === id?.toString()),
      (id) => schools.find(s => s.name?.toLowerCase() === id?.toString().toLowerCase())
    ];
    
    for (const strategy of strategies) {
      const school = strategy(identifier);
      if (school) return school;
    }
    
    return null;
  };

  const getSchoolName = (schoolIdentifier) => {
    const school = findSchool(schoolIdentifier);
    return school ? school.name : 'Unknown School';
  };

  // Get department by ID
  const getDepartmentById = (departmentId) => {
    return departments.find(dept => dept.id?.toString() === departmentId?.toString());
  };

  // Get department name by ID
  const getDepartmentName = (departmentId) => {
    const department = getDepartmentById(departmentId);
    return department ? department.name : 'Unknown Department';
  };

  // Get departments for a specific school
  const getDepartmentsBySchoolId = (schoolId) => {
    return departments.filter(dept => dept.schoolId?.toString() === schoolId?.toString());
  };

 
  const getCurriculumStatsByStatus = () => {
    return {
      total: stats.total,
      approved: stats.approved,
      pending: stats.pending,
      underReview: stats.underReview,
      draft: stats.draft,
      rejected: stats.rejected,
      inProgress: stats.inProgress,
      
      // Calculate percentages
      approvedPercentage: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
      pendingPercentage: stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0,
      underReviewPercentage: stats.total > 0 ? Math.round((stats.underReview / stats.total) * 100) : 0,
      inProgressPercentage: stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0,
      
      
      breakdown: {
        pending: stats.pending,
        underReview: stats.underReview,
        draft: stats.draft
      }
    };
  };

  return {
    // State
    curricula,
    schools,
    departments,
    programs,
    stats,
    isLoading,
    expiringCurriculums,
    
    // Data loading functions
    loadCurriculaData,
    loadSchoolsAndDepartments,
    loadStatsOverview,
    loadExpiringCurriculums,
    refreshData,
    refreshStatistics,
    
    // New curriculum actions
    toggleCurriculumStatus,
    putCurriculumUnderReview,
    
    // Utility functions
    findSchool,
    getSchoolName,
    getDepartmentById,
    getDepartmentName,
    getDepartmentsBySchoolId,
    getCurriculumStatsByStatus
  };
};