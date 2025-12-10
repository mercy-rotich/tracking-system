export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTimeSince = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'Just now';
};

export const getSchoolStatsEnhanced = (schoolId, schools, allSchoolsData, schoolsViewData, schoolMapping, getDepartmentsForSchool) => {
  const school = schools.find(s => s.id === schoolId);
  let schoolCurricula = [];
  
  const dataSource = allSchoolsData.length > 0 ? allSchoolsData : schoolsViewData;
  
  const mappedId = schoolMapping.get(schoolId);
  if (mappedId) {
    schoolCurricula = dataSource.filter(c => c.schoolId?.toString() === mappedId?.toString());
  }
  
  if (schoolCurricula.length === 0) {
    schoolCurricula = dataSource.filter(c => c.schoolId?.toString() === schoolId?.toString());
    
    if (schoolCurricula.length === 0 && school?.code) {
      schoolCurricula = dataSource.filter(c => c.schoolId?.toString() === school.code?.toString());
    }
    
    if (schoolCurricula.length === 0 && school?.name) {
      schoolCurricula = dataSource.filter(c => c.schoolName === school.name);
    }
    
    if (schoolCurricula.length === 0 && school?.name) {
      const schoolKeywords = school.name.toLowerCase().split(' ').filter(word => 
        !['school', 'of', 'and', 'the', 'for', 'in'].includes(word) && word.length > 2
      );
      
      schoolCurricula = dataSource.filter(c => {
        if (!c.schoolName) return false;
        const curriculumSchoolLower = c.schoolName.toLowerCase();
        return schoolKeywords.some(keyword => curriculumSchoolLower.includes(keyword));
      });
    }
  }
  
  const statusStats = {
    approved: schoolCurricula.filter(c => c.status === 'approved').length,
    pending: schoolCurricula.filter(c => c.status === 'pending').length,
    draft: schoolCurricula.filter(c => c.status === 'draft').length,
    rejected: schoolCurricula.filter(c => c.status === 'rejected').length
  };
  
  const backendDepartments = getDepartmentsForSchool(schoolId);
  const curriculumDepartments = [...new Set(schoolCurricula.map(c => c.department))].filter(Boolean);
  const totalDepartments = Math.max(backendDepartments.length, curriculumDepartments.length);
  
  return {
    total: schoolCurricula.length,
    departments: totalDepartments,
    programs: 0,
    statusStats,
    matchedCurricula: schoolCurricula
  };
};

export const getProgramsForSchoolEnhanced = (schoolId, programs, schoolCurricula) => {
  return programs.map(program => {
    const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
    const departments = [...new Set(programCurricula.map(c => c.department))].filter(Boolean);
    
    const statusStats = {
      approved: programCurricula.filter(c => c.status === 'approved').length,
      pending: programCurricula.filter(c => c.status === 'pending').length,
      draft: programCurricula.filter(c => c.status === 'draft').length,
      rejected: programCurricula.filter(c => c.status === 'rejected').length
    };
    
    return {
      ...program,
      count: programCurricula.length,
      departments: departments.length,
      statusStats
    };
  }).filter(program => program.count > 0);
};

export const enhanceProgramsWithDepartments = (schoolPrograms, schoolCurricula, backendDepartments) => {
  return schoolPrograms.map(program => {
    const programCurricula = schoolCurricula.filter(c => c.programId === program.id);
    const curriculumDepartments = [...new Set(programCurricula.map(c => c.department))].filter(Boolean);
    
    const matchedBackendDepts = backendDepartments.filter(backendDept => 
      curriculumDepartments.some(currDept => 
        backendDept.name.toLowerCase() === currDept.toLowerCase()
      )
    );
    
    const allDepartments = [];
    
    matchedBackendDepts.forEach(dept => {
      const curriculumCount = programCurricula.filter(c => c.department === dept.name).length;
      allDepartments.push({
        ...dept,
        curriculumCount,
        source: 'backend'
      });
    });
    
    curriculumDepartments.forEach(deptName => {
      const alreadyAdded = allDepartments.some(d => d.name.toLowerCase() === deptName.toLowerCase());
      if (!alreadyAdded) {
        const curriculumCount = programCurricula.filter(c => c.department === deptName).length;
        allDepartments.push({
          id: `curriculum_${deptName.replace(/\s+/g, '_')}`,
          name: deptName,
          curriculumCount,
          source: 'curriculum'
        });
      }
    });

    return {
      ...program,
      enhancedDepartments: allDepartments
    };
  });
};
