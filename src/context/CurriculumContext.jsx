import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  // --- INITIALIZATION ---
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🔄 Initializing Curriculum Context...');
        setLoading(true);
        
        await refreshData();
        
        setIsInitialized(true);
        console.log('✅ Curriculum Context initialized');
      } catch (error) {
        console.error('❌ Error initializing CurriculumProvider:', error);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const processSchoolsData = (schoolsRaw, curriculumsRaw) => {
    if (!schoolsRaw.length) return [];

    return schoolsRaw.map(school => {
      // Filter curricula for this specific school
      const schoolCurricula = curriculumsRaw.filter(c => {
        const idMatch = c.schoolId && school.id && c.schoolId.toString() === school.id.toString();
        const nameMatch = c.schoolName && school.name && 
                          c.schoolName.toLowerCase().trim() === school.name.toLowerCase().trim();
        return idMatch || nameMatch;
      });

      const programsData = programs.map(program => {
        const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
        
        if (programCurricula.length === 0) return null;

        const departmentGroups = {};
        programCurricula.forEach(curriculum => {
          const deptName = curriculum.department || 'General';
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

      return {
        id: school.id,
        name: school.name,
        icon: school.icon || 'university',
        departments: [...new Set(schoolCurricula.map(c => c.department))].length,
        total: schoolCurricula.length,
        programs: programsData
      };
    });
  };

  // --- CORE DATA FETCHING ---
  const refreshData = async () => {
    try {
      setLoading(true);
      
      const [curriculumResult, schoolsData, departmentsData] = await Promise.all([
        publicCurriculumService.fetchAllCurriculums(),
        publicCurriculumService.getAllSchoolsEnhanced(),
        publicCurriculumService.getDepartmentsFromCurriculums()
      ]);

      const rawCurricula = curriculumResult.curriculums || [];
      
      setAllCurricula(rawCurricula);
      setSchools(schoolsData);
      setDepartments(departmentsData);

     
      const processedSchools = processSchoolsData(schoolsData, rawCurricula);

      setData({
        schools: processedSchools,
        totalCurricula: rawCurricula.length,
        totalSchools: schoolsData.length,
        totalDepartments: departmentsData.length,
        totalPrograms: schoolsData.length * 3 
      });

      console.log(`✅ Context Updated: ${rawCurricula.length} curricula, ${schoolsData.length} schools`);

    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = React.useMemo(() => {
    
    const currentSchools = data.schools || [];
    
    return currentSchools.filter(school => {
      if (searchTerm === '' && activeFilter === 'all') return true;

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
  }, [data.schools, searchTerm, activeFilter]);

  const getAllCurricula = () => {
    return allCurricula.map(curriculum => ({
      ...curriculum,
      school: getSchoolName(curriculum.schoolId),
      department: curriculum.department,
      program: getProgramName(curriculum.programId)
    }));
  };

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

  const getSchoolName = (schoolId) => {
    const school = schools.find(s => s.id?.toString() === schoolId?.toString());
    return school ? school.name : 'Unknown School';
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name : 'Unknown Program';
  };

  const value = {
    data,
    filteredSchools,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    loading,
    setLoading,
    isInitialized,
    allCurricula,
    schools,
    departments,
    programs,
    getAllCurricula,
    getFilteredCurricula,
    searchCurriculaByName,
    refreshData,
    getSchoolName,
    getProgramName
  };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};