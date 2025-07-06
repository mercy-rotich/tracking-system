
import { useState } from 'react';
import curriculumService from '../services/curriculumService';

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
    draft: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(false);

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
      
      let result;
      
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
    await Promise.all([
      loadStatsOverview(),
      loadSchoolsAndDepartments()
    ]);
  };

  return {
    curricula,
    schools,
    departments,
    programs,
    stats,
    isLoading,
    loadCurriculaData,
    loadSchoolsAndDepartments,
    loadStatsOverview,
    refreshData
  };
};