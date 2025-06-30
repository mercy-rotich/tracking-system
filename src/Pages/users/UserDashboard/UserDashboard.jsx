
import React, { useState, useEffect } from 'react';
import { useCurriculum } from '../../../context/CurriculumContext';
import UserDashboardCards from '../../../components/Users/UserDashboardCards/UserDashboardCards';
import UserSearchSection from '../../../components/Users/UserSearchSection/UserSearchSection';
import SchoolsList from '../../../components/Users/SchoolsList/SchoolsList';
import './UserDashboard.css';

const UserDashboard = () => {
  const { data, filteredSchools, searchTerm, setSearchTerm, activeFilter, setActiveFilter } = useCurriculum();
  const [animatedCount, setAnimatedCount] = useState(0);

 
  useEffect(() => {
    const target = data.totalCurricula;
    const increment = target / 60;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setAnimatedCount(Math.floor(current));
    }, 30);

    return () => clearInterval(timer);
  }, [data.totalCurricula]);

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="user-dashboard">
      {/* Dashboard Cards */}
      <UserDashboardCards 
        totalCurricula={animatedCount}
        totalSchools={data.schools.length}
        totalPrograms={data.schools.reduce((sum, school) => sum + school.programs.length, 0)}
        totalDepartments={data.schools.reduce((sum, school) => sum + school.departments, 0)}
      />

      {/* Search Section */}
      <UserSearchSection 
        searchTerm={searchTerm}
        onSearch={handleSearch}
        activeFilter={activeFilter}
        onFilter={handleFilter}
      />

      {/* Schools List */}
      <SchoolsList schools={filteredSchools} />
    </div>
  );
};

export default UserDashboard;