import { useState, useEffect } from 'react';

export const useSchoolsViewData = (
  curriculumService,
  searchTerm,
  selectedSchool,
  selectedProgram,
  selectedDepartment,
  statusFilter,
  sortBy,
  showingCurriculaFor
) => {
  const [schoolsViewData, setSchoolsViewData] = useState([]);
  const [allSchoolsData, setAllSchoolsData] = useState([]);
  const [isLoadingSchoolsData, setIsLoadingSchoolsData] = useState(false);

  const loadSchoolsViewData = async () => {
    setIsLoadingSchoolsData(true);
    try {
      const result = await curriculumService.fetchAllCurriculums();
      const allCurricula = result.curriculums;
      
      setAllSchoolsData(allCurricula);
      
      let filteredCurricula = [...allCurricula];
      
      if (searchTerm && searchTerm.length >= 2) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredCurricula = filteredCurricula.filter(c => 
          (c.title && c.title.toLowerCase().includes(lowerSearchTerm)) ||
          (c.code && c.code.toLowerCase().includes(lowerSearchTerm)) ||
          (c.schoolName && c.schoolName.toLowerCase().includes(lowerSearchTerm)) ||
          (c.department && c.department.toLowerCase().includes(lowerSearchTerm))
        );
      }
      
      if (selectedSchool !== 'all') {
        filteredCurricula = filteredCurricula.filter(c => 
          c.schoolId?.toString() === selectedSchool.toString()
        );
      }
      
      if (selectedProgram !== 'all') {
        filteredCurricula = filteredCurricula.filter(c => 
          c.programId === selectedProgram
        );
      }
      
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
      setSchoolsViewData([]);
    } finally {
      setIsLoadingSchoolsData(false);
    }
  };

  useEffect(() => {
    if (!showingCurriculaFor) {
      loadSchoolsViewData();
    }
  }, [searchTerm, selectedSchool, selectedProgram, selectedDepartment, statusFilter, sortBy]);

  return {
    schoolsViewData,
    allSchoolsData,
    isLoadingSchoolsData,
    loadSchoolsViewData
  };
};

export const useProgramViewData = (curriculumService) => {
  const [programViewData, setProgramViewData] = useState([]);
  const [programCurrentPage, setProgramCurrentPage] = useState(0);
  const [programPageSize] = useState(20);
  const [programTotalPages, setProgramTotalPages] = useState(0);
  const [programHasNext, setProgramHasNext] = useState(false);
  const [programHasPrevious, setProgramHasPrevious] = useState(false);
  const [programTotalElements, setProgramTotalElements] = useState(0);

  const loadProgramViewData = async (schoolId, programId, schoolMapping, selectedDepartment, statusFilter, sortBy, page = 0) => {
    try {
      const mappedId = schoolMapping.get(schoolId) || schoolId;
      
      const result = await curriculumService.fetchAllCurriculums();
      
      let filteredCurricula = result.curriculums.filter(c => {
        const matchesSchool = c.schoolId?.toString() === mappedId?.toString();
        const matchesProgram = c.programId === programId;
        return matchesSchool && matchesProgram;
      });
      
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
      
      setProgramViewData(paginatedCurricula);
      setProgramTotalElements(filteredCurricula.length);
      setProgramTotalPages(Math.ceil(filteredCurricula.length / programPageSize));
      setProgramHasNext(endIndex < filteredCurricula.length);
      setProgramHasPrevious(page > 0);
      
    } catch (error) {
      setProgramViewData([]);
      setProgramTotalElements(0);
      setProgramTotalPages(0);
      setProgramHasNext(false);
      setProgramHasPrevious(false);
    }
  };

  const goToProgramPage = (page) => {
    setProgramCurrentPage(page);
  };

  const goToNextProgramPage = () => {
    if (programHasNext) {
      setProgramCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousProgramPage = () => {
    if (programHasPrevious) {
      setProgramCurrentPage(prev => prev - 1);
    }
  };

  return {
    programViewData,
    programCurrentPage,
    programPageSize,
    programTotalPages,
    programHasNext,
    programHasPrevious,
    programTotalElements,
    loadProgramViewData,
    goToProgramPage,
    goToNextProgramPage,
    goToPreviousProgramPage
  };
};

export const useSchoolMapping = (schools, allSchoolsData, schoolsViewData) => {
  const [schoolMapping, setSchoolMapping] = useState(new Map());

  const createSchoolMapping = () => {
    const mapping = new Map();
    const curriculumSchools = new Map();
    
    const dataSource = allSchoolsData.length > 0 ? allSchoolsData : schoolsViewData;
    
    dataSource.forEach(curriculum => {
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

  useEffect(() => {
    if (schools.length > 0 && (allSchoolsData.length > 0 || schoolsViewData.length > 0)) {
      createSchoolMapping();
    }
  }, [schools, allSchoolsData, schoolsViewData]);

  return { schoolMapping, createSchoolMapping };
};
