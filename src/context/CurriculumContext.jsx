import React, { createContext, useContext, useState, useEffect } from 'react';
import publicCurriculumService from '../services/publicCurriculumService';

const CurriculumContext = createContext();

export const useCurriculum = () => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};

export const CurriculumProvider = ({ children }) => {
  
  const [data, setData] = useState({
    schools: [],
    totalCurricula: 0,
    totalSchools: 0,
    totalPrograms: 0,
    totalDepartments: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [allCurricula, setAllCurricula] = useState([]);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const programs = [
    { id: 'phd', name: "PhD Program", displayName: "PhD Program", icon: 'graduation-cap', type: 'phd' },
    { id: 'bachelor', name: "Bachelor's Degree", displayName: "Bachelor's Degree", icon: 'user-graduate', type: 'degree' },
    { id: 'masters', name: "Master's Degree", displayName: "Master's Degree", icon: 'user-tie', type: 'masters' }
  ];
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log(' Initializing Public CurriculumProvider...');
        setLoading(true);
        
        await Promise.all([
          loadAllCurricula(),
          loadSchoolsAndDepartments()
        ]);
        
        setIsInitialized(true);
        console.log('✅ Public CurriculumProvider initialized');
      } catch (error) {
        console.error('❌ Error initializing CurriculumProvider:', error);
        
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const loadAllCurricula = async () => {
    try {
      console.log(' Loading all public curricula...');
      const result = await publicCurriculumService.getAllCurriculums(0, 500);
      
      setAllCurricula(result.curriculums);
      
     
      setData(prevData => ({
        ...prevData,
        totalCurricula: result.total || result.curriculums.length
      }));
      
      console.log('✅ Loaded public curricula:', result.curriculums.length);
    } catch (error) {
      console.error('❌ Error loading curricula:', error);
      
      setAllCurricula([]);
    }
  };

 
  const loadSchoolsAndDepartments = async () => {
    try {
      console.log(' Loading public schools and departments...');
      const [schoolsData, departmentsData] = await Promise.all([
        publicCurriculumService.getSchoolsFromCurriculums(),
        publicCurriculumService.getDepartmentsFromCurriculums()
      ]);
      
      setSchools(schoolsData);
      setDepartments(departmentsData);
      
      console.log('✅ Public schools loaded:', schoolsData.length);
      console.log('✅ Public departments loaded:', departmentsData.length);
    } catch (error) {
      console.error('❌ Error loading schools/departments:', error);
      
      setSchools([]);
      setDepartments([]);
    }
  };


  const transformToUserFormat = () => {
    if (!allCurricula.length || !schools.length) return [];

    const schoolsWithPrograms = schools.map(school => {
      
      const schoolCurricula = allCurricula.filter(c => 
        c.schoolId?.toString() === school.id?.toString()
      );

      // Group by programs
      const programsData = programs.map(program => {
        const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
        
        if (programCurricula.length === 0) return null;

        // Group by departments within this program
        const departmentGroups = {};
        programCurricula.forEach(curriculum => {
          const deptName = curriculum.department;
          if (!departmentGroups[deptName]) {
            departmentGroups[deptName] = {
              name: deptName,
              curricula: []
            };
          }
          departmentGroups[deptName].curricula.push(curriculum);
        });

        return {
          id: program.id,
          name: program.name,
          type: program.type,
          count: programCurricula.length,
          departments: Object.values(departmentGroups),
          icon: program.icon
        };
      }).filter(Boolean);

      if (programsData.length === 0) return null;

      return {
        id: school.id,
        name: school.name,
        icon: school.icon || 'university',
        departments: [...new Set(schoolCurricula.map(c => c.department))].length,
        total: schoolCurricula.length,
        programs: programsData
      };
    }).filter(Boolean);

    return schoolsWithPrograms;
  };

  const filteredSchools = React.useMemo(() => {
    const transformedSchools = transformToUserFormat();
    
    return transformedSchools.filter(school => {
      const matchesSearch = searchTerm === '' || 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.programs.some(program => 
          program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.departments.some(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.curricula.some(curriculum =>
              curriculum.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        );

      const matchesFilter = activeFilter === 'all' || 
        school.programs.some(program => 
          program.type === activeFilter || 
          (activeFilter === 'degree' && program.type === 'bachelor')
        );

      return matchesSearch && matchesFilter;
    });
  }, [allCurricula, schools, searchTerm, activeFilter]);

  const getAllCurricula = () => {
    return allCurricula.map(curriculum => ({
      ...curriculum,
      school: getSchoolName(curriculum.schoolId),
      department: curriculum.department,
      program: getProgramName(curriculum.programId)
    }));
  };

  // Get filtered curricula for the table view
  const getFilteredCurricula = (statusFilter = 'all', searchTerm = '') => {
    const allCurriculaWithMeta = getAllCurricula();
    
    return allCurriculaWithMeta.filter(curriculum => {
      const matchesStatus = statusFilter === 'all' || 
        curriculum.status === statusFilter ||
        (statusFilter === 'review' && curriculum.status === 'pending');
      
      const matchesSearch = searchTerm === '' ||
        curriculum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curriculum.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curriculum.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };


  const searchCurriculaByName = async (searchQuery, page = 0, size = 50) => {
    try {
      setLoading(true);
      const result = await publicCurriculumService.searchByName(searchQuery, page, size);
      return result.curriculums;
    } catch (error) {
      console.error('❌ Error searching curricula:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get curricula by school 
  const getCurriculaBySchool = async (schoolId, page = 0, size = 50) => {
    try {
      setLoading(true);
      const result = await publicCurriculumService.getCurriculumsBySchool(schoolId, page, size);
      return result.curriculums;
    } catch (error) {
      console.error('❌ Error getting school curricula:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get curricula by program 
  const getCurriculaByProgram = async (programId, page = 0, size = 50) => {
    try {
      setLoading(true);
      const academicLevelMap = { bachelor: 1, masters: 2, phd: 3 };
      const academicLevelId = academicLevelMap[programId];
      
      if (academicLevelId) {
        const result = await publicCurriculumService.getCurriculumsByAcademicLevel(academicLevelId, page, size);
        return result.curriculums;
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting program curricula:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  
  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id?.toString() === schoolId?.toString());
    return school ? school.name : 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  React.useEffect(() => {
    if (allCurricula.length > 0 && schools.length > 0) {
      const transformedSchools = transformToUserFormat();
      
      setData(prevData => ({
        ...prevData,
        schools: transformedSchools,
        totalSchools: schools.length,
        totalPrograms: programs.length * schools.length, // Approximation
        totalDepartments: departments.length
      }));
    }
  }, [allCurricula, schools, departments]);

  const refreshData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAllCurricula(),
        loadSchoolsAndDepartments()
      ]);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await publicCurriculumService.testConnection();
      console.log('🧪 Connection test result:', result);
      return result;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    // State
    data,
    filteredSchools,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    loading,
    setLoading,
    isInitialized,
    
    // Raw data
    allCurricula,
    schools,
    departments,
    programs,
    
    // Functions
    getAllCurricula,
    getFilteredCurricula,
    searchCurriculaByName,
    getCurriculaBySchool,
    getCurriculaByProgram,
    refreshData,
    testConnection,
    
    // Helpers
    getSchoolName,
    getProgramName
  };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};