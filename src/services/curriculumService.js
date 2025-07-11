import authService from "./authService";

class CurriculumService{
  constructor(){
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log( 'Curriculum Service initialized with base URL:' ,this.baseURL);
    
    // School mapping cache
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
          
          if (school.code) {
            this.schoolMappingCache.set(school.code, parsedId);
            console.log(`📝 [Curriculum Service] Mapped school code: ${school.code} -> ${parsedId}`);
          }
          
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

  // Centralized request method to handle all API calls
  async makeRequest(endpoint, options = {}) {
    const { method = 'GET', body = null, params = {} } = options;

    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`
    };

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again.')
        }
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }
      return await response.json();
    } catch (error) {
      console.error(`❌ Request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

 

  /**
   * Create a new curriculum
   * @param {Object} curriculumData 
   * @param {string} curriculumData.name 
   * @param {string} curriculumData.code
   * @param {number} curriculumData.durationSemesters
   * @param {string} curriculumData.effectiveDate 
   * @param {string} curriculumData.expiryDate 
   * @param {number} curriculumData.schoolId 
   * @param {number} curriculumData.departmentId 
   * @param {number} curriculumData.academicLevelId 
   * @returns {Promise<Object>} 
   */
  async createCurriculum(curriculumData) {
    try {
      console.log('🔄 [Curriculum Service] Creating curriculum:', curriculumData);
      
      // Validate required fields
      const requiredFields = ['name', 'code', 'durationSemesters', 'schoolId', 'departmentId', 'academicLevelId'];
      for (const field of requiredFields) {
        if (!curriculumData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const payload = {
        name: String(curriculumData.name).trim(),
        code: String(curriculumData.code).trim().toUpperCase(),
        durationSemesters: parseInt(curriculumData.durationSemesters),
        schoolId: parseInt(curriculumData.schoolId),
        departmentId: parseInt(curriculumData.departmentId),
        academicLevelId: parseInt(curriculumData.academicLevelId)
      };

      // Add optional dates if provided
      if (curriculumData.effectiveDate) {
        payload.effectiveDate = new Date(curriculumData.effectiveDate).toISOString();
      }
      if (curriculumData.expiryDate) {
        payload.expiryDate = new Date(curriculumData.expiryDate).toISOString();
      }

      const result = await this.makeRequest('/admin/curriculums/create', {
        method: 'POST',
        body: payload
      });

      console.log('✅ [Curriculum Service] Curriculum created successfully:', result);
      
      
      const transformedData = result.data ? this.transformCurriculumData(result.data) : null;
      
      return {
        success: true,
        message: result.message || 'Curriculum created successfully',
        data: transformedData,
        raw: result
      };
    } catch (error) {
      console.error('❌ [Curriculum Service] Failed to create curriculum:', error);
      throw new Error(`Failed to create curriculum: ${error.message}`);
    }
  }

  /**
   * Soft delete (inactivate) a curriculum
   * @param {number|string} curriculumId 
   * @param {Object} curriculumData
   * @returns {Promise<Object>} 
   */
  async inactivateCurriculum(curriculumId, curriculumData) {
    try {
      console.log('🔄 [Curriculum Service] Inactivating curriculum:', curriculumId);
      
      if (!curriculumId) {
        throw new Error('Curriculum ID is required');
      }

      // If curriculumData is not provided, try to fetch it first
      if (!curriculumData) {
        try {
          const existingCurriculum = await this.getCurriculumById(curriculumId);
          curriculumData = {
            name: existingCurriculum.title,
            code: existingCurriculum.code,
            durationSemesters: existingCurriculum.durationSemesters,
            effectiveDate: existingCurriculum.effectiveDate,
            expiryDate: existingCurriculum.expiryDate,
            schoolId: parseInt(existingCurriculum.schoolId),
            departmentId: existingCurriculum.departmentId,
            academicLevelId: this.mapProgramToAcademicLevel(existingCurriculum.programId)
          };
        } catch (fetchError) {
          console.warn('⚠️ Could not fetch curriculum data, proceeding with minimal data');
          curriculumData = {};
        }
      }

      const result = await this.makeRequest(`/admin/curriculums/delete/${curriculumId}`, {
        method: 'DELETE',
        body: curriculumData
      });

      console.log('✅ [Curriculum Service] Curriculum inactivated successfully:', result);
      
      return {
        success: true,
        message: result.message || 'Curriculum inactivated successfully',
        data: result.data
      };
    } catch (error) {
      console.error('❌ [Curriculum Service] Failed to inactivate curriculum:', error);
      throw new Error(`Failed to inactivate curriculum: ${error.message}`);
    }
  }

  /**
   * Permanently delete a curriculum
   * @param {number|string} curriculumId
   * @returns {Promise<Object>} 
   */
  async deleteCurriculumPermanently(curriculumId) {
    try {
      console.log('🔄 [Curriculum Service] Permanently deleting curriculum:', curriculumId);
      
      if (!curriculumId) {
        throw new Error('Curriculum ID is required');
      }

      const result = await this.makeRequest(`/admin/curriculums/permanent-delete/${curriculumId}`, {
        method: 'DELETE'
      });

      console.log('✅ [Curriculum Service] Curriculum permanently deleted:', result);
      
      return {
        success: true,
        message: result.message || 'Curriculum permanently deleted successfully',
        data: result.data
      };
    } catch (error) {
      console.error('❌ [Curriculum Service] Failed to permanently delete curriculum:', error);
      throw new Error(`Failed to permanently delete curriculum: ${error.message}`);
    }
  }

  /** 
   * @param {number|string} curriculumId
   * @param {Object} updateData 
   * @returns {Promise<Object>} 
   */
  async updateCurriculum(curriculumId, updateData) {
    try {
      console.log('🔄 [Curriculum Service] Updating curriculum:', curriculumId, updateData);
      
      if (!curriculumId) {
        throw new Error('Curriculum ID is required');
      }

     
      const payload = {};
      
      if (updateData.name) payload.name = String(updateData.name).trim();
      if (updateData.code) payload.code = String(updateData.code).trim().toUpperCase();
      if (updateData.durationSemesters !== undefined) payload.durationSemesters = parseInt(updateData.durationSemesters);
      if (updateData.schoolId !== undefined) payload.schoolId = parseInt(updateData.schoolId);
      if (updateData.departmentId !== undefined) payload.departmentId = parseInt(updateData.departmentId);
      if (updateData.academicLevelId !== undefined) payload.academicLevelId = parseInt(updateData.academicLevelId);
      
      if (updateData.effectiveDate) {
        payload.effectiveDate = new Date(updateData.effectiveDate).toISOString();
      }
      if (updateData.expiryDate) {
        payload.expiryDate = new Date(updateData.expiryDate).toISOString();
      }

     
      const result = await this.makeRequest(`/admin/curriculums/update/${curriculumId}`, {
        method: 'PUT', 
        body: payload
      });

      console.log('✅ [Curriculum Service] Curriculum updated successfully:', result);
      
      const transformedData = result.data ? this.transformCurriculumData(result.data) : null;
      
      return {
        success: true,
        message: result.message || 'Curriculum updated successfully',
        data: transformedData,
        raw: result
      };
    } catch (error) {
      console.error('❌ [Curriculum Service] Failed to update curriculum:', error);
      throw new Error(`Failed to update curriculum: ${error.message}`);
    }
  }

 
  mapProgramToAcademicLevel(programId) {
    const academicLevelMap = {
      'bachelor': 1,
      'masters': 2,
      'phd': 3
    };
    return academicLevelMap[programId] || 1;
  }

  
  mapAcademicLevelIdToProgram(academicLevelId) {
    const programMap = {
      1: 'bachelor',
      2: 'masters', 
      3: 'phd'
    };
    return programMap[academicLevelId] || 'bachelor';
  }

  
   // Validate curriculum data before sending to API
   
  validateCurriculumData(data) {
    const errors = [];
    
    if (!data.name || !data.name.trim()) {
      errors.push('Curriculum name is required');
    }
    
    if (!data.code || !data.code.trim()) {
      errors.push('Curriculum code is required');
    }
    
    if (!data.durationSemesters || data.durationSemesters < 1) {
      errors.push('Duration semesters must be a positive number');
    }
    
    if (!data.schoolId) {
      errors.push('School ID is required');
    }
    
    if (!data.departmentId) {
      errors.push('Department ID is required');
    }
    
    if (!data.academicLevelId) {
      errors.push('Academic level ID is required');
    }
    
    if (data.effectiveDate && data.expiryDate) {
      const effective = new Date(data.effectiveDate);
      const expiry = new Date(data.expiryDate);
      if (effective >= expiry) {
        errors.push('Expiry date must be after effective date');
      }
    }
    
    return errors;
  }

 
  formatCurriculumForAPI(formData) {
    const apiData = {
      name: formData.title || formData.name,
      code: formData.code,
      durationSemesters: parseInt(formData.duration) || parseInt(formData.durationSemesters),
      schoolId: parseInt(formData.schoolId),
      departmentId: parseInt(formData.departmentId),
      academicLevelId: this.mapProgramToAcademicLevel(formData.programId || formData.program)
    };

    // Add optional dates
    if (formData.effectiveDate) {
      apiData.effectiveDate = new Date(formData.effectiveDate).toISOString();
    }
    if (formData.expiryDate) {
      apiData.expiryDate = new Date(formData.expiryDate).toISOString();
    }

    return apiData;
  }

  

  processResponse(result, page = 0, size = 20) {
    let curriculums = [];
    let pagination = {};

    if (result.data?.curriculums) {
      curriculums = result.data.curriculums;
      pagination = result.data;
    } else if (Array.isArray(result.data)) {
      curriculums = result.data;
    } else if (Array.isArray(result)) {
      curriculums = result;
    }

    return {
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

  // Utility methods
  mapApiStatus(status) {
    const statusMap = {
      'UNDER_REVIEW': 'pending', 
      'APPROVED': 'approved', 
      'REJECTED': 'rejected',
      'DRAFT': 'draft', 
      'PENDING': 'pending', 
      'ACTIVE': 'approved', 
      'INACTIVE': 'rejected'
    };
    return statusMap[status] || 'draft';
  }

  mapAcademicLevelToProgram(level) {
    const programMap = {
      'PhD': 'phd', 
      'Master': 'masters', 
      'Masters': 'masters',
      'Bachelor': 'bachelor', 
      'Bachelors': 'bachelor', 
      'Undergraduate': 'bachelor'
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
    for (const [keyword, icon] of Object.entries(iconMap)) {
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
          actualId: curriculum.schoolId,
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

  // API methods
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
}

const curriculumService = new CurriculumService();

// debugging tools
if (typeof window !== 'undefined') {
  window.curriculumService = curriculumService;
  window.diagnoseCurriculumSchoolIds = () => curriculumService.diagnoseSchoolIdIssue();
  window.resolveCurriculumSchoolId = (schoolId) => curriculumService.resolveSchoolId(schoolId);
}

export default curriculumService;