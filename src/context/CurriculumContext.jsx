
import React, { createContext, useContext, useState, useEffect } from 'react';
import { curriculumData } from '../components/Users/Data/curriculumData';

const CurriculumContext = createContext();

export const useCurriculum = () => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};

export const CurriculumProvider = ({ children }) => {
  const [data, setData] = useState(curriculumData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredSchools = data.schools.filter(school => {
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
        program.type === activeFilter || program.name.toLowerCase().includes(activeFilter)
      );

    return matchesSearch && matchesFilter;
  });

  const getAllCurricula = () => {
    const allCurricula = [];
    data.schools.forEach(school => {
      school.programs.forEach(program => {
        program.departments.forEach(dept => {
          dept.curricula.forEach(curriculum => {
            allCurricula.push({
              ...curriculum,
              school: school.name,
              department: dept.name,
              program: program.name
            });
          });
        });
      });
    });
    return allCurricula;
  };

  const getFilteredCurricula = (statusFilter = 'all', searchTerm = '') => {
    const allCurricula = getAllCurricula();
    return allCurricula.filter(curriculum => {
      const matchesStatus = statusFilter === 'all' || curriculum.status === statusFilter;
      const matchesSearch = searchTerm === '' ||
        curriculum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curriculum.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curriculum.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
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
    getAllCurricula,
    getFilteredCurricula
  };

  return (
    <CurriculumContext.Provider value={value}>
      {children}
    </CurriculumContext.Provider>
  );
};