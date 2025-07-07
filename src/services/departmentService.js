import authService from './authService';

class DepartmentService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    console.log('🏢 Department Service initialized with base URL:', this.baseURL);
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

  async checkAdminPermissions() {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) return false;

      if (token.includes('.')) {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          const hasAdminRole = payload.roles && payload.roles.includes('ADMIN');
          const isAdminFlag = payload.isAdmin === true;
          return hasAdminRole || isAdminFlag;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Error checking admin permissions:', error);
      return false;
    }
  }

  // Get all departments 
  async getAllDepartments(page = 0, size = 50, sortBy = 'id', sortDir = 'desc', search = '') {
    try {
      console.log('🔄 Fetching all departments...');
      
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

      const url = `${this.baseURL}/api/v1/user/departments/get-all-departments?${params}`;
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Error response:', responseText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Please check your authentication.');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access departments.');
        }
        
        throw new Error(`API Error (${response.status}): ${responseText}`);
      }

      const result = await response.json();
      console.log('✅ Departments API response:', result);
      
  
      const departments = result.data?.departments || [];
      
      console.log('✅ Extracted departments:', departments.length);
      
      
      return departments;
    } catch (error) {
      console.error('❌ Error fetching departments:', error);
      throw error;
    }
  }

  
  async getDepartmentsBySchool(schoolId, page = 0, size = 50, sortBy = 'name', sortDir = 'asc', search = '') {
    try {
      console.log(`🔄 Fetching departments for school ${schoolId}...`);
      
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
      
      const url = `${this.baseURL}/api/v1/user/departments/school/${schoolId}?${params}`;
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch departments by school: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ School departments response:', result);
      
      
      return result.data?.departments || [];
    } catch (error) {
      console.error('❌ Error fetching school departments:', error);
      throw error;
    }
  }

  
  async getDepartmentById(departmentId) {
    try {
      console.log(` Fetching department ${departmentId}...`);
      
      const headers = await this.getHeaders();
      
      const url = `${this.baseURL}/api/v1/user/departments/department/${departmentId}`;
      console.log(' Request URL:', url);
      
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
      
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching department:', error);
      throw error;
    }
  }

  
  async getDepartmentCountBySchool(schoolId) {
    try {
      console.log(`🔢 Fetching department count for school ${schoolId}...`);
      
      const headers = await this.getHeaders();
      
      const url = `${this.baseURL}/api/v1/user/departments/school/${schoolId}/count`;
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch department count: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Department count response:', result);
      
      return result.data; 
    } catch (error) {
      console.error('❌ Error fetching department count:', error);
      throw error;
    }
  }

 
  async searchDepartments(searchTerm, page = 0, size = 50, sortBy = 'name', sortDir = 'asc') {
    try {
      console.log(` Searching departments for: "${searchTerm}"`);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllDepartments(page, size, sortBy, sortDir);
      }
      
      return await this.getAllDepartments(page, size, sortBy, sortDir, searchTerm);
    } catch (error) {
      console.error('❌ Error searching departments:', error);
      throw error;
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
      throw error;
    }
  }

  
  async getDepartmentsBySchoolGrouped() {
    try {
      const departments = await this.getAllDepartmentsSimple();
      
      // Group departments by school
      const grouped = departments.reduce((acc, dept) => {
        const schoolId = dept.schoolId;
        if (!acc[schoolId]) {
          acc[schoolId] = {
            schoolId: dept.schoolId,
            schoolName: dept.schoolName,
            departments: []
          };
        }
        acc[schoolId].departments.push(dept);
        return acc;
      }, {});

      return Object.values(grouped);
    } catch (error) {
      console.error('❌ Error fetching grouped departments:', error);
      throw error;
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
        // Search across all schools
        return await this.searchDepartments(searchTerm, page, size, sortBy, sortDir);
      }
    } catch (error) {
      console.error('❌ Error in advanced search:', error);
      throw error;
    }
  }

 
  async createDepartment(departmentData) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}/admin/departments/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create department: ${errorText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('❌ Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId, departmentData) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}/admin/departments/update/${departmentId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update department: ${errorText}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('❌ Error updating department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId) {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseURL}/admin/departments/delete/${departmentId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete department: ${errorText}`);
      }

      const result = await response.json();
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

  // Diagnostic method
  async diagnoseIssue() {
    console.log('🔍 DEPARTMENT SERVICE DIAGNOSIS');
    console.log('=====================================');
    
    try {
      console.log('1. Basic Authentication Check:');
      const token = localStorage.getItem('sessionToken');
      console.log('   Token exists:', !!token);
      
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      console.log('2. Testing getAllDepartments...');
      const allDepts = await this.getAllDepartments(0, 5);
      console.log('   ✅ Success! Loaded', allDepts.length, 'departments');

      console.log('3. Testing getDepartmentsBySchool...');
      const schoolDepts = await this.getDepartmentsBySchool(1, 0, 3);
      console.log('   ✅ Success! Loaded', schoolDepts.length, 'school departments');

      console.log('4. Testing getDepartmentById...');
      if (allDepts.length > 0) {
        const dept = await this.getDepartmentById(allDepts[0].id);
        console.log('   ✅ Success! Fetched department:', dept.name);
      }

      console.log('5. Testing getDepartmentCountBySchool...');
      const count = await this.getDepartmentCountBySchool(1);
      console.log('   ✅ Success! School has', count, 'departments');

      console.log('6. Testing search...');
      const searchResults = await this.searchDepartments('engineering', 0, 3);
      console.log('   ✅ Success! Found', searchResults.length, 'departments with "engineering"');
      
      return {
        success: true,
        totalDepartments: allDepts.length,
        schoolDepartments: schoolDepts.length,
        schoolDepartmentCount: count,
        searchResults: searchResults.length
      };
      
    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      return {
        success: false,
        error: error.message,
        suggestions: [
          'Check if your user account has proper permissions',
          'Verify the API endpoints are correct',
          'Try logging out and logging back in',
          'Contact your system administrator'
        ]
      };
    }
  }
}

const departmentService = new DepartmentService();

//  debugging tools to window
if (typeof window !== 'undefined') {
  window.departmentService = departmentService;
  window.diagnoseDepartments = () => departmentService.diagnoseIssue();
  window.testDepartmentSearch = (term) => departmentService.searchDepartments(term);
  window.testSchoolDepartments = (schoolId) => departmentService.getDepartmentsBySchool(schoolId);
}

export default departmentService;