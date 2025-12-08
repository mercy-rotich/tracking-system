import authService from './authService';

class DepartmentService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🏢 Department Service initialized with base URL:', this.baseURL);
    
    // Initialize cache
    this.departmentCache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
    
    // School mapping cache
    this.schoolMappingCache = new Map();
    this.schoolMappingExpiry = null;
    this.SCHOOL_MAPPING_DURATION = 10 * 60 * 1000; // 10 minutes
  }

  buildApiUrl(endpoint) {
    const url = `${this.baseURL}/${endpoint}`;
    console.log('📍 Building API URL:', url);
    return url;
  }

  async getHeaders() {
    try {
     
      const token = await authService.getValidToken();
      
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
      if (!authService.isAuthenticated()) {
        return false;
      }
      // authService.getValidToken() handles refresh logic automatically
      await authService.getValidToken(); 
      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      return false;
    }
  }

  // --- SCHOOL MAPPING & RESOLUTION ---
  
  async loadSchoolMapping() {
    // Return cached mapping if valid
    if (this.schoolMappingExpiry && Date.now() < this.schoolMappingExpiry && this.schoolMappingCache.size > 0) {
      return this.schoolMappingCache;
    }

    try {
      console.log('🔄 Loading school mapping...');
      
      // Dynamic import to avoid circular dependency
      const { default: curriculumService } = await import('./curriculumService');
      
      // 1. Get schools from Schools API
      let schoolsFromApi = [];
      try {
        const schoolsResult = await curriculumService.makeRequest('/schools/get-all');
        schoolsFromApi = Array.isArray(schoolsResult) ? schoolsResult : (schoolsResult.data || []);
      } catch (error) {
        console.warn('⚠️ Schools API failed:', error.message);
      }
      
      // 2. Get departments to extract school IDs
      let schoolIdsFromDepartments = new Map();
      try {
       
        const headers = await this.getHeaders();
        const response = await fetch(this.buildApiUrl('user/departments/get-all-departments?page=0&size=1000'), { headers });
        const deptResult = await response.json();
        
        const departments = deptResult.data?.departments || [];
        
        departments.forEach(dept => {
          if (dept.schoolId && dept.schoolName) {
            schoolIdsFromDepartments.set(dept.schoolName, dept.schoolId);
          }
        });
      } catch (error) {
        console.warn('⚠️ Could not get departments for school mapping:', error.message);
      }
      
      // 3. Get curricula to extract school IDs
      let schoolIdsFromCurricula = new Map();
      try {
        const curriculaResult = await curriculumService.getAllCurriculums(0, 1000);
        curriculaResult.curriculums.forEach(curriculum => {
          if (curriculum.schoolId && curriculum.schoolName) {
            schoolIdsFromCurricula.set(curriculum.schoolName, curriculum.schoolId);
          }
        });
      } catch (error) {
        console.warn('⚠️ Could not get curricula for school mapping:', error.message);
      }
      
      // MERGE EVERYTHING INTO CACHE
      this.schoolMappingCache.clear();
      
      schoolsFromApi.forEach(school => {
        let numericId = null;
        
        numericId = schoolIdsFromDepartments.get(school.name);
        
        if (!numericId) {
          numericId = schoolIdsFromCurricula.get(school.name);
        }
        
        if (numericId && !isNaN(parseInt(numericId))) {
          const parsedId = parseInt(numericId);
          
          if (school.code) {
            this.schoolMappingCache.set(school.code, parsedId);
          }
          
          if (school.name) {
            this.schoolMappingCache.set(school.name, parsedId);
          }
        }
      });
      
      // Process found IDs
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
        return parsed;
      }
    }

    const availableKeys = Array.from(mapping.keys()).slice(0, 10);
    throw new Error(`Cannot resolve school identifier "${schoolIdentifier}" to a valid numeric ID. Available mappings (first 10): ${availableKeys.join(', ')}. Total mappings: ${mapping.size}`);
  }

  // --- CACHE MANAGEMENT ---

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

  // --- FALLBACK METHODS ---

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

  // --- API METHODS ---

  async getAllDepartments(page = 0, size = 50, sortBy = 'id', sortDir = 'desc', search = '') {
    const cacheKey = `all-departments-${page}-${size}-${sortBy}-${sortDir}-${search}`;
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('📦 Returning cached departments');
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
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
        
        throw new Error(`API Error (${response.status}): ${responseText}`);
      }

      const result = await response.json();
      
      const departments = result.data?.departments || [];
      this.setCache(cacheKey, departments);
      
      return departments;
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      
      try {
        const fallbackResult = await this.getDepartmentsFromCurriculums();
        if (fallbackResult.length > 0) {
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
      } catch (resolveError) {
        console.error(`❌ Could not resolve school ID "${schoolId}":`, resolveError.message);
        const fallbackResult = await this.getDepartmentsFromCurriculums(schoolId);
        if (fallbackResult.length > 0) {
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
          this.setCache(cacheKey, fallbackResult);
          return fallbackResult;
        }
        
        throw new Error(`Failed to fetch departments by school: ${errorText}`);
      }

      const result = await response.json();
      const departments = result.data?.departments || [];
      this.setCache(cacheKey, departments);
      
      return departments;
    } catch (error) {
      console.error('❌ Error fetching school departments:', error);
      
      try {
        const fallbackResult = await this.getDepartmentsFromCurriculums(schoolId);
        if (fallbackResult.length > 0) {
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
      return cached;
    }

    try {
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl(`user/departments/department/${departmentId}`);
      
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch department: ${errorText}`);
      }

      const result = await response.json();
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
      let resolvedSchoolId;
      try {
        resolvedSchoolId = await this.resolveSchoolId(schoolId);
      } catch (resolveError) {
        const fallbackDepartments = await this.getDepartmentsBySchool(schoolId, 0, 1000);
        return fallbackDepartments.length;
      }
      
      await this.checkAuthAndRefresh();
      const headers = await this.getHeaders();
      
      const url = this.buildApiUrl(`user/departments/school/${resolvedSchoolId}/count`);
      
      const response = await fetch(url, { method: 'GET', headers });

      if (!response.ok) {
        const fallbackDepartments = await this.getDepartmentsBySchool(schoolId, 0, 1000);
        return fallbackDepartments.length;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      try {
        const departments = await this.getDepartmentsBySchool(schoolId, 0, 1000);
        return departments.length;
      } catch (fallbackError) {
        return 0;
      }
    }
  }

  async searchDepartments(searchTerm, page = 0, size = 50, sortBy = 'name', sortDir = 'asc') {
    try {
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
        return [];
      }
    }
  }

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
      console.log('1. Base URL Check:', this.baseURL);
      
      console.log('2. Authentication Check:');
      const isValid = await this.checkAuthAndRefresh();
      console.log('   Is Authenticated:', isValid);
      
      if (!isValid) {
        return { success: false, error: 'No authentication token found' };
      }

      console.log('3. School Mapping Check:');
      const mapping = await this.loadSchoolMapping();
      console.log('   Available school mappings:', Array.from(mapping.entries()));

      console.log('4. Testing getAllDepartments...');
      try {
        const allDepts = await this.getAllDepartments(0, 5);
        console.log('   ✅ Success! Loaded', allDepts.length, 'departments');
      } catch (error) {
        console.log('   ❌ Failed:', error.message);
      }

      return {
        success: true,
        message: 'Diagnosis completed - check console for detailed results'
      };
      
    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      return { success: false, error: error.message };
    }
  }
}

const departmentService = new DepartmentService();

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