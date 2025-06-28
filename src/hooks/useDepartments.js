// t
// import { useState, useEffect } from 'react';
// import departmentService from '../services/departmentService';

// export const useDepartments = (schoolId = null) => {
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const loadDepartments = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       let data;
//       if (schoolId && schoolId !== 'all' && schoolId !== '') {
//         console.log(`🏢 Loading departments for school: ${schoolId}`);
//         data = await departmentService.getDepartmentsBySchool(schoolId);
//       } else {
//         console.log('🏢 Loading all departments');
//         data = await departmentService.getAllDepartments();
//       }
      
//       setDepartments(data);
//       console.log(`✅ Loaded ${data.length} departments`);
//     } catch (err) {
//       setError(err.message);
//       console.error('Failed to load departments:', err);
//       // Keep existing departments on error to avoid breaking UI
//       if (departments.length === 0) {
//         setDepartments([]);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDepartments();
//   }, [schoolId]);

//   const refetch = () => {
//     console.log('🔄 Manually refetching departments');
//     loadDepartments();
//   };

//   const createDepartment = async (departmentData) => {
//     try {
//       console.log('🆕 Creating new department:', departmentData);
//       const newDepartment = await departmentService.createDepartment(departmentData);
//       setDepartments(prev => [...prev, newDepartment]);
//       console.log('✅ Department created successfully:', newDepartment);
//       return newDepartment;
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Failed to create department:', err);
//       throw err;
//     }
//   };

//   const updateDepartment = async (departmentId, departmentData) => {
//     try {
//       console.log(`📝 Updating department ${departmentId}:`, departmentData);
//       const updatedDepartment = await departmentService.updateDepartment(departmentId, departmentData);
//       setDepartments(prev => prev.map(dept => 
//         dept.id === departmentId ? updatedDepartment : dept
//       ));
//       console.log('✅ Department updated successfully:', updatedDepartment);
//       return updatedDepartment;
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Failed to update department:', err);
//       throw err;
//     }
//   };

//   const deleteDepartment = async (departmentId) => {
//     try {
//       console.log(`🗑️ Deleting department ${departmentId}`);
//       await departmentService.deleteDepartment(departmentId);
//       setDepartments(prev => prev.filter(dept => dept.id !== departmentId));
//       console.log('✅ Department deleted successfully');
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Failed to delete department:', err);
//       throw err;
//     }
//   };

//   const getDepartmentById = async (departmentId) => {
//     try {
//       console.log(`🔍 Fetching department ${departmentId}`);
//       const department = await departmentService.getDepartmentById(departmentId);
//       console.log('✅ Department fetched:', department);
//       return department;
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Failed to fetch department:', err);
//       throw err;
//     }
//   };

//   const clearError = () => {
//     setError(null);
//   };

//   // Utility functions
//   const getDepartmentByName = (name) => {
//     return departments.find(dept => dept.name.toLowerCase() === name.toLowerCase());
//   };

//   const getDepartmentsBySchoolId = (schoolId) => {
//     return departments.filter(dept => dept.schoolId === schoolId);
//   };

//   const searchDepartments = (searchTerm) => {
//     if (!searchTerm) return departments;
//     const term = searchTerm.toLowerCase();
//     return departments.filter(dept => 
//       dept.name.toLowerCase().includes(term) ||
//       dept.code.toLowerCase().includes(term) ||
//       (dept.schoolName && dept.schoolName.toLowerCase().includes(term))
//     );
//   };

//   return {
//     // Data
//     departments,
//     loading,
//     error,
    
//     // Actions
//     refetch,
//     createDepartment,
//     updateDepartment,
//     deleteDepartment,
//     getDepartmentById,
//     clearError,
    
//     // Utilities
//     getDepartmentByName,
//     getDepartmentsBySchoolId,
//     searchDepartments,
    
//     // Computed values
//     departmentCount: departments.length,
//     hasDepartments: departments.length > 0,
//     isEmpty: departments.length === 0 && !loading
//   };
// };