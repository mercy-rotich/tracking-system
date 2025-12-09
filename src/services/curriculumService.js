import authService from "./authService";

class CurriculumService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🔄 Curriculum Service initialized');
    this.schoolMappingCache = new Map();
  }

  buildApiUrl(endpoint) {
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }

  async getHeaders() {
    try {
      const token = await authService.getValidToken();
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('❌ Failed to get valid token:', error);
      throw new Error('Authentication required. Please log in again.');
    }
  }

  // --- CORE OPTIMIZATION: PARALLEL FETCHING ---
  
  async fetchAllCurriculums() {
    try {
      console.log('🚀 [Admin Service] Starting parallel data fetch...');
      const pageSize = 100;

      // 1. Fetch Page 0
      const firstResult = await this.makeRequest('/users/curriculums/get-all', {
        params: { page: 0, size: pageSize }
      });

      const firstData = firstResult.data || firstResult;
      let allItems = firstData.curriculums || firstData.content || [];
      const totalPages = firstData.totalPages || 1;

      // 2. Fetch remaining pages in parallel
      if (totalPages > 1) {
        console.log(`⚡ Fetching remaining ${totalPages - 1} pages concurrently...`);
        
        const pagePromises = [];
        for (let i = 1; i < totalPages; i++) {
          pagePromises.push(
            this.makeRequest('/users/curriculums/get-all', {
              params: { page: i, size: pageSize }
            })
            .then(res => {
               const d = res.data || res;
               return d.curriculums || d.content || [];
            })
            .catch(err => {
               console.error(`Page ${i} failed`, err);
               return [];
            })
          );
        }

        const otherPagesData = await Promise.all(pagePromises);
        otherPagesData.forEach(items => {
          allItems = [...allItems, ...items];
        });
      }

      console.log(`✅ [Admin Service] Loaded total ${allItems.length} curriculums`);

      return {
        curriculums: allItems.map(c => this.transformCurriculumData(c)),
        total: allItems.length
      };
    } catch (error) {
      console.error('❌ Failed to fetch all curriculums:', error);
      return { curriculums: [], total: 0 };
    }
  }

  // --- SCHOOL DISCOVERY ---

  async getAllSchoolsEnhanced() {
    try {
      let schoolsFromApi = [];
      try {
        const apiResult = await this.makeRequest('/schools/get-all');
        schoolsFromApi = Array.isArray(apiResult) ? apiResult : (apiResult.data || []);
      } catch (e) {
        console.warn('⚠️ Schools API failed, relying on curriculum extraction');
      }
      
      const curriculumResult = await this.fetchAllCurriculums();
      const mergedSchools = new Map();
      
      schoolsFromApi.forEach((school, index) => {
        const id = school.id ? school.id.toString() : `api_school_${index}`;
        mergedSchools.set(id, {
          id: id, actualId: school.id, name: school.name,
          code: school.code, deanId: school.deanId,
          icon: this.getSchoolIcon(school.name), source: 'api'
        });
      });
      
      curriculumResult.curriculums.forEach(c => {
        if (c.schoolId && c.schoolName) {
          const id = c.schoolId.toString();
          if (!mergedSchools.has(id)) {
             const exists = Array.from(mergedSchools.values()).some(s => s.name.toLowerCase() === c.schoolName.toLowerCase());
             if (!exists) {
               mergedSchools.set(id, {
                 id: id, actualId: c.schoolId, name: c.schoolName,
                 icon: this.getSchoolIcon(c.schoolName), source: 'curricula'
               });
             }
          }
        }
      });
      
      return Array.from(mergedSchools.values());
    } catch (error) {
      return [];
    }
  }

  // --- REQUEST HANDLER ---

  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', body = null, params = {} } = options;
    const url = new URL(this.buildApiUrl(endpoint));
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.append(key, value);
    });
    const headers = await this.getHeaders();

    const response = await fetch(url.toString(), {
      method, headers, body: body ? JSON.stringify(body) : null
    });
    if (!response.ok) {
       const text = await response.text();
       if (response.status === 401) throw new Error('Unauthorized');
       throw new Error(`API Error ${response.status}: ${text}`);
    }
    return await response.json();
  }

  // --- API METHODS (Pass-throughs) ---
  async getCurriculumStats() { const r = await this.makeRequest('/admin/curriculums/stats'); return {data: r.data}; }
  async getExpiringCurriculums() { const r = await this.makeRequest('/admin/curriculums/expiring-soon'); return {data: Array.isArray(r.data)? r.data.map(c=>this.transformCurriculumData(c)):[]}; }
  async toggleCurriculumStatus(id, data) { return this.makeRequest(`/admin/curriculums/toggle-status/${id}`, {method:'PUT', body:data}); }
  async putCurriculumUnderReview(id, data) { return this.makeRequest(`/admin/curriculums/review/${id}`, {method:'PUT', body:data}); }
  async createCurriculum(data) { return this.makeRequest('/admin/curriculums/create', {method:'POST', body:data}); }
  async updateCurriculum(id, data) { return this.makeRequest(`/admin/curriculums/update/${id}`, {method:'PUT', body:data}); }
  async inactivateCurriculum(id, data) { return this.makeRequest(`/admin/curriculums/delete/${id}`, {method:'DELETE', body:data}); }
  async deleteCurriculumPermanently(id) { return this.makeRequest(`/admin/curriculums/permanent-delete/${id}`, {method:'DELETE'}); }

  async getAllCurriculums(page=0, size=100) {
    const r = await this.makeRequest('/users/curriculums/get-all', {params:{page, size}});
    return this.processResponse(r, page, size);
  }
  async getCurriculumsBySchool(id, page=0, size=10) {
    const r = await this.makeRequest(`/users/curriculums/school/${id}`, {params:{page, size}});
    return this.processResponse(r, page, size);
  }
  async getCurriculumsByAcademicLevel(id, page=0, size=10) {
    const r = await this.makeRequest(`/users/curriculums/academic-level/${id}`, {params:{page, size}});
    return this.processResponse(r, page, size);
  }
  async searchByName(name, page=0, size=10) {
    const r = await this.makeRequest('/users/curriculums/search', {method:'POST', body:{name}, params:{page, size}});
    return this.processResponse(r, page, size);
  }
  
  async getDepartmentsFromCurriculums() {
      const { curriculums } = await this.fetchAllCurriculums();
      const departmentsMap = new Map();
      curriculums.forEach(curriculum => {
        if (curriculum.departmentId && curriculum.department) {
          departmentsMap.set(curriculum.departmentId.toString(), {
            id: curriculum.departmentId,
            name: curriculum.department,
            schoolId: curriculum.schoolId,
            schoolName: curriculum.schoolName
          });
        }
      });
      return Array.from(departmentsMap.values());
  }

  processResponse(result, page, size) {
    let curriculums = [];
    let pagination = {};
    if (result.data?.curriculums) { curriculums = result.data.curriculums; pagination = result.data; }
    else if (Array.isArray(result.data)) { curriculums = result.data; }
    return {
      curriculums: curriculums.map(c => this.transformCurriculumData(c)),
      pagination: {
        totalElements: pagination.totalElements || curriculums.length,
        totalPages: pagination.totalPages || 1,
        hasNext: pagination.hasNext || false,
        hasPrevious: pagination.hasPrevious || false
      }
    }
  }

  transformCurriculumData(api) {
    return {
      id: api.id?.toString() || api.id,
      title: api.name,
      code: api.code,
      status: this.mapApiStatus(api.status),
      department: api.departmentName,
      departmentId: api.departmentId,
      schoolId: api.schoolId?.toString(),
      schoolName: api.schoolName,
      programId: this.mapAcademicLevelToProgram(api.academicLevelName),
      createdDate: this.formatDate(api.createdAt),
      lastModified: this.formatDate(api.updatedAt),
      effectiveDate: this.formatDate(api.effectiveDate),
      expiryDate: this.formatDate(api.expiryDate),
      durationSemesters: api.durationSemesters,
      active: api.active,
      approvedBy: api.approvedBy,
      createdBy: api.createdBy
    };
  }

  mapApiStatus(status) {
    const map = { 'UNDER_REVIEW': 'pending', 'APPROVED': 'approved', 'REJECTED': 'rejected', 'DRAFT': 'draft', 'PENDING': 'pending', 'ACTIVE': 'approved', 'INACTIVE': 'rejected' };
    return map[status] || 'draft';
  }

  mapAcademicLevelToProgram(level) {
    if (!level) return 'bachelor';
    const l = level.toLowerCase();
    return (l.includes('phd') || l.includes('doc')) ? 'phd' : (l.includes('master') ? 'masters' : 'bachelor');
  }
  
  mapProgramToAcademicLevel(programId) {
    const map = { 'bachelor': 1, 'masters': 2, 'phd': 3 };
    return map[programId] || 1;
  }

  formatDate(date) {
    try { return date ? new Date(date).toISOString().split('T')[0] : null; } catch { return null; }
  }

  getSchoolIcon(name) {
    if (!name) return 'university';
    const n = name.toLowerCase();
    if (n.includes('tech') || n.includes('engin')) return 'cogs';
    if (n.includes('busin') || n.includes('econ')) return 'chart-line';
    if (n.includes('med') || n.includes('health')) return 'heartbeat';
    return 'university';
  }
}

const curriculumService = new CurriculumService();
export default curriculumService;