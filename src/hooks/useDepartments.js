import { useState, useEffect, useCallback } from 'react';
import departmentService from '../services/departmentService';

export const useDepartments = (schoolId = null, options = {}) => {
  const {
    enableSearch = false,
    searchTerm = '',
    page = 0,
    size = 200, 
    sortBy = 'name',
    sortDir = 'asc',
    autoLoad = true
  } = options;

  const [departments, setDepartments] = useState([]);
  const [schools, setSchools] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: size,
    hasNext: false,
    hasPrevious: false
  });

  const [departmentCount, setDepartmentCount] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const loadDepartments = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const {
        currentPage = page,
        pageSize = size,
        search = searchTerm,
        sortField = sortBy,
        sortDirection = sortDir
      } = options;
      
      let data;
      
      if (schoolId && schoolId !== 'all' && schoolId !== '') {
        data = await departmentService.getDepartmentsBySchool(
          schoolId, 
          currentPage, 
          pageSize, 
          sortField, 
          sortDirection, 
          search
        );
        
        try {
          const count = await departmentService.getDepartmentCountBySchool(schoolId);
          setDepartmentCount(count);
        } catch (countError) {
         
        }
      } else {
        data = await departmentService.getAllDepartments(
          currentPage, 
          pageSize, 
          sortField, 
          sortDirection, 
          search
        );
        
        setDepartmentCount(null); 
      }
      
      setDepartments(data);

      
      const schoolsMap = new Map();
      data.forEach(dept => {
        if (!schoolsMap.has(dept.schoolId)) {
          schoolsMap.set(dept.schoolId, {
            id: dept.schoolId,
            name: dept.schoolName,
            departments: [],
            curriculumCount: 0
          });
        }
        const school = schoolsMap.get(dept.schoolId);
        school.departments.push(dept);
        school.curriculumCount += (dept.curriculumCount || 0);
      });
      setSchools(Array.from(schoolsMap.values()));
      
      const estimatedTotal = data.length >= pageSize ? data.length + 1 : data.length;
      setPagination({
        currentPage: currentPage,
        totalPages: Math.ceil(estimatedTotal / pageSize),
        totalElements: estimatedTotal,
        pageSize: pageSize,
        hasNext: data.length >= pageSize,
        hasPrevious: currentPage > 0
      });
      
    } catch (err) {
      setError(err.message);
      if (departments.length === 0) {
        setDepartments([]);
        setSchools([]);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, page, size, searchTerm, sortBy, sortDir]);

  useEffect(() => {
    if (autoLoad) {
      loadDepartments();
    }
  }, [loadDepartments, autoLoad]);

  const searchDepartments = useCallback(async (term, searchOptions = {}) => {
    if (!term || term.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      
      const results = await departmentService.searchDepartmentsAdvanced({
        searchTerm: term,
        schoolId: schoolId,
        page: searchOptions.page || 0,
        size: searchOptions.size || 50,
        sortBy: searchOptions.sortBy || 'name',
        sortDir: searchOptions.sortDir || 'asc'
      });
      
      setSearchResults(results);
      return results;
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
      throw err;
    } finally {
      setIsSearching(false);
    }
  }, [schoolId]);

  const loadPage = useCallback(async (pageNumber) => {
    await loadDepartments({ currentPage: pageNumber });
  }, [loadDepartments]);

  const changePageSize = useCallback(async (newSize) => {
    await loadDepartments({ pageSize: newSize, currentPage: 0 });
  }, [loadDepartments]);

  const refetch = useCallback(() => {
    loadDepartments();
  }, [loadDepartments]);

  const performSearch = useCallback(async (term) => {
    await loadDepartments({ search: term, currentPage: 0 });
  }, [loadDepartments]);

  const clearSearch = useCallback(async () => {
    await loadDepartments({ search: '', currentPage: 0 });
    setSearchResults([]);
  }, [loadDepartments]);

  const createDepartment = useCallback(async (departmentData) => {
    try {
      const newDepartment = await departmentService.createDepartment(departmentData);
      setDepartments(prev => [...prev, newDepartment]);
      return newDepartment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateDepartment = useCallback(async (departmentId, departmentData) => {
    try {
      const updatedDepartment = await departmentService.updateDepartment(departmentId, departmentData);
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId ? updatedDepartment : dept
      ));
      return updatedDepartment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteDepartment = useCallback(async (departmentId) => {
    try {
      await departmentService.deleteDepartment(departmentId);
      setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getDepartmentById = useCallback(async (departmentId) => {
    try {
      const department = await departmentService.getDepartmentById(departmentId);
      return department;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getDepartmentByName = useCallback((name) => {
    return departments.find(dept => dept.name.toLowerCase() === name.toLowerCase());
  }, [departments]);

  const getDepartmentsBySchoolId = useCallback((schoolId) => {
    return departments.filter(dept => dept.schoolId === schoolId);
  }, [departments]);

  const searchDepartmentsLocal = useCallback((searchTerm) => {
    if (!searchTerm) return departments;
    const term = searchTerm.toLowerCase();
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(term) ||
      dept.code.toLowerCase().includes(term) ||
      (dept.schoolName && dept.schoolName.toLowerCase().includes(term))
    );
  }, [departments]);

  const getDepartmentStatistics = useCallback(() => {
    return {
      total: departments.length,
      bySchool: departments.reduce((acc, dept) => {
        const schoolId = dept.schoolId;
        acc[schoolId] = (acc[schoolId] || 0) + 1;
        return acc;
      }, {}),
      withCurriculums: departments.filter(d => (d.curriculumCount || 0) > 0).length,
      totalCurriculums: departments.reduce((sum, d) => sum + (d.curriculumCount || 0), 0)
    };
  }, [departments]);

  const getDepartmentNames = useCallback(() => {
    return [...new Set(departments.map(d => d.name))].sort();
  }, [departments]);

  const getDepartmentsWithCurriculums = useCallback(() => {
    return departments.filter(d => (d.curriculumCount || 0) > 0);
  }, [departments]);

  return {
    departments,
    schools, 
    searchResults: enableSearch ? searchResults : [],
    loading,
    error,
    pagination,
    departmentCount,
    isSearching,
    refetch,
    loadPage,
    changePageSize,
    searchDepartments,
    performSearch,
    clearSearch,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    clearError,
    getDepartmentByName,
    getDepartmentsBySchoolId,
    searchDepartmentsLocal, 
    getDepartmentStatistics,
    getDepartmentNames,
    getDepartmentsWithCurriculums,
    departmentCountVal: departments.length,
    hasDepartments: departments.length > 0,
    isEmpty: departments.length === 0 && !loading,
    hasSearchResults: searchResults.length > 0,
    canGoNext: pagination.hasNext,
    canGoPrevious: pagination.hasPrevious,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalElements: pagination.totalElements
  };
};