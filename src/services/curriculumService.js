import authService from "./authService";

class CurriculumService{
  constructor(){
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log( 'Curriculum Service initialized with base URL:' ,this.baseURL);
    
  
    this.schoolMappingCache = new Map();
    this.schoolMappingExpiry = null;
    this.SCHOOL_MAPPING_DURATION = 10 * 60 * 1000; 
  }

  
  async loadSchoolMapping() {
    
    if (this.schoolMappingExpiry && Date.now() < this.schoolMappingExpiry && this.schoolMappingCache.size > 0) {
      return this.schoolMappingCache;
    }

    try {
      console.log('🔄 [Curriculum Service] Loading school mapping...');
      
      
      let schoolsFromApi = [];
      try {
        const schoolsResult = await this.makeRequest('/schools/get-all');
        schoolsFromApi = Array.isArray(schoolsResult) ? schoolsResult : (schoolsResult.data || []);
        console.log('✅ [Curriculum Service] Schools from API:', schoolsFromApi);
      } catch (error) {
        console.warn('⚠️ [Curriculum Service] Schools API failed:', error.message);
      }
      
    
      let schoolIdsFromCurricula = new Map();
      try {
        const curriculaResult = await this.getAllCurriculums(0, 1000);
        curriculaResult.curriculums.forEach(curriculum => {
          if (curriculum.schoolId && curriculum.schoolName) {
            // Store the schoolId as it appears in the curriculum data
            const numericId = parseInt(curriculum.schoolId);
            if (!isNaN(numericId)) {
              schoolIdsFromCurricula.set(curriculum.schoolName, numericId);
              console.log(`📝 [Curriculum Service] Found school mapping from curricula: ${curriculum.schoolName} -> ${numericId}`);
            }
          }
        });
      } catch (error) {
        console.warn('⚠️ [Curriculum Service] Could not get curricula for school mapping:', error.message);
      }
      
      
      this.schoolMappingCache.clear();
      
     
      schoolsFromApi.forEach(school => {
        let numericId = null;
        
        
        numericId = schoolIdsFromCurricula.get(school.name);
        
        if (numericId && !isNaN(parseInt(numericId))) {
          const parsedId = parseInt(numericId);
          
          // Map code -> numeric ID
          if (school.code) {
            this.schoolMappingCache.set(school.code, parsedId);
            console.log(`📝 [Curriculum Service] Mapped school code: ${school.code} -> ${parsedId}`);
          }
          
          // Map name -> numeric ID
          if (school.name) {
            this.schoolMappingCache.set(school.name, parsedId);
            console.log(`📝 [Curriculum Service] Mapped school name: ${school.name} -> ${parsedId}`);
          }
        } else {
          console.warn(`⚠️ [Curriculum Service] Could not find numeric ID for school: ${school.name} (${school.code})`);
        }
      });
      
      
      schoolIdsFromCurricula.forEach((numericId, schoolName) => {
        if (!isNaN(parseInt(numericId))) {
          const parsedId = parseInt(numericId);
          if (!this.schoolMappingCache.has(schoolName)) {
            this.schoolMappingCache.set(schoolName, parsedId);
          }
          
         
          const matchingSchool = schoolsFromApi.find(s => s.name === schoolName);
          if (matchingSchool && matchingSchool.code && !this.schoolMappingCache.has(matchingSchool.code)) {
            this.schoolMappingCache.set(matchingSchool.code, parsedId);
          }
        }
      });
      
      this.schoolMappingExpiry = Date.now() + this.SCHOOL_MAPPING_DURATION;
      console.log('✅ [Curriculum Service] School mapping loaded:', Array.from(this.schoolMappingCache.entries()));
      
      return this.schoolMappingCache;
    } catch (error) {
      console.error('❌ [Curriculum Service] Failed to load school mapping:', error);
      return this.schoolMappingCache; 
    }
  }

  async resolveSchoolId(schoolIdentifier) {
    
    if (schoolIdentifier === null || schoolIdentifier === undefined) {
      throw new Error('School identifier is null or undefined');
    }

    const schoolIdStr = String(schoolIdentifier);
    
   
    if (/^\d+$/.test(schoolIdStr)) {
      const numericId = parseInt(schoolIdStr);
      if (!isNaN(numericId) && numericId > 0) {
        return numericId;
      }
    }

   
    const mapping = await this.loadSchoolMapping();
    
   
    const numericId = mapping.get(schoolIdentifier);
    
    if (numericId !== undefined && numericId !== null) {
      const parsed = parseInt(String(numericId));
      if (!isNaN(parsed) && parsed > 0) {
        console.log(`🔍 [Curriculum Service] Resolved school identifier "${schoolIdentifier}" to ID: ${parsed}`);
        return parsed;
      } else {
        console.warn(`⚠️ [Curriculum Service] School mapping returned invalid numeric ID: ${numericId} for ${schoolIdentifier}`);
      }
    }

    const availableKeys = Array.from(mapping.keys()).slice(0, 10); 
    throw new Error(`Cannot resolve school identifier "${schoolIdentifier}" to a valid numeric ID. Available mappings (first 10): ${availableKeys.join(', ')}. Total mappings: ${mapping.size}`);
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
      
     
      let schoolIdMapping = new Map();
      try {
        
        const curriculaResult = await this.getAllCurriculums(0, 1000);
        curriculaResult.curriculums.forEach(curriculum => {
          if (curriculum.schoolId && curriculum.schoolName) {
            const numericId = parseInt(curriculum.schoolId);
            if (!isNaN(numericId)) {
              schoolIdMapping.set(curriculum.schoolName, numericId);
            }
          }
        });
      } catch (error) {
        console.warn('⚠️ Could not get school IDs from curricula:', error.message);
      }
      
      const schools = schoolsData.map((school, index) => {
       
        const numericId = schoolIdMapping.get(school.name);
        
        return {
          id: school.code || `school_${index}`, 
          actualId: numericId || null,
          name: school.name,
          code: school.code,
          deanId: school.deanId,
          icon: this.getSchoolIcon(school.name),
          source: 'api'
        };
      });
      
      console.log('✅ Schools loaded from API with numeric ID mapping:', schools);
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
      
      const mergedSchools = new Map();
      
      schoolsFromApi.forEach((school, index) => {
        const schoolData = {
          id: school.code || `api_school_${index}`, 
          actualId: school.id, 
          name: school.name,
          code: school.code,
          deanId: school.deanId,
          icon: this.getSchoolIcon(school.name),
          source: 'api'
        };
        mergedSchools.set(school.code || school.name, schoolData);
      });
      
      schoolsFromCurricula.forEach((school, schoolId) => {
        
        const existingSchool = Array.from(mergedSchools.values())
          .find(s => s.name.toLowerCase() === school.name.toLowerCase());
        
        if (!existingSchool) {
          
          mergedSchools.set(schoolId, {
            id: schoolId,
            actualId: schoolId, 
            name: school.name,
            icon: this.getSchoolIcon(school.name),
            source: 'curricula'
          });
        } else {
          
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
          actualId: curriculum.schoolId, // Assume curriculum data has correct IDs
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
    
    let resolvedSchoolId;
    try {
      resolvedSchoolId = await this.resolveSchoolId(schoolId);
      console.log(`🔍 [Curriculum Service] Resolved school ID: ${schoolId} -> ${resolvedSchoolId}`);
    } catch (resolveError) {
      console.warn(`⚠️ [Curriculum Service] Could not resolve school ID "${schoolId}", trying original:`, resolveError.message);
      resolvedSchoolId = schoolId;
    }
    
    const result = await this.makeRequest(`/users/curriculums/school/${resolvedSchoolId}`, {
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

   async searchByName(name, page = 0, size = 10) {
    if (!name?.trim()) {
      return await this.getAllCurriculums(page, size);
    }
    try {
      
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

  // Debugging method
  
}

const curriculumService = new CurriculumService();

// debugging tools
if (typeof window !== 'undefined') {
  window.curriculumService = curriculumService;
  window.diagnoseCurriculumSchoolIds = () => curriculumService.diagnoseSchoolIdIssue();
  window.resolveCurriculumSchoolId = (schoolId) => curriculumService.resolveSchoolId(schoolId);
}

export default curriculumService;