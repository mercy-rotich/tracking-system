// src/services/publicCurriculumService.js

class PublicCurriculumService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.endpoints = {
      curriculums: '/users/curriculums',
      schools: '/schools',
      departments: '/user/departments'
    };
    console.log('🌐 Public Curriculum Service initialized (Hybrid Mode)');
  }

  getPublicHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // --- DATA TRANSFORMATION ---
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


  async getAllCurriculums(page = 0, size = 100) {
    try {
      const url = `${this.baseURL}${this.endpoints.curriculums}/get-all?page=${page}&size=${size}`;
      const response = await fetch(url, { method: 'GET', headers: this.getPublicHeaders() });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const result = await response.json();
      const data = result.data || result;
      const items = data.curriculums || data.content || (Array.isArray(data) ? data : []);

      return {
        curriculums: items.map(c => this.transformCurriculumData(c)),
        total: data.totalElements || items.length,
        page: data.currentPage || page,
        size: data.pageSize || size
      };
    } catch (error) {
      console.error('❌ Failed to fetch curriculums:', error);
      return { curriculums: [], total: 0 };
    }
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
    } catch (error) {
      return { curriculums: [], total: 0 };
    }
  }


  async getSchoolsFromCurriculums() {
    try {
      // 1. Try Direct API
      const url = `${this.baseURL}${this.endpoints.schools}/get-all`;
      const response = await fetch(url, { method: 'GET', headers: this.getPublicHeaders() });

      if (response.ok) {
        const result = await response.json();
        const schools = Array.isArray(result) ? result : (result.data || []);
        return schools.map(school => ({
          id: school.id?.toString(),
          name: school.name,
          icon: this.getSchoolIcon(school.name)
        }));
      }
      throw new Error(`Direct API failed: ${response.status}`);
    } catch (error) {
      console.warn('⚠️ Direct school fetch failed (CORS/Auth), falling back to extraction:', error.message);
      return this.extractSchoolsFromCurriculums();
    }
  }

  async getDepartmentsFromCurriculums() {
    try {
      // 1. Try Direct API
      const url = `${this.baseURL}${this.endpoints.departments}/get-all-departments?size=100`;
      const response = await fetch(url, { method: 'GET', headers: this.getPublicHeaders() });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const departments = data.departments || data.content || (Array.isArray(data) ? data : []);
        return departments.map(d => ({
          id: d.id?.toString(),
          name: d.name,
          schoolId: d.schoolId?.toString(),
          schoolName: d.schoolName
        }));
      }
      throw new Error(`Direct API failed: ${response.status}`);
    } catch (error) {
      console.warn('⚠️ Direct department fetch failed (CORS/Auth), falling back to extraction:', error.message);
      return this.extractDepartmentsFromCurriculums();
    }
  }

  // --- FALLBACK EXTRACTION LOGIC ---
  
  async extractSchoolsFromCurriculums() {
    try {
      const result = await this.getAllCurriculums(0, 1000); 
      const curriculums = result.curriculums || [];
      const schoolsMap = new Map();
      
      curriculums.forEach(c => {
        if (c.schoolName) {
          const id = (c.schoolId && c.schoolId !== "0") ? c.schoolId : c.schoolName;
          if (!schoolsMap.has(id)) {
            schoolsMap.set(id, {
              id: id,
              name: c.schoolName,
              icon: this.getSchoolIcon(c.schoolName)
            });
          }
        }
      });
      return Array.from(schoolsMap.values());
    } catch (e) { return []; }
  }

  async extractDepartmentsFromCurriculums() {
    try {
      const result = await this.getAllCurriculums(0, 1000); 
      const curriculums = result.curriculums || [];
      const deptMap = new Map();
      
      curriculums.forEach(c => {
        if (c.department) {
          const id = c.departmentId || c.department;
          if (!deptMap.has(id)) {
            deptMap.set(id, {
              id: id,
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

  // --- HELPERS ---

  async getCurriculumsBySchool(schoolId, page = 0, size = 20) {
    try {
      const url = `${this.baseURL}${this.endpoints.curriculums}/school/${schoolId}?page=${page}&size=${size}`;
      const response = await fetch(url, { method: 'GET', headers: this.getPublicHeaders() });
      if (response.ok) {
        const result = await response.json();
        return this.processCurriculaResponse(result, page, size);
      }
      return { curriculums: [], total: 0 };
    } catch { return { curriculums: [], total: 0 }; }
  }

  async getCurriculumsByAcademicLevel(levelId, page = 0, size = 20) {
    try {
      const url = `${this.baseURL}${this.endpoints.curriculums}/academic-level/${levelId}?page=${page}&size=${size}`;
      const response = await fetch(url, { method: 'GET', headers: this.getPublicHeaders() });
      if (response.ok) {
        const result = await response.json();
        return this.processCurriculaResponse(result, page, size);
      }
      return { curriculums: [], total: 0 };
    } catch { return { curriculums: [], total: 0 }; }
  }

  processCurriculaResponse(result, page, size) {
    const data = result.data || result;
    const items = data.curriculums || [];
    return {
      curriculums: items.map(c => this.transformCurriculumData(c)),
      total: data.totalElements || items.length,
      page: data.currentPage || page,
      size: data.pageSize || size
    };
  }

  getSchoolIcon(schoolName) {
    const name = (schoolName || '').toLowerCase();
    if (name.includes('engineer') || name.includes('tech')) return 'cogs';
    if (name.includes('business') || name.includes('econ')) return 'chart-line';
    if (name.includes('health') || name.includes('med')) return 'heartbeat';
    if (name.includes('science')) return 'atom';
    if (name.includes('art') || name.includes('design')) return 'palette';
    if (name.includes('law')) return 'balance-scale';
    return 'university';
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.curriculums}/get-all?page=0&size=1`, {
        method: 'GET', headers: this.getPublicHeaders()
      });
      return { success: response.ok, message: response.ok ? 'Connected' : `Error: ${response.status}` };
    } catch (e) { return { success: false, message: e.message }; }
  }
}

const publicCurriculumService = new PublicCurriculumService();
export default publicCurriculumService;