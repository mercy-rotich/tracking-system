import authService from './authService';

class DepartmentService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🏢 Department Service initialized with base URL:', this.baseURL);
    
    
    this.departmentCache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; 
    
    
    this.schoolMappingCache = new Map();
    this.schoolMappingExpiry = null;
    this.SCHOOL_MAPPING_DURATION = 10 * 60 * 1000; 
  }
  buildApiUrl(endpoint) {
    const url = `${this.baseURL}/${endpoint}`;
    console.log('📍 Building API URL:', url);
    return url;
  }

  async getHeaders() {
    try {
      const token = localStorage.getItem('sessionToken');
      
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('❌ Failed to prepare auth headers:', error);
      throw error;
    }
  }

  async checkAuthAndRefresh() {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        throw new Error('No authentication token available');
      }

      
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry) {
        const expiryTime = new Date(tokenExpiry).getTime();
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;
        
        
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('🔄 Token about to expire, attempting refresh...');
          
          try {
            await authService.refreshToken();
            console.log('✅ Token refreshed successfully');
            return true;
          } catch (refreshError) {
            console.warn('⚠️ Token refresh failed, will try with current token:', refreshError.message);
            
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  
  async loadSchoolMapping() {
    
    if (this.schoolMappingExpiry && Date.now() < this.schoolMappingExpiry && this.schoolMappingCache.size > 0) {
      return this.schoolMappingCache;
    }

    try {
      console.log('🔄 Loading school mapping...');
      
      
      const { default: curriculumService } = await import('./curriculumService');
      
      
      let schoolsFromApi = [];
      try {
        const schoolsResult = await curriculumService.makeRequest('/schools/get-all');
        schoolsFromApi = Array.isArray(schoolsResult) ? schoolsResult : (schoolsResult.data || []);
        console.log('✅ Schools from API:', schoolsFromApi);
      } catch (error) {
        console.warn('⚠️ Schools API failed:', error.message);
      }
      
      //  Get departments to extract school IDs
      let schoolIdsFromDepartments = new Map();
      try {
        console.log('🔄 Trying to get school IDs from departments API...');
        const deptResult = await this.makeRequest('user/departments/get-all-departments?page=0&size=1000');
        const departments = deptResult.data?.departments || [];
        
        departments.forEach(dept => {
          if (dept.schoolId && dept.schoolName) {
            schoolIdsFromDepartments.set(dept.schoolName, dept.schoolId);
            console.log(`📝 Found school mapping from departments: ${dept.schoolName} -> ${dept.schoolId}`);
          }
        });
      } catch (error) {
        console.warn('⚠️ Could not get departments for school mapping:', error.message);
      }
      
      //  Get curricula to extract school IDs
      let schoolIdsFromCurricula = new Map();
      try {
        const curriculaResult = await curriculumService.getAllCurriculums(0, 1000);
        curriculaResult.curriculums.forEach(curriculum => {
          if (curriculum.schoolId && curriculum.schoolName) {
            schoolIdsFromCurricula.set(curriculum.schoolName, curriculum.schoolId);
            console.log(`📝 Found school mapping from curricula: ${curriculum.schoolName} -> ${curriculum.schoolId}`);
          }
        });
      } catch (error) {
        console.warn('⚠️ Could not get curricula for school mapping:', error.message);
      }
      
  
      this.schoolMappingCache.clear();
      
      
      schoolsFromApi.forEach(school => {
        let numericId = null;
        
    
        numericId = schoolIdsFromDepartments.get(school.name);
        
        
        if (!numericId) {
          numericId = schoolIdsFromCurricula.get(school.name);
        }
        
        if (numericId && !isNaN(parseInt(numericId))) {
          const parsedId = parseInt(numericId);
          
          // Map code -> numeric ID
          if (school.code) {
            this.schoolMappingCache.set(school.code, parsedId);
            console.log(`📝 Mapped school code: ${school.code} -> ${parsedId}`);
          }
          
          // Map name -> numeric ID
          if (school.name) {
            this.schoolMappingCache.set(school.name, parsedId);
            console.log(`📝 Mapped school name: ${school.name} -> ${parsedId}`);
          }
        } else {
          console.warn(`⚠️ Could not find numeric ID for school: ${school.name} (${school.code})`);
        }
      });
      

      schoolIdsFromDepartments.forEach((numericId, schoolName) => {
        if (!isNaN(parseInt(numericId))) {
          const parsedId = parseInt(numericId);
          this.schoolMappingCache.set(schoolName, parsedId);
          
          
          const matchingSchool = schoolsFromApi.find(s => s.name === schoolName);
          if (matchingSchool && matchingSchool.code) {
            this.schoolMappingCache.set(matchingSchool.code, parsedId);
          }
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
      console.log('✅ School mapping loaded:', Array.from(this.schoolMappingCache.entries()));
      
      return this.schoolMappingCache;
    } catch (error) {
      console.error('❌ Failed to load school mapping:', error);
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
        console.log(`🔍 Resolved school identifier "${schoolIdentifier}" to ID: ${parsed}`);
        return parsed;
      } else {
        console.warn(`⚠️ School mapping returned invalid numeric ID: ${numericId} for ${schoolIdentifier}`);
      }
    }

   
    const availableKeys = Array.from(mapping.keys()).slice(0, 10); 
    throw new Error(`Cannot resolve school identifier "${schoolIdentifier}" to a valid numeric ID. Available mappings (first 10): ${availableKeys.join(', ')}. Total mappings: ${mapping.size}`);
  }

 
  isCacheValid(key) {
    const expiry = this.cacheExpiry.get(key);
    return expiry && Date.now() < expiry;
  }

  setCache(key, data) {
    this.departmentCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

 
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.departmentCache.get(key);
    }
    return null;
  }

  
  clearCache() {
    this.departmentCache.clear();
    this.cacheExpiry.clear();
   
    this.schoolMappingCache.clear();
    this.schoolMappingExpiry = null;
  }

 
  async getDepartmentsFromCurriculums(schoolId = null) {
    try {
      console.log('🔄 Fallback: Extracting departments from curriculum data...');
      
      
      const { default: curriculumService } = await import('./curriculumService');
      
      let result;
      if (schoolId && schoolId !== 'all') {
       
        try {
          const resolvedId = await this.resolveSchoolId(schoolId);
          result = await curriculumService.getCurriculumsBySchool(resolvedId, 0, 1000);
        } catch (resolveError) {
          console.warn('⚠️ Could not resolve school ID for curriculum fallback, trying original ID:', resolveError.message);
          result = await curriculumService.getCurriculumsBySchool(schoolId, 0, 1000);
        }
      } else {
        result = await curriculumService.getAllCurriculums(0, 1000);
      }
      
      const departmentsMap = new Map();
      
      result.curriculums.forEach(curriculum => {
        if (curriculum.department && curriculum.departmentId) {
          const deptKey = `${curriculum.departmentId}-${curriculum.department}`;
          if (!departmentsMap.has(deptKey)) {
            departmentsMap.set(deptKey, {
              id: curriculum.departmentId,
              name: curriculum.department,
              schoolId: curriculum.schoolId,
              schoolName: curriculum.schoolName,
              curriculumCount: 1,
              source: 'curriculum_fallback'
            });
          } else {
            departmentsMap.get(deptKey).curriculumCount++;
          }
        }
      });
      
      const departments = Array.from(departmentsMap.values());
      console.log(`✅ Extracted ${departments.length} departments from curriculum data`);
      return departments;
      
    } catch (error) {
      console.error('❌ Fallback extraction failed:', error);
      return [];
    }
  }

 

  async getAllDepartments(page = 0, size = 50, sortBy = 'id', sortDir = 'desc', search = '') {
    const cacheKey = `all-departments-${page}-${size}-${sortBy}-${sortDir}-${search}`;
    
   
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(' Returning cached departments');
      return cached;
    }

    try {
      console.log('🔄 Fetching all departments...');
      
      await this.checkAuthAndRefresh();
      
      const headers = await this.getHeaders();
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });

      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const url = this.buildApiUrl(`user/departments/get-all-departments?${params}`);
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Error response:', responseText);
        
      
        console.log('🔄 API failed, using fallback strategy...');
        const fallbackResult = await this.getDepartmentsFromCurriculums();
        if (fallbackResult.length > 0) {
          console.log('✅ Using fallback departments data');
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
        
        throw new Error(`API Error (${response.status}): ${responseText}`);
      }

      const result = await response.json();
      console.log('✅ Departments API response:', result);
      
      const departments = result.data?.departments || [];
      console.log('✅ Extracted departments:', departments.length);
      
      this.setCache(cacheKey, departments);
      
      return departments;
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      
     
      try {
        const fallbackResult = await this.getDepartmentsFromCurriculums();
        if (fallbackResult.length > 0) {
          console.log('✅ Using fallback departments data');
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      
    
      console.warn('⚠️ Returning empty departments array');
      return [];
    }
  }

  async getDepartmentsBySchool(schoolId, page = 0, size = 50, sortBy = 'name', sortDir = 'asc', search = '') {
    const cacheKey = `school-departments-${schoolId}-${page}-${size}-${sortBy}-${sortDir}-${search}`;
    
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`📦 Returning cached departments for school ${schoolId}`);
      return cached;
    }

    try {
      console.log(`🔄 Fetching departments for school ${schoolId}...`);
      
      let resolvedSchoolId;
      try {
        resolvedSchoolId = await this.resolveSchoolId(schoolId);
        console.log(`🔍 Resolved school ID: ${schoolId} -> ${resolvedSchoolId}`);
      } catch (resolveError) {
        console.error(`❌ Could not resolve school ID "${schoolId}":`, resolveError.message);
       
        const fallbackResult = await this.getDepartmentsFromCurriculums(schoolId);
        if (fallbackResult.length > 0) {
          console.log(`✅ Using fallback departments data for unresolved school ${schoolId}`);
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
        throw resolveError;
      }
      
    
      await this.checkAuthAndRefresh();
      
      const headers = await this.getHeaders();
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });

      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
     
      const url = this.buildApiUrl(`user/departments/school/${resolvedSchoolId}?${params}`);
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        
        console.log('🔄 API failed, using fallback strategy...');
        const fallbackResult = await this.getDepartmentsFromCurriculums(schoolId);
        if (fallbackResult.length > 0) {
          console.log(`✅ Using fallback departments data for school ${schoolId}`);
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
        
        throw new Error(`Failed to fetch departments by school: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ School departments response:', result);
      
      const departments = result.data?.departments || [];
      
     
      this.setCache(cacheKey, departments);
      
      return departments;
    } catch (error) {
      console.error('❌ Error fetching school departments:', error);
      
     
      try {
        const fallbackResult = await this.getDepartmentsFromCurriculums(schoolId);
        if (fallbackResult.length > 0) {
          console.log(`✅ Using fallback departments data for school ${schoolId}`);
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      
    
      console.warn(`⚠️ Returning empty departments array for school ${schoolId}`);
      return [];
    }
  }

  
  async getDepartmentById(departmentId) {
    const cacheKey = `department-${departmentId}`;
    
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`📦 Returning cached department ${departmentId}`);
      return cached;
    }

    try {
      console.log(`🔍 Fetching department ${departmentId}...`);
      
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl(`user/departments/department/${departmentId}`);
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch department: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Department response:', result);
      
      const department = result.data;
      
     
      this.setCache(cacheKey, department);
      
      return department;
    } catch (error) {
      console.error('❌ Error fetching department:', error);
      throw error;
    }
  }

  async getDepartmentCountBySchool(schoolId) {
    try {
      console.log(`🔢 Fetching department count for school ${schoolId}...`);
      
      
      let resolvedSchoolId;
      try {
        resolvedSchoolId = await this.resolveSchoolId(schoolId);
      } catch (resolveError) {
        console.error(`❌ Could not resolve school ID for count "${schoolId}":`, resolveError.message);
       
        const fallbackDepartments = await this.getDepartmentsBySchool(schoolId, 0, 1000);
        return fallbackDepartments.length;
      }
      
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl(`user/departments/school/${resolvedSchoolId}/count`);
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        
        const fallbackDepartments = await this.getDepartmentsBySchool(schoolId, 0, 1000);
        return fallbackDepartments.length;
      }

      const result = await response.json();
      console.log('✅ Department count response:', result);
      
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching department count:', error);
      
      try {
        const departments = await this.getDepartmentsBySchool(schoolId, 0, 1000);
        return departments.length;
      } catch (fallbackError) {
        console.error('❌ Fallback count failed:', fallbackError);
        return 0;
      }
    }
  }

 
  async searchDepartments(searchTerm, page = 0, size = 50, sortBy = 'name', sortDir = 'asc') {
    try {
      console.log(`🔍 Searching departments for: "${searchTerm}"`);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllDepartments(page, size, sortBy, sortDir);
      }
      
      return await this.getAllDepartments(page, size, sortBy, sortDir, searchTerm);
    } catch (error) {
      console.error('❌ Error searching departments:', error);
      
      
      try {
        const allDepartments = await this.getDepartmentsFromCurriculums();
        const filtered = allDepartments.filter(dept =>
          dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
       
        const start = page * size;
        const end = start + size;
        return filtered.slice(start, end);
      } catch (fallbackError) {
        console.error('❌ Fallback search failed:', fallbackError);
        return [];
      }
    }
  }

  async getAllDepartmentsSimple() {
    try {
      console.log('🔄 Fetching all departments for dropdown...');
      
      const departments = await this.getAllDepartments(0, 1000, 'name', 'asc');
      
      return departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        schoolId: dept.schoolId,
        schoolName: dept.schoolName,
        curriculumCount: dept.curriculumCount
      }));
    } catch (error) {
      console.error('❌ Error fetching departments for dropdown:', error);
      
      
      try {
        const fallbackDepartments = await this.getDepartmentsFromCurriculums();
        return fallbackDepartments.map(dept => ({
          id: dept.id,
          name: dept.name,
          code: dept.code,
          schoolId: dept.schoolId,
          schoolName: dept.schoolName,
          curriculumCount: dept.curriculumCount || 0
        }));
      } catch (fallbackError) {
        console.error('❌ Fallback for dropdown failed:', fallbackError);
        return [];
      }
    }
  }

 
  async searchDepartmentsAdvanced(options = {}) {
    const {
      searchTerm = '',
      schoolId = null,
      page = 0,
      size = 50,
      sortBy = 'name',
      sortDir = 'asc'
    } = options;

    try {
      if (schoolId && schoolId !== 'all') {
        return await this.getDepartmentsBySchool(schoolId, page, size, sortBy, sortDir, searchTerm);
      } else {
        return await this.searchDepartments(searchTerm, page, size, sortBy, sortDir);
      }
    } catch (error) {
      console.error('❌ Error in advanced search:', error);
      
      
      try {
        const allDepartments = await this.getDepartmentsFromCurriculums(schoolId);
        let filtered = allDepartments;
        
        if (searchTerm) {
          filtered = allDepartments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dept.code && dept.code.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        
        const start = page * size;
        const end = start + size;
        return filtered.slice(start, end);
      } catch (fallbackError) {
        console.error('❌ Advanced search fallback failed:', fallbackError);
        return [];
      }
    }
  }

  // Admin operations 
  async createDepartment(departmentData) {
    try {
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl('admin/departments/create');
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create department: ${errorText}`);
      }

      const result = await response.json();
      
      
      this.clearCache();
      
      return result.data || result;
    } catch (error) {
      console.error('❌ Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId, departmentData) {
    try {
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl(`admin/departments/update/${departmentId}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update department: ${errorText}`);
      }

      const result = await response.json();
      
      
      this.clearCache();
      
      return result.data || result;
    } catch (error) {
      console.error('❌ Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId) {
    try {
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl(`admin/departments/delete/${departmentId}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete department: ${errorText}`);
      }

      const result = await response.json();
      
      
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('❌ Error deleting department:', error);
      throw error;
    }
  }

  // Utility methods
  async getSchoolDepartmentStatistics(schoolId) {
    try {
      const [departments, count] = await Promise.all([
        this.getDepartmentsBySchool(schoolId),
        this.getDepartmentCountBySchool(schoolId)
      ]);

      return {
        departments,
        count,
        departmentNames: departments.map(d => d.name),
        totalCurriculums: departments.reduce((sum, d) => sum + (d.curriculumCount || 0), 0)
      };
    } catch (error) {
      console.error('❌ Error fetching school statistics:', error);
      throw error;
    }
  }

  
  async diagnoseIssue() {
    console.log('🔍 DEPARTMENT SERVICE DIAGNOSIS');
    console.log('=====================================');
    
    try {
      console.log('1. Base URL Check:');
      console.log('   Base URL:', this.baseURL);
      console.log('   Sample URL:', this.buildApiUrl('user/departments/get-all-departments'));
      
      console.log('2. Authentication Check:');
      const token = localStorage.getItem('sessionToken');
      console.log('   Token exists:', !!token);
      
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      console.log('3. Auth Status:');
      const authStatus = authService.getAuthStatus();
      console.log('   Is Authenticated:', authStatus.isAuthenticated);
      console.log('   Should Refresh:', authStatus.shouldRefresh);

      console.log('4. School Mapping Check:');
      const mapping = await this.loadSchoolMapping();
      console.log('   Available school mappings:', Array.from(mapping.entries()));

      console.log('5. Testing getAllDepartments...');
      try {
        const allDepts = await this.getAllDepartments(0, 5);
        console.log('   ✅ Success! Loaded', allDepts.length, 'departments');
      } catch (error) {
        console.log('   ❌ Failed:', error.message);
        console.log('   🔄 Trying fallback...');
        const fallbackDepts = await this.getDepartmentsFromCurriculums();
        console.log('   ✅ Fallback worked! Loaded', fallbackDepts.length, 'departments');
      }

      console.log('6. Testing getDepartmentsBySchool with resolution...');
      try {
        
        const schoolCodes = Array.from(mapping.keys()).filter(key => typeof key === 'string' && key.length <= 5);
        if (schoolCodes.length > 0) {
          const testSchoolCode = schoolCodes[0];
          console.log(`   Testing with school code: ${testSchoolCode}`);
          const schoolDepts = await this.getDepartmentsBySchool(testSchoolCode, 0, 3);
          console.log('   ✅ Success! Loaded', schoolDepts.length, 'school departments');
        }
      } catch (error) {
        console.log('   ❌ Failed:', error.message);
        console.log('   🔄 Trying fallback...');
        const fallbackSchoolDepts = await this.getDepartmentsFromCurriculums('SET');
        console.log('   ✅ Fallback worked! Loaded', fallbackSchoolDepts.length, 'departments');
      }

      return {
        success: true,
        message: 'Diagnosis completed - check console for detailed results',
        schoolMapping: Array.from(mapping.entries())
      };
      
    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      return {
        success: false,
        error: error.message,
        suggestions: [
          'Check if your user account has proper permissions',
          'Verify the API endpoints are correct',
          'Check if school IDs need to be numeric',
          'Try logging out and logging back in',
          'Check if the refresh token is working',
          'Contact your system administrator',
          'The fallback strategy using curriculum data should still work'
        ]
      };
    }
  }
}

const departmentService = new DepartmentService();

//  debugging tools 
if (typeof window !== 'undefined') {
  window.departmentService = departmentService;
  window.diagnoseDepartments = () => departmentService.diagnoseIssue();
  window.testDepartmentSearch = (term) => departmentService.searchDepartments(term);
  window.testSchoolDepartments = (schoolId) => departmentService.getDepartmentsBySchool(schoolId);
  window.clearDepartmentCache = () => departmentService.clearCache();
  window.testDepartmentUrl = (endpoint) => console.log('URL:', departmentService.buildApiUrl(endpoint));
  window.resolveSchoolId = (schoolId) => departmentService.resolveSchoolId(schoolId);
  window.loadSchoolMapping = () => departmentService.loadSchoolMapping();
}

export default departmentService;