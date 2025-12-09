// src/services/publicCurriculumService.js

class PublicCurriculumService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.endpoints = {
      curriculums: '/users/curriculums',
      schools: '/schools',
      departments: '/user/departments'
    };
    console.log('🌐 Public Curriculum Service initialized');
  }

  getPublicHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // --- CORE OPTIMIZATION: PARALLEL FETCHING ---
  
  async fetchAllCurriculums() {
    try {
      console.log('🚀 [Public Service] Starting parallel data fetch...');
      const pageSize = 100;
      
      // 1. Fetch first page to get metadata
      const firstPageUrl = `${this.baseURL}${this.endpoints.curriculums}/get-all?page=0&size=${pageSize}`;
      const firstResponse = await fetch(firstPageUrl, { method: 'GET', headers: this.getPublicHeaders() });
      
      if (!firstResponse.ok) throw new Error(`API Error: ${firstResponse.status}`);
      
      const firstResult = await firstResponse.json();
      const firstData = firstResult.data || firstResult;
      
      let allItems = firstData.curriculums || firstData.content || [];
      const totalPages = firstData.totalPages || 1;

      // 2. If more pages exist, fetch them ALL in parallel
      if (totalPages > 1) {
        console.log(`⚡ Fetching remaining ${totalPages - 1} pages in parallel...`);
        
        const pagePromises = [];
        for (let i = 1; i < totalPages; i++) {
          const url = `${this.baseURL}${this.endpoints.curriculums}/get-all?page=${i}&size=${pageSize}`;
          pagePromises.push(
            fetch(url, { method: 'GET', headers: this.getPublicHeaders() })
              .then(res => res.json())
              .then(res => {
                const d = res.data || res;
                return d.curriculums || d.content || [];
              })
              .catch(err => {
                console.error(`❌ Failed to fetch page ${i}`, err);
                return [];
              })
          );
        }

        const otherPagesResults = await Promise.all(pagePromises);
        
        
        otherPagesResults.forEach(items => {
          allItems = [...allItems, ...items];
        });
      }

      console.log(`✅ Loaded total ${allItems.length} curriculums in parallel`);

      return {
        curriculums: allItems.map(c => this.transformCurriculumData(c)),
        total: allItems.length
      };
    } catch (error) {
      console.error('❌ Failed to fetch all curriculums:', error);
      return { curriculums: [], total: 0 };
    }
  }

 

  async getAllSchoolsEnhanced() {
    try {
     
      let schoolsFromApi = [];
      try {
        const url = `${this.baseURL}${this.endpoints.schools}/get-all`;
        const response = await fetch(url, { method: 'GET', headers: this.getPublicHeaders() });
        if (response.ok) {
          const result = await response.json();
          schoolsFromApi = Array.isArray(result) ? result : (result.data || []);
        }
      } catch (e) {
        console.warn('⚠️ Schools API unavailable');
      }

      const { curriculums } = await this.fetchAllCurriculums();
      
      const mergedSchools = new Map();

      // Add API schools
      schoolsFromApi.forEach((school, index) => {
        const id = school.id ? school.id.toString() : `api_${index}`;
        mergedSchools.set(id, {
          id: id,
          actualId: school.id,
          name: school.name,
          code: school.code,
          deanId: school.deanId,
          icon: this.getSchoolIcon(school.name)
        });
      });

      // Add missing schools
      curriculums.forEach(c => {
        if (c.schoolId && c.schoolName) {
          const id = c.schoolId.toString();
          if (!mergedSchools.has(id)) {
             // Check name duplication
             const existsByName = Array.from(mergedSchools.values()).some(
                s => s.name.toLowerCase() === c.schoolName.toLowerCase()
             );
             if (!existsByName) {
                mergedSchools.set(id, {
                  id: id,
                  name: c.schoolName,
                  icon: this.getSchoolIcon(c.schoolName),
                  fromCurricula: true
                });
             }
          }
        }
      });

      return Array.from(mergedSchools.values());
    } catch (error) {
      console.error('❌ Error loading schools:', error);
      return [];
    }
  }

  async getDepartmentsFromCurriculums() {
    try {
      const { curriculums } = await this.fetchAllCurriculums();
      const deptMap = new Map();

      curriculums.forEach(c => {
        if (c.department) {
          const key = c.departmentId || c.department;
          if (!deptMap.has(key)) {
            deptMap.set(key, {
              id: c.departmentId,
              name: c.department,
              schoolId: c.schoolId,
              schoolName: c.schoolName
            });
          }
        }
      });
      return Array.from(deptMap.values());
    } catch (e) { return []; }
  }

  // --- TRANSFORMATION & HELPERS ---
  transformCurriculumData(apiCurriculum) {
    return {
      id: apiCurriculum.id?.toString() || apiCurriculum.id,
      title: apiCurriculum.name || apiCurriculum.proposedCurriculumName,
      code: apiCurriculum.code || apiCurriculum.proposedCurriculumCode,
      status: this.mapApiStatus(apiCurriculum.status),
      department: apiCurriculum.departmentName,
      departmentId: apiCurriculum.departmentId?.toString(),
      schoolId: apiCurriculum.schoolId?.toString(),
      schoolName: apiCurriculum.schoolName,
      programId: this.mapAcademicLevelToProgram(apiCurriculum.academicLevelName),
      programName: apiCurriculum.academicLevelName,
      createdDate: this.formatDate(apiCurriculum.createdAt),
      lastModified: this.formatDate(apiCurriculum.updatedAt),
      effectiveDate: this.formatDate(apiCurriculum.effectiveDate),
      duration: apiCurriculum.durationSemesters ? `${apiCurriculum.durationSemesters} semesters` : 'N/A',
      active: apiCurriculum.isActive,
      createdBy: apiCurriculum.createdBy || 'System',
      description: apiCurriculum.curriculumDescription || '',
      rating: 0,
      enrollments: 0,
      author: 'Faculty'
    };
  }

  mapApiStatus(apiStatus) {
    const statusMap = {
      'APPROVED': 'approved', 'ACTIVE': 'approved',
      'IN_PROGRESS': 'pending', 'UNDER_REVIEW': 'pending',
      'PENDING': 'pending', 'REJECTED': 'rejected'
    };
    return statusMap[apiStatus] || 'draft';
  }

  mapAcademicLevelToProgram(academicLevel) {
    if (!academicLevel) return 'bachelor';
    const level = academicLevel.toLowerCase();
    if (level.includes('phd') || level.includes('doctor')) return 'phd';
    if (level.includes('master')) return 'masters';
    return 'bachelor';
  }

  formatDate(dateString) {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch { return null; }
  }

  async searchByName(name, page = 0, size = 20) {
    try {
      const url = `${this.baseURL}${this.endpoints.curriculums}/search?page=${page}&size=${size}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getPublicHeaders(),
        body: JSON.stringify({ name: name, isActive: true })
      });
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      const result = await response.json();
      const data = result.data || {};
      const items = data.curriculums || [];
      return {
        curriculums: items.map(c => this.transformCurriculumData(c)),
        total: data.totalElements || items.length
      };
    } catch (error) { return { curriculums: [], total: 0 }; }
  }

  getSchoolIcon(schoolName) {
    const name = (schoolName || '').toLowerCase();
    if (name.includes('engineer') || name.includes('tech')) return 'cogs';
    if (name.includes('business') || name.includes('econ')) return 'chart-line';
    if (name.includes('health') || name.includes('med')) return 'heartbeat';
    if (name.includes('science')) return 'atom';
    if (name.includes('art') || name.includes('design')) return 'palette';
    if (name.includes('law')) return 'gavel';
    return 'university';
  }
}

const publicCurriculumService = new PublicCurriculumService();
export default publicCurriculumService;