import authService from "./authService";

class CurriculumService{
  constructor(){
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log( 'Curriculum Service initialized with base URL:' ,this.baseURL)
  }

  //centralized request method to handle all API calls
  async makeRequest(endpoint,options ={}){
    const{method = 'GET',body = null,params = {}} = options;

    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key,value]) =>{
      if(value !== undefined && value !== null){
        url.searchParams.append(key,value);
      }
    });

    const headers={
      'content-Type':'application/json',
      'Authorization':`Bearer ${localStorage.getItem('sessionToken')}`
    };

    try{
      const response = await fetch(url.toString(),{
        method,
        headers,
        body:body ? JSON.stringify(body):null
      });

      if(!response.ok){
        const errorText = await response.text();
        if(response.status === 401){
          throw new Error('Unauthorized: Please log in again.')
        }
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }
      return await response.json();
    }catch (error){
      console.error(`❌ Request failed for ${endpoint}:`, error.message);
        throw error;
    }
  }

  processResponse(result,page = 0,size = 20){
    let curriculums =[];
    let pagination = {};

    if(result.data?.curriculums){
      curriculums=result.data.curriculums;
      pagination=result.data;
    }else if(Array.isArray(result.data)){
      curriculums = result.data;
    }else if(Array.isArray(result)){
      curriculums=result;
    }

    return{
      curriculums: curriculums.map(c => this.transformCurriculumData(c)),
      total: pagination.totalElements || curriculums.length,
      page,
      size,
      message: result.message,
      pagination: {
        currentPage: pagination.currentPage || page,
        totalPages: pagination.totalPages || Math.ceil(curriculums.length / size),
        totalElements: pagination.totalElements || curriculums.length,
        pageSize: pagination.pageSize || size,
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
      schoolId: api.schoolId?.toString() || api.schoolId,
      schoolName: api.schoolName,
      departmentId: api.departmentId,
      programId: this.mapAcademicLevelToProgram(api.academicLevelName),
      programName: api.academicLevelName,
      createdDate: this.formatDate(api.createdAt),
      lastModified: this.formatDate(api.updatedAt),
      effectiveDate: this.formatDate(api.effectiveDate),
      expiryDate: this.formatDate(api.expiryDate),
      duration: `${api.durationSemesters} semesters`,
      durationSemesters: api.durationSemesters,
      active: api.active,
      createdBy: api.createdBy,
      approvedBy: api.approvedBy,
      approvedAt: this.formatDate(api.approvedAt),
      // Defaults
      enrollments: 0,
      rating: 0,
      description: '',
      author: api.createdBy || 'System',
      category: api.departmentName || 'General',
      difficulty: 'Advanced'
    };
  }

  //utility methods
  mapApiStatus(status){
    const statusMap={
      'UNDER_REVIEW': 'pending review', 'APPROVED': 'approved', 'REJECTED': 'rejected',
        'DRAFT': 'draft', 'PENDING': 'pending', 'ACTIVE': 'approved', 'INACTIVE': 'rejected'
    };
    return statusMap[status] || 'draft';
  }

  mapAcademicLevelToProgram(level){
    const programMap = {
      'PhD': 'phd', 'Master': 'masters', 'Masters': 'masters',
      'Bachelor': 'bachelor', 'Bachelors': 'bachelor', 'Undergraduate': 'bachelor'
    };
    return programMap[level] || 'bachelor';
  }

  formatDate(dateString) {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  getSchoolIcon(schoolName) {
    const iconMap = {
      'Engineering': 'cogs', 'Technology': 'laptop-code', 'Business': 'chart-line',
      'Economics': 'chart-line', 'Science': 'atom', 'Medicine': 'heartbeat',
      'Health': 'heartbeat', 'Education': 'chalkboard-teacher', 'Arts': 'palette', 
      'Agriculture': 'seedling', 'Environmental': 'leaf', 'Social': 'users',
      'Humanities': 'book', 'Law': 'gavel', 'Natural': 'microscope'
    };
    for(const[keyword,icon] of Object.entries(iconMap)){
      if (schoolName.toLowerCase().includes(keyword.toLowerCase())) {
        return icon;
      }
    }
    return 'university';
  }

  async getAllSchools() {
    try {
      console.log('🔄 Loading schools from dedicated endpoint...');
      const result = await this.makeRequest('/schools/get-all');
      
  
      const schoolsData = Array.isArray(result) ? result : (result.data || []);
      
      
      const schools = schoolsData.map((school, index) => ({
        id: school.code || `school_${index}`, // Use code as ID
        name: school.name,
        code: school.code,
        deanId: school.deanId,
        icon: this.getSchoolIcon(school.name),
        source: 'api'
      }));
      
      console.log('✅ Schools loaded from API:', schools);
      return schools;
    } catch (error) {
      console.error('❌ Error loading schools from API, falling back to curriculum extraction:', error);
      
      return await this.getSchoolsFromCurriculums();
    }
  }

  async getAllSchoolsEnhanced() {
    try {
      console.log('🔄 Loading schools from multiple sources...');
      
      
      let schoolsFromApi = [];
      try {
        const apiResult = await this.makeRequest('/schools/get-all');
        schoolsFromApi = Array.isArray(apiResult) ? apiResult : (apiResult.data || []);
      } catch (apiError) {
        console.warn('⚠️ Schools API endpoint failed:', apiError.message);
      }
      
      
      const curriculumResult = await this.getAllCurriculums(0, 1000);
      const schoolsFromCurricula = new Map();
      
      curriculumResult.curriculums.forEach(curriculum => {
        if (curriculum.schoolId && curriculum.schoolName) {
          schoolsFromCurricula.set(curriculum.schoolId, {
            id: curriculum.schoolId,
            name: curriculum.schoolName,
            fromCurricula: true
          });
        }
      });
      
      // Merge and transform data
      const mergedSchools = new Map();
      
      // First, add schools from API
      schoolsFromApi.forEach((school, index) => {
        const schoolData = {
          id: school.code || `api_school_${index}`,
          name: school.name,
          code: school.code,
          deanId: school.deanId,
          icon: this.getSchoolIcon(school.name),
          source: 'api'
        };
        mergedSchools.set(school.code || school.name, schoolData);
      });
      
    
      schoolsFromCurricula.forEach((school, schoolId) => {
        // Try to match by name first
        const existingSchool = Array.from(mergedSchools.values())
          .find(s => s.name.toLowerCase() === school.name.toLowerCase());
        
        if (!existingSchool) {
          // Add missing school from curriculum data
          mergedSchools.set(schoolId, {
            id: schoolId,
            name: school.name,
            icon: this.getSchoolIcon(school.name),
            source: 'curricula'
          });
        } else {
          // Update existing school with curriculum ID for reference
          existingSchool.curriculumId = schoolId;
        }
      });
      
      const finalSchools = Array.from(mergedSchools.values());
      console.log('✅ Enhanced schools loaded:', finalSchools);
      return finalSchools;
      
    } catch (error) {
      console.error('❌ Error in enhanced school loading, falling back to curriculum extraction:', error);
      return await this.getSchoolsFromCurriculums();
    }
  }


  async getSchoolsFromCurriculums() {
    const result = await this.getAllCurriculums(0, 1000);
    const schoolsMap = new Map();

    result.curriculums.forEach(curriculum => {
      if (curriculum.schoolId && curriculum.schoolName) {
        schoolsMap.set(curriculum.schoolId, {
          id: curriculum.schoolId,
          name: curriculum.schoolName,
          icon: this.getSchoolIcon(curriculum.schoolName),
          source: 'curricula'
        });
      }
    });

    return Array.from(schoolsMap.values());
  }

  async getDepartmentsFromCurriculums() {
    const result = await this.getAllCurriculums(0, 1000);
    const departmentsMap = new Map();

    result.curriculums.forEach(curriculum => {
      if (curriculum.departmentId && curriculum.department) {
        departmentsMap.set(curriculum.departmentId, {
          id: curriculum.departmentId,
          name: curriculum.department,
          schoolId: curriculum.schoolId,
          schoolName: curriculum.schoolName
        });
      }
    });

    return Array.from(departmentsMap.values());
  }

  //api methods
  async getAllCurriculums(page = 0, size = 100) {
    const result = await this.makeRequest('/users/curriculums/get-all', {
      params: { page, size }
    });
    return this.processResponse(result, page, size);
  }

  async getCurriculumById(id) {
    const result = await this.makeRequest(`/users/curriculums/get-by-id/${id}`);
    return this.transformCurriculumData(result.data);
  }

  async getCurriculumsBySchool(schoolId, page = 0, size = 10) {
    const result = await this.makeRequest(`/users/curriculums/school/${schoolId}`, {
      params: { page, size }
    });
    return this.processResponse(result, page, size);
  }

  async getCurriculumsByDepartment(departmentId, page = 0, size = 10) {
    const result = await this.makeRequest(`/users/curriculums/department/${departmentId}`, {
      params: { page, size }
    });
    return this.processResponse(result, page, size);
  }

  async getCurriculumsByAcademicLevel(academicLevelId, page = 0, size = 10) {
    const result = await this.makeRequest(`/users/curriculums/academic-level/${academicLevelId}`, {
      params: { page, size }
    });
    return this.processResponse(result, page, size);
  }

  async searchCurriculums(searchCriteria, page = 0, size = 10) {
    const result = await this.makeRequest('/users/curriculums/search', {
      method: 'POST',
      body: searchCriteria,
      params: { page, size }
    });
    return { ...this.processResponse(result, page, size), searchCriteria };
  }

   // Search by name with fallback
   async searchByName(name, page = 0, size = 10) {
    if (!name?.trim()) {
      return await this.getAllCurriculums(page, size);
    }
    try {
      // Try search endpoint first
      return await this.searchCurriculums({ name: name.trim() }, page, size);
    } catch (error) {
      console.warn('🔄 Search endpoint failed, using client-side filtering');
      
    
      const result = await this.getAllCurriculums(0, 500);
      const filtered = result.curriculums.filter(c => 
        c.title.toLowerCase().includes(name.toLowerCase()) ||
        c.department.toLowerCase().includes(name.toLowerCase()) ||
        (c.schoolName && c.schoolName.toLowerCase().includes(name.toLowerCase()))
      );

      const startIndex = page * size;
      const endIndex = startIndex + size;

      return {
        curriculums: filtered.slice(startIndex, endIndex),
        total: filtered.length,
        page,
        size,
        message: `Found ${filtered.length} matching curricula (client-side search)`,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filtered.length / size),
          totalElements: filtered.length,
          pageSize: size,
          hasNext: endIndex < filtered.length,
          hasPrevious: page > 0
        }
      };
    }
  }

  async searchByCode(code, page = 0, size = 10) {
    if (!code?.trim()) {
      return await this.getAllCurriculums(page, size);
    }
    return await this.searchCurriculums({ code: code.trim() }, page, size);
  }

  async getCurriculumsByProgram(program, page = 0, size = 20) {
    const academicLevelMap = {
      'bachelor': 1, 'bachelors': 1, 'undergraduate': 1,
      'masters': 2, 'master': 2, 'graduate': 2,
      'phd': 3, 'doctorate': 3, 'doctoral': 3
    };

    const academicLevelId = academicLevelMap[program.toLowerCase()];
    if (!academicLevelId) {
      return {
        curriculums: [], total: 0, page, size,
        message: `Unknown program: ${program}`, pagination: {}
      };
    }

    return await this.getCurriculumsByAcademicLevel(academicLevelId, page, size);
  }
}

const curriculumService = new CurriculumService();
export default curriculumService;