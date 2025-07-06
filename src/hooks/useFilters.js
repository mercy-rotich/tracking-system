
import { useState } from 'react';

export const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isSearching, setIsSearching] = useState(false);

  return {
    searchTerm,
    setSearchTerm,
    selectedSchool,
    setSelectedSchool,
    selectedProgram,
    setSelectedProgram,
    selectedDepartment,
    setSelectedDepartment,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    isSearching,
    setIsSearching
  };
};