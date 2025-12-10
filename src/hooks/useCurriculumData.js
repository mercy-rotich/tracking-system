import { useState, useCallback } from 'react';
import curriculumService from '../services/curriculumService';
import departmentService from '../services/departmentService';
import statisticsService from '../services/statisticsService'; 

export const useCurriculumData = () => {
  const [curricula, setCurricula] = useState([]);
  const [allCurriculaCache, setAllCurriculaCache] = useState(null); 
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs] = useState([
    { id: 'phd', name: "PhD Program", displayName: "PhD Program", icon: 'graduation-cap' },
    { id: 'bachelor', name: "Bachelor's Degree", displayName: "Bachelor's Degree", icon: 'user-graduate' },
    { id: 'masters', name: "Master's Degree", displayName: "Master's Degree", icon: 'user-tie' }
  ]);
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0, underReview: 0, draft: 0, rejected: 0, inProgress: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [expiringCurriculums, setExpiringCurriculums] = useState([]);

  // --- HELPER: Cached Full Dataset ---
  const getFullDataset = useCallback(async (forceRefresh = false) => {
   
    if (!forceRefresh && allCurriculaCache && allCurriculaCache.length > 0) {
      return allCurriculaCache;
    }
    
   
    const result = await curriculumService.fetchAllCurriculums();
    const data = result.curriculums || [];
    setAllCurriculaCache(data);
    return data;
  }, [allCurriculaCache]);

  // --- LOAD SCHOOLS & DEPARTMENTS ---
  const loadSchoolsAndDepartments = async () => {
    try {
      // Parallel fetch for schools and departments
      const [schoolsData, departmentsData] = await Promise.all([
        curriculumService.getAllSchoolsEnhanced(),
        departmentService.getAllDepartmentsSimple().catch(() => curriculumService.getDepartmentsFromCurriculums())
      ]);
      
      setSchools(schoolsData);
      setDepartments(departmentsData);
      return { schools: schoolsData };
    } catch (error) {
      console.error('❌ Error loading schools/departments:', error);
      setSchools([]);
      setDepartments([]);
      throw error;
    }
  };

  // --- CALCULATE STATS ---
  const loadStatsOverview = async (forceRefresh = false) => {
    try {
      const allCurricula = await getFullDataset(forceRefresh);
      
      const statusCounts = allCurricula.reduce((acc, curr) => {
        const status = curr.status || 'draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const finalStats = {
        total: allCurricula.length,
        approved: statusCounts.approved || 0,
        pending: statusCounts.pending || 0,
        underReview: statusCounts.underReview || 0, 
        draft: statusCounts.draft || 0,
        rejected: statusCounts.rejected || 0
      };
      
      finalStats.inProgress = (finalStats.pending || 0) + (finalStats.underReview || 0) + (finalStats.draft || 0);
      setStats(finalStats);
      return finalStats;

    } catch (error) {
      console.error('❌ Error calculating stats:', error);
      return stats;
    }
  };

  const loadExpiringCurriculums = async () => {
    try {
      const result = await curriculumService.getExpiringCurriculums();
      setExpiringCurriculums(result.data);
      return result.data;
    } catch (error) {
      return [];
    }
  };

  // --- MAIN TABLE LOADER ---
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
      const allItems = await getFullDataset(true);
      
      let filtered = allItems;

      // Client-side filtering is extremely fast for < 5000 items
      if (searchTerm && searchTerm.trim()) {
        const lowerTerm = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(c => 
          (c.title && c.title.toLowerCase().includes(lowerTerm)) ||
          (c.code && c.code.toLowerCase().includes(lowerTerm))
        );
      }

      if (selectedSchool && selectedSchool !== 'all') {
        filtered = filtered.filter(c => c.schoolId?.toString() === selectedSchool.toString());
      }

      if (selectedDepartment && selectedDepartment !== 'all') {
        filtered = filtered.filter(c => c.department === selectedDepartment || c.departmentId?.toString() === selectedDepartment.toString());
      }

      if (selectedProgram && selectedProgram !== 'all') {
        const academicLevelMap = { bachelor: 1, masters: 2, phd: 3 };
        const levelId = academicLevelMap[selectedProgram.toLowerCase()];
        if (levelId) {
          filtered = filtered.filter(c => {
             if (c.academicLevelId === levelId) return true;
             const pName = (c.programName || '').toLowerCase();
             if (selectedProgram === 'phd' && (pName.includes('phd') || pName.includes('doc'))) return true;
             if (selectedProgram === 'masters' && pName.includes('master')) return true;
             if (selectedProgram === 'bachelor' && pName.includes('bachelor')) return true;
             return false;
          });
        }
      }

      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter(c => c.status === statusFilter);
      }

      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'newest': return new Date(b.createdDate || b.lastModified) - new Date(a.createdDate || a.lastModified);
          case 'oldest': return new Date(a.createdDate || a.lastModified) - new Date(b.createdDate || b.lastModified);
          case 'title': return (a.title || '').localeCompare(b.title || '');
          case 'department': return (a.department || '').localeCompare(b.department || '');
          default: return 0;
        }
      });

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / pageSize);
      const startIndex = currentPage * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalElements);
      const pageItems = filtered.slice(startIndex, endIndex);

      setCurricula(pageItems);
      
      return {
        curricula: pageItems,
        pagination: {
          totalElements,
          totalPages,
          currentPage,
          pageSize,
          hasNext: currentPage < totalPages - 1,
          hasPrevious: currentPage > 0
        }
      };
      
    } catch (error) {
      console.error('❌ Error processing curricula:', error);
      setCurricula([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      console.log('🔄 Refreshing admin data...');
      setAllCurriculaCache(null); 
      await Promise.all([
        loadStatsOverview(true),
        loadSchoolsAndDepartments(),
        loadExpiringCurriculums()
      ]);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    }
  };

  const refreshStatistics = async () => { await loadStatsOverview(true); };
  
  const toggleCurriculumStatus = async (curriculum) => {
      const result = await curriculumService.toggleCurriculumStatus(curriculum.id, curriculum);
      setAllCurriculaCache(null); 
      return result;
  };
  
  const putCurriculumUnderReview = async (curriculum) => {
      const result = await curriculumService.putCurriculumUnderReview(curriculum.id, curriculum);
      setAllCurriculaCache(null);
      return result;
  };

  const findSchool = (identifier) => {
    if (!identifier || !schools.length) return null;
    const strategies = [
      (id) => schools.find(s => s.id?.toString() === id?.toString()),
      (id) => schools.find(s => s.code?.toString() === id?.toString()),
      (id) => schools.find(s => s.name?.toLowerCase() === id?.toString().toLowerCase())
    ];
    for (const strategy of strategies) {
      const school = strategy(identifier);
      if (school) return school;
    }
    return null;
  };

  const getSchoolName = (id) => { const s = findSchool(id); return s ? s.name : 'Unknown School'; };
  const getDepartmentById = (id) => departments.find(d => d.id?.toString() === id?.toString());
  const getDepartmentsBySchoolId = (id) => departments.filter(d => d.schoolId?.toString() === id?.toString());
  
  const getCurriculumStatsByStatus = () => {
      return { ...stats, breakdown: { pending: stats.pending, draft: stats.draft, underReview: stats.underReview } }; 
  };

  return {
    curricula, schools, departments, programs, stats, isLoading, expiringCurriculums,
    loadCurriculaData, loadSchoolsAndDepartments, loadStatsOverview, loadExpiringCurriculums,
    refreshData, refreshStatistics, toggleCurriculumStatus, putCurriculumUnderReview,
    findSchool, getSchoolName, getDepartmentById, getDepartmentsBySchoolId, getCurriculumStatsByStatus
  };
};