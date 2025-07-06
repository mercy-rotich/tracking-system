// Updated Public Curriculum Service with multiple endpoint strategies
class PublicCurriculumService {
    constructor() {
      this.baseURL = import.meta.env.VITE_BASE_URL;
      console.log(' Public Curriculum Service initialized with base URL:', this.baseURL);
    }
  
    
    getPublicHeaders() {
      return {
        'Content-Type': 'application/json',
      };
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
      const endpoints = [
        // Strategy 1: Try dedicated public endpoint
        `/public/curricula?page=${page}&size=${size}`,
        `/api/public/curricula?page=${page}&size=${size}`,
        `/public/curriculums?page=${page}&size=${size}`,
        
        // Strategy 2: Try no-auth version of existing endpoints
        `/curriculums/public?page=${page}&size=${size}`,
        `/curricula/public?page=${page}&size=${size}`,
        
        // Strategy 3: Try with basic/guest authentication
        `/users/curriculums/get-all?page=${page}&size=${size}&public=true`,
        
        // Strategy 4: Try the original endpoint with no-auth flag
        `/users/curriculums/get-all?page=${page}&size=${size}`,
      ];
  
      for (const endpoint of endpoints) {
        try {
          console.log(` Trying endpoint: ${this.baseURL}${endpoint}`);
          
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getPublicHeaders(),
          });
  
          console.log(` Response from ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
  
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Success with endpoint:', endpoint);
            
           
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
            } else if (result.curriculums) {
              curriculums = result.curriculums;
            }
  
            const transformedCurriculums = curriculums.map(curriculum => 
              this.transformCurriculumData(curriculum)
            );
  
            console.log(`✅ Transformed ${transformedCurriculums.length} public curriculums`);
            
            return {
              curriculums: transformedCurriculums,
              total: paginationInfo.totalElements || transformedCurriculums.length,
              page,
              size,
              message: result.message || `Loaded from ${endpoint}`,
              pagination: paginationInfo
            };
          }
        } catch (error) {
          console.warn(`❌ Failed endpoint ${endpoint}:`, error.message);
          continue;
        }
      }
  

      console.log(' All endpoints failed, returning sample data');
      return this.getSampleData();
    }
    async getAllCurriculumsWithGuestToken(page = 0, size = 100) {
      try {
        const guestTokenResponse = await fetch(`${this.baseURL}/auth/guest-token`, {
          method: 'POST',
          headers: this.getPublicHeaders(),
          body: JSON.stringify({ type: 'public_access' })
        });
  
        if (guestTokenResponse.ok) {
          const tokenData = await guestTokenResponse.json();
          const guestToken = tokenData.token || tokenData.accessToken;
  
          if (guestToken) {
            console.log(' Obtained guest token for public access');
            
            const response = await fetch(`${this.baseURL}/users/curriculums/get-all?page=${page}&size=${size}`, {
              method: 'GET',
              headers: {
                ...this.getPublicHeaders(),
                'Authorization': `Bearer ${guestToken}`
              },
            });
  
            if (response.ok) {
              const result = await response.json();
             
              return this.processCurriculaResponse(result, page, size);
            }
          }
        }
      } catch (error) {
        console.warn('❌ Guest token approach failed:', error);
      }
  
     
      return this.getSampleData();
    }
    processCurriculaResponse(result, page, size) {
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
  
      return {
        curriculums: transformedCurriculums,
        total: paginationInfo.totalElements || transformedCurriculums.length,
        page,
        size,
        message: result.message,
        pagination: paginationInfo
      };
    }
  
    // Get curriculums by school
    async getCurriculumsBySchool(schoolId, page = 0, size = 20) {
      const endpoints = [
        `/public/curricula/school/${schoolId}?page=${page}&size=${size}`,
        `/users/curriculums/school/${schoolId}?page=${page}&size=${size}&public=true`,
        `/users/curriculums/school/${schoolId}?page=${page}&size=${size}`,
      ];
  
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getPublicHeaders(),
          });
  
          if (response.ok) {
            const result = await response.json();
            return this.processCurriculaResponse(result, page, size);
          }
        } catch (error) {
          continue;
        }
      }
  
      
      try {
        const allCurriculums = await this.getAllCurriculums(0, 500);
        const filteredCurriculums = allCurriculums.curriculums.filter(
          c => c.schoolId?.toString() === schoolId?.toString()
        );
        
        return {
          curriculums: filteredCurriculums,
          total: filteredCurriculums.length,
          page,
          size,
          message: 'Filtered from all curriculums'
        };
      } catch (error) {
        return this.getSampleData();
      }
    }
  
    // Search curricula by name 
    async searchByName(name, page = 0, size = 20) {
      const endpoints = [
        `/public/curricula/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`,
        `/public/curriculums/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`,
        `/search/curricula?q=${encodeURIComponent(name)}&page=${page}&size=${size}`,
      ];
  
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getPublicHeaders(),
          });
  
          if (response.ok) {
            const result = await response.json();
            return this.processCurriculaResponse(result, page, size);
          }
        } catch (error) {
          continue;
        }
      }
  
     
      try {
        const allCurriculums = await this.getAllCurriculums(0, 500);
        const filteredCurriculums = allCurriculums.curriculums.filter(curriculum =>
          curriculum.title.toLowerCase().includes(name.toLowerCase()) ||
          curriculum.department.toLowerCase().includes(name.toLowerCase()) ||
          curriculum.schoolName.toLowerCase().includes(name.toLowerCase())
        );
        
        return {
          curriculums: filteredCurriculums,
          total: filteredCurriculums.length,
          page,
          size,
          message: 'Searched via client-side filtering'
        };
      } catch (error) {
        return this.getSampleData();
      }
    }
  
    // Get curriculums by academic level
    async getCurriculumsByAcademicLevel(academicLevelId, page = 0, size = 20) {
      
      const endpoints = [
        `/public/curricula/academic-level/${academicLevelId}?page=${page}&size=${size}`,
        `/users/curriculums/academic-level/${academicLevelId}?page=${page}&size=${size}&public=true`,
      ];
  
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getPublicHeaders(),
          });
  
          if (response.ok) {
            const result = await response.json();
            return this.processCurriculaResponse(result, page, size);
          }
        } catch (error) {
          continue;
        }
      }
  
      
      try {
        const allCurriculums = await this.getAllCurriculums(0, 500);
        const levelMap = { 1: 'bachelor', 2: 'masters', 3: 'phd' };
        const targetProgram = levelMap[academicLevelId];
        
        const filteredCurriculums = allCurriculums.curriculums.filter(
          c => c.programId === targetProgram
        );
        
        return {
          curriculums: filteredCurriculums,
          total: filteredCurriculums.length,
          page,
          size,
          message: 'Filtered by academic level'
        };
      } catch (error) {
        return this.getSampleData();
      }
    }
  
    // Get schools from curriculums
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
        
        return [
          { id: '1', name: 'Engineering', icon: 'cogs' },
          { id: '2', name: 'Business', icon: 'chart-line' },
          { id: '3', name: 'Science', icon: 'atom' },
          { id: '4', name: 'Arts', icon: 'palette' }
        ];
      }
    }
  
    // Get departments from curriculums
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
        console.log('Extracted departments:', departments);
        
        return departments;
      } catch (error) {
        console.error('❌ Error extracting departments:', error);
        //sample data
        return [
          // Engineering School
          { id: '1', name: 'Computer Science', schoolId: '1', schoolName: 'Engineering' },
          { id: '2', name: 'Electrical Engineering', schoolId: '1', schoolName: 'Engineering' },
          
          // Business School
          { id: '3', name: 'Business Administration', schoolId: '2', schoolName: 'Business' },
          { id: '4', name: 'Economics', schoolId: '2', schoolName: 'Business' },
          
          // Science School
          { id: '5', name: 'Biology', schoolId: '3', schoolName: 'Science' },
          { id: '6', name: 'Chemistry', schoolId: '3', schoolName: 'Science' },
          { id: '7', name: 'Physics', schoolId: '3', schoolName: 'Science' },
          
          // Arts School
          { id: '8', name: 'English Literature', schoolId: '4', schoolName: 'Arts' },
          { id: '9', name: 'History', schoolId: '4', schoolName: 'Arts' }
        ];
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
  
    //  sample data 
    getSampleData() {
      console.log(' Returning comprehensive sample curriculum data with multiple academic levels');
      
      const sampleCurriculums = [
        // ENGINEERING SCHOOL
        // Computer Science Department
        {
          id: 'eng-cs-bach-1',
          title: 'Computer Science Fundamentals',
          code: 'CS101',
          status: 'approved',
          department: 'Computer Science',
          schoolId: '1',
          schoolName: 'Engineering',
          departmentId: '1',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-08-15',
          lastModified: '2024-01-10',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 245,
          rating: 4.6,
          description: 'Comprehensive undergraduate program covering programming, algorithms, and software engineering',
          author: 'Dr. Sarah Mitchell',
          category: 'Computer Science',
          difficulty: 'Intermediate',
          createdBy: 'Dr. Sarah Mitchell',
          approvedBy: 'Dean Thompson',
          approvedAt: '2023-08-20'
        },
        {
          id: 'eng-cs-mast-1',
          title: 'Advanced Computer Science',
          code: 'CS501',
          status: 'approved',
          department: 'Computer Science',
          schoolId: '1',
          schoolName: 'Engineering',
          departmentId: '1',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-09-01',
          lastModified: '2024-02-15',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 78,
          rating: 4.8,
          description: 'Advanced study in machine learning, distributed systems, and research methodology',
          author: 'Prof. David Chen',
          category: 'Computer Science',
          difficulty: 'Advanced',
          createdBy: 'Prof. David Chen',
          approvedBy: 'Dean Thompson',
          approvedAt: '2023-09-10'
        },
        {
          id: 'eng-cs-phd-1',
          title: 'Computer Science Research',
          code: 'CS801',
          status: 'approved',
          department: 'Computer Science',
          schoolId: '1',
          schoolName: 'Engineering',
          departmentId: '1',
          programId: 'phd',
          programName: 'PhD',
          createdDate: '2023-10-01',
          lastModified: '2024-01-05',
          effectiveDate: '2024-01-01',
          expiryDate: '2029-12-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 23,
          rating: 4.9,
          description: 'Doctoral program focusing on original research in AI, cybersecurity, or systems',
          author: 'Prof. Emily Rodriguez',
          category: 'Computer Science',
          difficulty: 'Expert',
          createdBy: 'Prof. Emily Rodriguez',
          approvedBy: 'Dean Thompson',
          approvedAt: '2023-10-15'
        },
  
        // Electrical Engineering Department
        {
          id: 'eng-ee-bach-1',
          title: 'Electrical Engineering',
          code: 'EE101',
          status: 'approved',
          department: 'Electrical Engineering',
          schoolId: '1',
          schoolName: 'Engineering',
          departmentId: '2',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-07-01',
          lastModified: '2023-12-10',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 189,
          rating: 4.4,
          description: 'Undergraduate program in circuit design, power systems, and electronics',
          author: 'Dr. Michael Foster',
          category: 'Electrical Engineering',
          difficulty: 'Intermediate',
          createdBy: 'Dr. Michael Foster',
          approvedBy: 'Dean Thompson',
          approvedAt: '2023-07-15'
        },
        {
          id: 'eng-ee-mast-1',
          title: 'Power Systems Engineering',
          code: 'EE501',
          status: 'approved',
          department: 'Electrical Engineering',
          schoolId: '1',
          schoolName: 'Engineering',
          departmentId: '2',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-08-01',
          lastModified: '2024-01-20',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 45,
          rating: 4.7,
          description: 'Specialized masters in renewable energy and smart grid technologies',
          author: 'Prof. Lisa Wang',
          category: 'Electrical Engineering',
          difficulty: 'Advanced',
          createdBy: 'Prof. Lisa Wang',
          approvedBy: 'Dean Thompson',
          approvedAt: '2023-08-15'
        },
  
        // BUSINESS SCHOOL
        // Business Administration Department
        {
          id: 'bus-ba-bach-1',
          title: 'Business Administration',
          code: 'BA101',
          status: 'approved',
          department: 'Business Administration',
          schoolId: '2',
          schoolName: 'Business',
          departmentId: '3',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-06-01',
          lastModified: '2023-11-30',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 312,
          rating: 4.3,
          description: 'Comprehensive business education covering management, finance, and marketing',
          author: 'Prof. Robert Johnson',
          category: 'Business Administration',
          difficulty: 'Intermediate',
          createdBy: 'Prof. Robert Johnson',
          approvedBy: 'Dean Martinez',
          approvedAt: '2023-06-15'
        },
        {
          id: 'bus-ba-mast-1',
          title: 'Master of Business Administration',
          code: 'MBA501',
          status: 'approved',
          department: 'Business Administration',
          schoolId: '2',
          schoolName: 'Business',
          departmentId: '3',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-07-15',
          lastModified: '2024-02-01',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 156,
          rating: 4.8,
          description: 'Executive MBA program with focus on strategic leadership and innovation',
          author: 'Prof. Angela Davis',
          category: 'Business Administration',
          difficulty: 'Advanced',
          createdBy: 'Prof. Angela Davis',
          approvedBy: 'Dean Martinez',
          approvedAt: '2023-07-30'
        },
        {
          id: 'bus-ba-phd-1',
          title: 'Business Research & Strategy',
          code: 'BA801',
          status: 'pending',
          department: 'Business Administration',
          schoolId: '2',
          schoolName: 'Business',
          departmentId: '3',
          programId: 'phd',
          programName: 'PhD',
          createdDate: '2024-01-01',
          lastModified: '2024-02-28',
          effectiveDate: '2024-09-01',
          expiryDate: '2030-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: false,
          enrollments: 0,
          rating: 0,
          description: 'Doctoral program in business strategy, organizational behavior, and market research',
          author: 'Prof. Thomas Anderson',
          category: 'Business Administration',
          difficulty: 'Expert',
          createdBy: 'Prof. Thomas Anderson',
          approvedBy: null,
          approvedAt: null
        },
  
        // Economics Department
        {
          id: 'bus-ec-bach-1',
          title: 'Economics',
          code: 'EC101',
          status: 'approved',
          department: 'Economics',
          schoolId: '2',
          schoolName: 'Business',
          departmentId: '4',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-05-15',
          lastModified: '2023-12-01',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 198,
          rating: 4.5,
          description: 'Undergraduate economics with emphasis on microeconomics, macroeconomics, and econometrics',
          author: 'Dr. Jennifer Kim',
          category: 'Economics',
          difficulty: 'Intermediate',
          createdBy: 'Dr. Jennifer Kim',
          approvedBy: 'Dean Martinez',
          approvedAt: '2023-06-01'
        },
        {
          id: 'bus-ec-mast-1',
          title: 'Applied Economics',
          code: 'EC501',
          status: 'approved',
          department: 'Economics',
          schoolId: '2',
          schoolName: 'Business',
          departmentId: '4',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-08-15',
          lastModified: '2024-01-15',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 67,
          rating: 4.6,
          description: 'Advanced economics with focus on policy analysis and quantitative methods',
          author: 'Prof. Mark Thompson',
          category: 'Economics',
          difficulty: 'Advanced',
          createdBy: 'Prof. Mark Thompson',
          approvedBy: 'Dean Martinez',
          approvedAt: '2023-09-01'
        },
  
        // SCIENCE SCHOOL
        // Biology Department
        {
          id: 'sci-bio-bach-1',
          title: 'Biology',
          code: 'BIO101',
          status: 'approved',
          department: 'Biology',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '5',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-06-15',
          lastModified: '2023-11-20',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 234,
          rating: 4.7,
          description: 'Comprehensive biology program covering molecular biology, ecology, and genetics',
          author: 'Dr. Rachel Green',
          category: 'Biology',
          difficulty: 'Intermediate',
          createdBy: 'Dr. Rachel Green',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-07-01'
        },
        {
          id: 'sci-bio-mast-1',
          title: 'Molecular Biology',
          code: 'BIO501',
          status: 'approved',
          department: 'Biology',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '5',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-07-01',
          lastModified: '2024-01-10',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 89,
          rating: 4.8,
          description: 'Specialized program in molecular biology, biochemistry, and biotechnology',
          author: 'Prof. Alexander Lee',
          category: 'Biology',
          difficulty: 'Advanced',
          createdBy: 'Prof. Alexander Lee',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-07-15'
        },
        {
          id: 'sci-bio-phd-1',
          title: 'Biomedical Research',
          code: 'BIO801',
          status: 'approved',
          department: 'Biology',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '5',
          programId: 'phd',
          programName: 'PhD',
          createdDate: '2023-09-01',
          lastModified: '2024-02-10',
          effectiveDate: '2024-01-01',
          expiryDate: '2030-12-31',
          duration: '10 semesters',
          durationSemesters: 10,
          active: true,
          enrollments: 34,
          rating: 4.9,
          description: 'Doctoral research program in biomedical sciences and drug discovery',
          author: 'Prof. Maria Santos',
          category: 'Biology',
          difficulty: 'Expert',
          createdBy: 'Prof. Maria Santos',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-09-15'
        },
  
        // Chemistry Department
        {
          id: 'sci-chem-bach-1',
          title: 'Chemistry',
          code: 'CHEM101',
          status: 'approved',
          department: 'Chemistry',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '6',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-05-01',
          lastModified: '2023-10-15',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 167,
          rating: 4.4,
          description: 'Undergraduate chemistry covering organic, inorganic, and physical chemistry',
          author: 'Dr. James Wilson',
          category: 'Chemistry',
          difficulty: 'Intermediate',
          createdBy: 'Dr. James Wilson',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-05-15'
        },
        {
          id: 'sci-chem-mast-1',
          title: 'Analytical Chemistry',
          code: 'CHEM501',
          status: 'approved',
          department: 'Chemistry',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '6',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-08-01',
          lastModified: '2023-12-20',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 52,
          rating: 4.6,
          description: 'Advanced analytical techniques and instrumental analysis methods',
          author: 'Prof. Catherine Brown',
          category: 'Chemistry',
          difficulty: 'Advanced',
          createdBy: 'Prof. Catherine Brown',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-08-15'
        },
  
        // Physics Department
        {
          id: 'sci-phys-bach-1',
          title: 'Physics',
          code: 'PHYS101',
          status: 'approved',
          department: 'Physics',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '7',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-06-01',
          lastModified: '2023-11-10',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 143,
          rating: 4.5,
          description: 'Comprehensive physics program including mechanics, electromagnetism, and quantum physics',
          author: 'Dr. Steven Taylor',
          category: 'Physics',
          difficulty: 'Advanced',
          createdBy: 'Dr. Steven Taylor',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-06-15'
        },
        {
          id: 'sci-phys-phd-1',
          title: 'Theoretical Physics',
          code: 'PHYS801',
          status: 'approved',
          department: 'Physics',
          schoolId: '3',
          schoolName: 'Science',
          departmentId: '7',
          programId: 'phd',
          programName: 'PhD',
          createdDate: '2023-10-01',
          lastModified: '2024-01-25',
          effectiveDate: '2024-01-01',
          expiryDate: '2030-12-31',
          duration: '10 semesters',
          durationSemesters: 10,
          active: true,
          enrollments: 18,
          rating: 4.9,
          description: 'Advanced research in quantum mechanics, relativity, and particle physics',
          author: 'Prof. Alan Cooper',
          category: 'Physics',
          difficulty: 'Expert',
          createdBy: 'Prof. Alan Cooper',
          approvedBy: 'Dean Wilson',
          approvedAt: '2023-10-15'
        },
  
        // ARTS SCHOOL
        // English Literature Department
        {
          id: 'arts-eng-bach-1',
          title: 'English Literature',
          code: 'ENG101',
          status: 'approved',
          department: 'English Literature',
          schoolId: '4',
          schoolName: 'Arts',
          departmentId: '8',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-04-15',
          lastModified: '2023-09-30',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 178,
          rating: 4.6,
          description: 'Comprehensive study of English literature from medieval to contemporary periods',
          author: 'Prof. Margaret Collins',
          category: 'English Literature',
          difficulty: 'Intermediate',
          createdBy: 'Prof. Margaret Collins',
          approvedBy: 'Dean Parker',
          approvedAt: '2023-05-01'
        },
        {
          id: 'arts-eng-mast-1',
          title: 'Creative Writing',
          code: 'ENG501',
          status: 'approved',
          department: 'English Literature',
          schoolId: '4',
          schoolName: 'Arts',
          departmentId: '8',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-07-01',
          lastModified: '2023-12-15',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 43,
          rating: 4.8,
          description: 'Master of Fine Arts in creative writing with workshops and mentorship',
          author: 'Prof. Daniel Harper',
          category: 'English Literature',
          difficulty: 'Advanced',
          createdBy: 'Prof. Daniel Harper',
          approvedBy: 'Dean Parker',
          approvedAt: '2023-07-15'
        },
  
        // History Department
        {
          id: 'arts-hist-bach-1',
          title: 'History',
          code: 'HIST101',
          status: 'approved',
          department: 'History',
          schoolId: '4',
          schoolName: 'Arts',
          departmentId: '9',
          programId: 'bachelor',
          programName: 'Bachelor',
          createdDate: '2023-05-01',
          lastModified: '2023-10-20',
          effectiveDate: '2023-09-01',
          expiryDate: '2027-08-31',
          duration: '8 semesters',
          durationSemesters: 8,
          active: true,
          enrollments: 156,
          rating: 4.4,
          description: 'Study of world history, historical methods, and cultural analysis',
          author: 'Dr. Patricia Moore',
          category: 'History',
          difficulty: 'Intermediate',
          createdBy: 'Dr. Patricia Moore',
          approvedBy: 'Dean Parker',
          approvedAt: '2023-05-15'
        },
        {
          id: 'arts-hist-mast-1',
          title: 'Public History',
          code: 'HIST501',
          status: 'approved',
          department: 'History',
          schoolId: '4',
          schoolName: 'Arts',
          departmentId: '9',
          programId: 'masters',
          programName: 'Masters',
          createdDate: '2023-08-15',
          lastModified: '2024-01-05',
          effectiveDate: '2024-01-15',
          expiryDate: '2028-01-14',
          duration: '4 semesters',
          durationSemesters: 4,
          active: true,
          enrollments: 29,
          rating: 4.7,
          description: 'Specialized program in museum studies, archival work, and historical preservation',
          author: 'Prof. Richard Stone',
          category: 'History',
          difficulty: 'Advanced',
          createdBy: 'Prof. Richard Stone',
          approvedBy: 'Dean Parker',
          approvedAt: '2023-09-01'
        }
      ];
      
      return {
        curriculums: sampleCurriculums,
        total: sampleCurriculums.length,
        page: 0,
        size: 100,
        message: 'Comprehensive sample data with multiple schools, departments, and academic levels - API endpoints may require backend configuration for public access'
      };
    }
  
    // Test connection with multiple strategies
    async testConnection() {
      try {
        console.log('🧪 Testing public curriculum API connection...');
        
        const testEndpoints = [
          '/public/curricula',
          '/public/curriculums', 
          '/api/public/curricula',
          '/health',
          '/status',
          '/users/curriculums/get-all?page=0&size=1'
        ];
  
        for (const endpoint of testEndpoints) {
          try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
              method: 'GET',
              headers: this.getPublicHeaders(),
            });
  
            console.log(`🔗 Testing ${endpoint}: ${response.status}`);
            
            if (response.ok) {
              console.log(`✅ Public connection successful with ${endpoint}`);
              return { 
                success: true, 
                message: `Public API accessible via ${endpoint}`,
                endpoint: endpoint,
                status: response.status
              };
            }
          } catch (error) {
            continue;
          }
        }
  
        console.log('⚠️ No public endpoints accessible, will use sample data');
        return { 
          success: false, 
          message: 'No public endpoints accessible - backend may need configuration for public access',
          suggestion: 'Check if the API has dedicated public endpoints or supports guest access'
        };
      } catch (error) {
        console.log(' Connection test failed, will use sample data');
        return { 
          success: false, 
          error: error.message,
          suggestion: 'Backend API may need to expose public endpoints for unauthenticated access'
        };
      }
    }
  }
  

  const publicCurriculumService = new PublicCurriculumService();
  //debugging tools
  
  if (typeof window !== 'undefined') {
    window.publicCurriculumService = publicCurriculumService;
    window.testPublicConnection = () => publicCurriculumService.testConnection();
    window.loadPublicCurriculums = (page, size) => publicCurriculumService.getAllCurriculums(page, size);
    window.searchPublicCurriculums = (name, page, size) => publicCurriculumService.searchByName(name, page, size);
    
   
    window.debugPublicAPI = {
      testAllEndpoints: async () => {
        const endpoints = [
          '/public/curricula',
          '/public/curriculums',
          '/api/public/curricula', 
          '/users/curriculums/get-all?public=true',
          '/curriculums/public',
          '/health',
          '/status'
        ];
        
        const results = {};
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(`${publicCurriculumService.baseURL}${endpoint}`);
            results[endpoint] = {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText
            };
          } catch (error) {
            results[endpoint] = { error: error.message };
          }
        }
        console.table(results);
        return results;
      }
    };
  }
  
  export default publicCurriculumService;