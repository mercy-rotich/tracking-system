import { useState } from 'react';

export const useDepartmentManagement = (departmentService) => {
  const [schoolDepartments, setSchoolDepartments] = useState(new Map());
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(new Set());
  const [departmentErrors, setDepartmentErrors] = useState(new Map());

  const loadSchoolDepartments = async (schoolId) => {
    if (schoolDepartments.has(schoolId) || isLoadingDepartments.has(schoolId)) {
      return;
    }

    setIsLoadingDepartments(prev => new Set(prev).add(schoolId));
    
    try {
      const departments = await departmentService.getDepartmentsBySchool(schoolId, 0, 100);
      
      setSchoolDepartments(prev => new Map(prev).set(schoolId, departments));
      setDepartmentErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(schoolId);
        return newErrors;
      });
      
    } catch (error) {
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

  const getDepartmentError = (schoolId) => {
    return departmentErrors.get(schoolId);
  };

  return {
    schoolDepartments,
    loadSchoolDepartments,
    retryLoadDepartments,
    getDepartmentsForSchool,
    isDepartmentsLoading,
    getDepartmentError
  };
};
