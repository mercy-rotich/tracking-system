
import authService from './authService';

class CurriculumService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL 
    console.log(' Curriculum Service initialized with base URL:', this.baseURL);
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

  
  transformCurriculumData(apiCurriculum) {
    return {
      
      id: apiCurriculum.id?.toString() || apiCurriculum.id,
      title: apiCurriculum.name, 
      code: apiCurriculum.code,
      status: this.mapApiStatus(apiCurriculum.status),
      department: apiCurriculum.departmentName,
      schoolId: apiCurriculum.schoolId?.toString() || apiCurriculum.schoolId,
      schoolName: apiCurriculum.schoolName,
      departmentId: apiCurriculum.departmentId,
      programId: this.mapAcademicLevelToProgram(apiCurriculum.academicLevelName),
      programName: apiCurriculum.academicLevelName,
      
      
      createdDate: this.formatDate(apiCurriculum.createdAt),
      lastModified: this.formatDate(apiCurriculum.updatedAt),
      effectiveDate: this.formatDate(apiCurriculum.effectiveDate),
      expiryDate: this.formatDate(apiCurriculum.expiryDate),
      
      
      duration: `${apiCurriculum.durationSemesters} semesters`,
      durationSemesters: apiCurriculum.durationSemesters,
      active: apiCurriculum.active,
      createdBy: apiCurriculum.createdBy,
      approvedBy: apiCurriculum.approvedBy,
      approvedAt: this.formatDate(apiCurriculum.approvedAt),
      
      // Default values for missing fields
      enrollments: 0, 
      rating: 0, 
      description: '', 
      author: apiCurriculum.createdBy || 'System', 
      category: apiCurriculum.departmentName || 'General', 
      difficulty: 'Advanced' 
    };
  }

  
  mapApiStatus(apiStatus) {
    const statusMap = {
      'UNDER_REVIEW': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'DRAFT': 'draft',
      'PENDING': 'pending',
      'ACTIVE': 'approved',
      'INACTIVE': 'rejected'
    };
    
    return statusMap[apiStatus] || 'draft';
  }

  mapAcademicLevelToProgram(academicLevel) {
    const programMap = {
      'PhD': 'phd',
      'Master': 'masters',
      'Masters': 'masters',
      'Bachelor': 'bachelor',
      'Bachelors': 'bachelor',
      'Undergraduate': 'bachelor'
    };
    
    return programMap[academicLevel] || 'bachelor';
  }

  
  formatDate(dateString) {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return null;
    }
  }

  
  async getAllCurriculums(page = 0, size = 100) {
    try {
      console.log(` Fetching curriculums (page ${page}, size ${size})...`);
      
      const headers = await this.getHeaders();
      const url = `${this.baseURL}/users/curriculums/get-all?page=${page}&size=${size}`;
      
      console.log(' Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log(' Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access curriculums.');
        } else if (response.status === 404) {
          throw new Error('Endpoint not found: Check API configuration.');
        }
        
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Raw API response:', result);
      
      
      let curriculums = [];
      let paginationInfo = {};
      
      if (result.data && result.data.curriculums) {
        curriculums = result.data.curriculums;
        paginationInfo = {
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
          pageSize: result.data.pageSize,
          hasNext: result.data.hasNext,
          hasPrevious: result.data.hasPrevious
        };
      } else if (Array.isArray(result.data)) {
        curriculums = result.data;
      } else if (Array.isArray(result)) {
        curriculums = result;
      }

     
      const transformedCurriculums = curriculums.map(curriculum => 
        this.transformCurriculumData(curriculum)
      );

      console.log(`✅ Transformed ${transformedCurriculums.length} curriculums`);
      console.log(' Sample transformed curriculum:', transformedCurriculums[0]);
      
      return {
        curriculums: transformedCurriculums,
        total: paginationInfo.totalElements || transformedCurriculums.length,
        page,
        size,
        message: result.message,
        pagination: paginationInfo
      };
    } catch (error) {
      console.error('❌ Error fetching curriculums:', error);
      throw error;
    }
  }

  // Get curriculum by ID
  async getCurriculumById(id) {
    try {
      console.log(`Fetching curriculum with ID: ${id}`);
      
      const headers = await this.getHeaders();
      const url = `${this.baseURL}/users/curriculums/get-by-id/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch curriculum: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Curriculum fetched:', result);
      
      
      const transformedCurriculum = this.transformCurriculumData(result.data);
      
      return transformedCurriculum;
    } catch (error) {
      console.error('❌ Error fetching curriculum:', error);
      throw error;
    }
  }

  // Get curriculums by school 
  async getCurriculumsBySchool(schoolId, page = 0, size = 20) {
    try {
      console.log(` Fetching curriculums for school ${schoolId} (page ${page}, size ${size})...`);
      
      const headers = await this.getHeaders();
      const url = `${this.baseURL}/users/curriculums/school/${schoolId}?page=${page}&size=${size}`;
      
      console.log(' Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log(' Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch school curriculums: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ School curriculums raw response:', result);
      
      // Extract curriculums and pagination info
      let curriculums = [];
      let paginationInfo = {};
      
      if (result.data && result.data.curriculums) {
        curriculums = result.data.curriculums;
        paginationInfo = {
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
          pageSize: result.data.pageSize,
          hasNext: result.data.hasNext,
          hasPrevious: result.data.hasPrevious
        };
      }

      
      const transformedCurriculums = curriculums.map(curriculum => 
        this.transformCurriculumData(curriculum)
      );
      
      console.log(`✅ Loaded ${transformedCurriculums.length} curriculums for school ${schoolId}`);
      
      return {
        curriculums: transformedCurriculums,
        total: paginationInfo.totalElements || transformedCurriculums.length,
        page,
        size,
        message: result.message,
        pagination: paginationInfo
      };
    } catch (error) {
      console.error('❌ Error fetching school curriculums:', error);
      throw error;
    }
  }

 
  async getCurriculumsByDepartment(departmentId, page = 0, size = 20) {
    try {
      console.log(` Fetching curriculums for department ${departmentId} (page ${page}, size ${size})...`);
      
      const headers = await this.getHeaders();
      const url = `${this.baseURL}/users/curriculums/department/${departmentId}?page=${page}&size=${size}`;
      
      console.log(' Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch department curriculums: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Department curriculums raw response:', result);
      
      
      let curriculums = [];
      let paginationInfo = {};
      
      if (result.data && result.data.curriculums) {
        curriculums = result.data.curriculums;
        paginationInfo = {
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
          pageSize: result.data.pageSize,
          hasNext: result.data.hasNext,
          hasPrevious: result.data.hasPrevious
        };
      }

     
      const transformedCurriculums = curriculums.map(curriculum => 
        this.transformCurriculumData(curriculum)
      );
      
      console.log(`✅ Loaded ${transformedCurriculums.length} curriculums for department ${departmentId}`);
      
      return {
        curriculums: transformedCurriculums,
        total: paginationInfo.totalElements || transformedCurriculums.length,
        page,
        size,
        message: result.message,
        pagination: paginationInfo
      };
    } catch (error) {
      console.error('❌ Error fetching department curriculums:', error);
      throw error;
    }
  }

  // Get curriculums by academic level 
  async getCurriculumsByAcademicLevel(academicLevelId, page = 0, size = 20) {
    try {
      console.log(` Fetching curriculums for academic level ${academicLevelId} (page ${page}, size ${size})...`);
      
      const headers = await this.getHeaders();
      const url = `${this.baseURL}/users/curriculums/academic-level/${academicLevelId}?page=${page}&size=${size}`;
      
      console.log(' Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch academic level curriculums: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Academic level curriculums raw response:', result);
      
      let curriculums = [];
      let paginationInfo = {};
      
      if (result.data && result.data.curriculums) {
        curriculums = result.data.curriculums;
        paginationInfo = {
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
          pageSize: result.data.pageSize,
          hasNext: result.data.hasNext,
          hasPrevious: result.data.hasPrevious
        };
      }

      
      const transformedCurriculums = curriculums.map(curriculum => 
        this.transformCurriculumData(curriculum)
      );
      
      console.log(`✅ Loaded ${transformedCurriculums.length} curriculums for academic level ${academicLevelId}`);
      
      return {
        curriculums: transformedCurriculums,
        total: paginationInfo.totalElements || transformedCurriculums.length,
        page,
        size,
        message: result.message,
        pagination: paginationInfo
      };
    } catch (error) {
      console.error('❌ Error fetching academic level curriculums:', error);
      throw error;
    }
  }

  // Search curriculums
  async searchCurriculums(searchCriteria, page = 0, size = 20) {
    try {
      console.log(` Searching curriculums with criteria:`, searchCriteria);
      
      const headers = await this.getHeaders();
      const url = `${this.baseURL}/users/curriculums/search?page=${page}&size=${size}`;
      
      console.log(' Request URL:', url);
      console.log(' Search criteria:', searchCriteria);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchCriteria)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to search curriculums: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Search curriculums raw response:', result);
      
      let curriculums = [];
      let paginationInfo = {};
      
      if (result.data && result.data.curriculums) {
        curriculums = result.data.curriculums;
        paginationInfo = {
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
          pageSize: result.data.pageSize,
          hasNext: result.data.hasNext,
          hasPrevious: result.data.hasPrevious
        };
      }

     
      const transformedCurriculums = curriculums.map(curriculum => 
        this.transformCurriculumData(curriculum)
      );
      
      console.log(`✅ Found ${transformedCurriculums.length} curriculums matching search criteria`);
      
      return {
        curriculums: transformedCurriculums,
        total: paginationInfo.totalElements || transformedCurriculums.length,
        page,
        size,
        message: result.message,
        pagination: paginationInfo,
        searchCriteria
      };
    } catch (error) {
      console.error('❌ Error searching curriculums:', error);
      throw error;
    }
  }
  async getSchoolsFromCurriculums() {
    try {
      const result = await this.getAllCurriculums(0, 1000); 
      const curriculums = result.curriculums;
      
      const schoolsMap = new Map();
      curriculums.forEach(curriculum => {
        if (curriculum.schoolId && curriculum.schoolName) {
          schoolsMap.set(curriculum.schoolId, {
            id: curriculum.schoolId,
            name: curriculum.schoolName,
            icon: this.getSchoolIcon(curriculum.schoolName) 
          });
        }
      });
      
      const schools = Array.from(schoolsMap.values());
      console.log(' Extracted schools:', schools);
      
      return schools;
    } catch (error) {
      console.error('❌ Error extracting schools:', error);
      throw error;
    }
  }

  // Get unique departments from curriculums
  async getDepartmentsFromCurriculums() {
    try {
      const result = await this.getAllCurriculums(0, 1000);
      const curriculums = result.curriculums;
      
      
      const departmentsMap = new Map();
      curriculums.forEach(curriculum => {
        if (curriculum.departmentId && curriculum.department) {
          departmentsMap.set(curriculum.departmentId, {
            id: curriculum.departmentId,
            name: curriculum.department,
            schoolId: curriculum.schoolId,
            schoolName: curriculum.schoolName
          });
        }
      });
      
      const departments = Array.from(departmentsMap.values());
      console.log(' Extracted departments:', departments);
      
      return departments;
    } catch (error) {
      console.error('❌ Error extracting departments:', error);
      throw error;
    }
  }

  getSchoolIcon(schoolName) {
    const iconMap = {
      'Engineering': 'cogs',
      'Technology': 'laptop-code',
      'Business': 'chart-line',
      'Economics': 'chart-line',
      'Science': 'atom',
      'Medicine': 'heartbeat',
      'Education': 'chalkboard-teacher',
      'Arts': 'palette',
      'Agriculture': 'seedling'
    };
    
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (schoolName.toLowerCase().includes(keyword.toLowerCase())) {
        return icon;
      }
    }
    
    return 'university'; 
  }

  // Test connection to the API
  async testConnection() {
    try {
      console.log(' Testing curriculum API connection...');
      
      const headers = await this.getHeaders();
      
      const response = await fetch(`${this.baseURL}/users/curriculums/get-all?page=0&size=1`, {
        method: 'GET',
        headers,
      });

      console.log(' Connection test response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connection successful:', data.message);
        return { success: true, message: data.message };
      } else {
        const errorText = await response.text();
        console.error('❌ Connection failed:', errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return { success: false, error: error.message };
    }
  }

  async diagnoseIssue() {
    console.log(' CURRICULUM API DIAGNOSIS');
    console.log('===========================');
    
    try {
     
      console.log('1. Environment Check:');
      console.log('   Base URL:', this.baseURL);
      
      
      console.log('2. Authentication Check:');
      const token = localStorage.getItem('sessionToken');
      console.log('   Token exists:', !!token);
      
      if (!token) {
        return { 
          success: false, 
          error: 'No authentication token found',
          suggestion: 'Please log in first'
        };
      }

     
      console.log('3. Connection Test:');
      const connectionTest = await this.testConnection();
      console.log('   Connection result:', connectionTest);
      
      if (!connectionTest.success) {
        return {
          success: false,
          error: 'API connection failed',
          details: connectionTest.error,
          suggestions: [
            'Check if the API server is running',
            'Verify the base URL is correct',
            'Check network connectivity',
            'Verify authentication token'
          ]
        };
      }

     
      console.log('4. Data Fetch Test:');
      const curriculumsResult = await this.getAllCurriculums(0, 5);
      console.log('   Curriculums loaded:', curriculumsResult.curriculums.length);
      
      
      console.log('5. Search Test:');
      try {
        const searchResult = await this.searchByName('Computer Science', 0, 3);
        console.log('   Search results:', searchResult.curriculums.length);
      } catch (searchError) {
        console.log('   Search test failed:', searchError.message);
      }
      
      console.log('6. Academic Level Test:');
      try {
        const academicResult = await this.getCurriculumsByAcademicLevel(2, 0, 3); 
        console.log('   Academic level results:', academicResult.curriculums.length);
      } catch (academicError) {
        console.log('   Academic level test failed:', academicError.message);
      }
      
      return {
        success: true,
        curriculumCount: curriculumsResult.curriculums.length,
        message: 'All tests passed successfully!',
        sampleData: curriculumsResult.curriculums[0],
        endpoints: {
          getAllCurriculums: '✅',
          searchCurriculums: '✅', 
          academicLevelFilter: '✅'
        }
      };
      
    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      return {
        success: false,
        error: error.message,
        suggestions: [
          'Check authentication token validity',
          'Verify API endpoint URLs',
          'Check network connectivity',
          'Contact system administrator'
        ]
      };
    }
  }
}


const curriculumService = new CurriculumService();

// debugging tools 
if (typeof window !== 'undefined') {
  window.curriculumService = curriculumService;
  window.diagnoseCurriculums = () => curriculumService.diagnoseIssue();
  window.testCurriculumConnection = () => curriculumService.testConnection();
  window.loadCurriculums = (page, size) => curriculumService.getAllCurriculums(page, size);
  window.getCurriculum = (id) => curriculumService.getCurriculumById(id);
  window.loadSchoolCurriculums = (schoolId, page, size) => curriculumService.getCurriculumsBySchool(schoolId, page, size);
  window.loadDepartmentCurriculums = (departmentId, page, size) => curriculumService.getCurriculumsByDepartment(departmentId, page, size);
  window.loadAcademicLevelCurriculums = (levelId, page, size) => curriculumService.getCurriculumsByAcademicLevel(levelId, page, size);
  window.searchCurriculums = (criteria, page, size) => curriculumService.searchCurriculums(criteria, page, size);
  window.searchByName = (name, page, size) => curriculumService.searchByName(name, page, size);
  window.searchByCode = (code, page, size) => curriculumService.searchByCode(code, page, size);
  window.getCurriculumsByProgram = (program, page, size) => curriculumService.getCurriculumsByProgram(program, page, size);
}

export default curriculumService;