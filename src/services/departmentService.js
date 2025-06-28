
// import authService from './authService';

// class DepartmentService {
//   constructor() {
//     this.baseURL = import.meta.env.VITE_BASE_URL;
//     console.log('🔧 Department Service initialized with base URL:', this.baseURL);
//   }

//   // Get headers - simplified to match your working auth pattern
//   async getHeaders() {
//     try {
//       // Use the direct token from localStorage since authService.getValidToken() might be causing issues
//       const token = localStorage.getItem('sessionToken');
      
//       if (!token) {
//         throw new Error('No authentication token available. Please log in again.');
//       }

//       console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'null');

//       return {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       };
//     } catch (error) {
//       console.error('❌ Failed to prepare auth headers:', error);
//       throw error;
//     }
//   }

//   // Test if our headers work with auth/validate first
//   async testAuthHeaders() {
//     try {
//       const headers = await this.getHeaders();
      
//       console.log('🧪 Testing auth headers with /auth/validate...');
//       const response = await fetch(`${this.baseURL}/auth/validate`, {
//         method: 'GET',
//         headers,
//       });

//       console.log('Auth test response:', response.status, response.statusText);
      
//       if (response.ok) {
//         console.log('✅ Auth headers work with /auth/validate');
//         return true;
//       } else {
//         console.log('❌ Auth headers failed with /auth/validate');
//         return false;
//       }
//     } catch (error) {
//       console.error('❌ Auth header test failed:', error);
//       return false;
//     }
//   }

//   // Check if user has admin permissions
//   checkAdminPermissions() {
//     try {
//       // Check JWT token payload for admin permissions
//       const token = localStorage.getItem('sessionToken');
//       if (!token) return false;

//       if (token.includes('.')) {
//         const parts = token.split('.');
//         if (parts.length >= 2) {
//           const payload = JSON.parse(atob(parts[1]));
//           console.log('🔍 JWT payload check:', {
//             roles: payload.roles,
//             isAdmin: payload.isAdmin,
//             userId: payload.userId
//           });
          
//           const hasAdminRole = payload.roles && payload.roles.includes('ADMIN');
//           const isAdminFlag = payload.isAdmin === true;
          
//           return hasAdminRole || isAdminFlag;
//         }
//       }
//       return false;
//     } catch (error) {
//       console.error('❌ Error checking admin permissions:', error);
//       return false;
//     }
//   }

//   // Enhanced getAllDepartments with better debugging
//   async getAllDepartments() {
//     try {
//       console.log('🏢 Fetching all departments...');
      
//       // First check if user has admin permissions
//       const hasAdminPerms = this.checkAdminPermissions();
//       console.log('🔐 User has admin permissions:', hasAdminPerms);
      
//       if (!hasAdminPerms) {
//         throw new Error('User does not have admin permissions to access departments');
//       }

//       // Test auth headers first
//       const authHeadersWork = await this.testAuthHeaders();
//       if (!authHeadersWork) {
//         throw new Error('Authentication headers are not working');
//       }

//       console.log('🌐 Full URL:', `${this.baseURL}/admin/departments`);
      
//       const headers = await this.getHeaders();
//       console.log('📡 Request headers:', {
//         'Content-Type': headers['Content-Type'],
//         'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 27)}...` : 'Missing'
//       });
      
//       const response = await fetch(`${this.baseURL}/admin/departments`, {
//         method: 'GET',
//         headers,
//       });

//       console.log('📥 Response:', {
//         status: response.status,
//         statusText: response.statusText,
//         ok: response.ok
//       });

//       if (!response.ok) {
//         const responseText = await response.text();
//         console.error('❌ Error response:', responseText);
        
//         if (response.status === 401) {
//           // If we get 401, there might be a specific issue with admin endpoints
//           throw new Error('Unauthorized: Your account may not have permission to access admin features. Please contact your administrator.');
//         } else if (response.status === 403) {
//           throw new Error('Forbidden: You do not have permission to access departments.');
//         } else if (response.status === 404) {
//           throw new Error('Endpoint not found: The departments API endpoint may not be available.');
//         }
        
//         throw new Error(`API Error (${response.status}): ${responseText}`);
//       }

//       const result = await response.json();
//       console.log('✅ Raw API response:', result);
      
//       // Handle different response structures
//       let departments;
//       if (result.data) {
//         departments = result.data;
//       } else if (Array.isArray(result)) {
//         departments = result;
//       } else {
//         console.warn('⚠️ Unexpected response structure:', result);
//         departments = [];
//       }

//       console.log('✅ Departments extracted:', departments);
//       console.log('📊 Number of departments:', departments.length);
      
//       return departments;
//     } catch (error) {
//       console.error('❌ Error fetching departments:', error);
//       throw error;
//     }
//   }

//   // Comprehensive test function
//   async diagnoseIssue() {
//     console.log('🔍 COMPREHENSIVE DEPARTMENT DIAGNOSIS');
//     console.log('=====================================');
    
//     try {
//       // 1. Check basic auth
//       console.log('1. Basic Authentication Check:');
//       const token = localStorage.getItem('sessionToken');
//       console.log('   Token exists:', !!token);
      
//       if (!token) {
//         return { success: false, error: 'No authentication token found' };
//       }

//       // 2. Check admin permissions
//       console.log('2. Admin Permission Check:');
//       const hasAdminPerms = this.checkAdminPermissions();
//       console.log('   Has admin permissions:', hasAdminPerms);
      
//       if (!hasAdminPerms) {
//         return { 
//           success: false, 
//           error: 'User does not have admin permissions',
//           suggestion: 'Make sure you are logged in with an admin account'
//         };
//       }

//       // 3. Test auth with known working endpoint
//       console.log('3. Auth Validation Test:');
//       const authWorks = await this.testAuthHeaders();
//       console.log('   Auth validation works:', authWorks);
      
//       if (!authWorks) {
//         return { 
//           success: false, 
//           error: 'Authentication is not working',
//           suggestion: 'Try logging out and logging back in'
//         };
//       }

//       // 4. Test departments endpoint specifically
//       console.log('4. Departments Endpoint Test:');
//       const departments = await this.getAllDepartments();
//       console.log('   Departments loaded:', departments.length);
      
//       return {
//         success: true,
//         departmentCount: departments.length,
//         departments: departments
//       };
      
//     } catch (error) {
//       console.error('❌ Diagnosis failed:', error);
//       return {
//         success: false,
//         error: error.message,
//         suggestions: [
//           'Check if your user account has admin privileges',
//           'Try logging out and logging back in',
//           'Contact your system administrator',
//           'Check if the departments API endpoint is properly configured'
//         ]
//       };
//     }
//   }

//   // Simplified CRUD methods using same pattern
//   async getDepartmentsBySchool(schoolId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await fetch(`${this.baseURL}/admin/departments/school/${schoolId}`, {
//         method: 'GET',
//         headers,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to fetch departments by school: ${errorText}`);
//       }

//       const result = await response.json();
//       return result.data || result;
//     } catch (error) {
//       console.error('❌ Error fetching school departments:', error);
//       throw error;
//     }
//   }

//   async createDepartment(departmentData) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await fetch(`${this.baseURL}/admin/departments/create`, {
//         method: 'POST',
//         headers,
//         body: JSON.stringify(departmentData),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to create department: ${errorText}`);
//       }

//       const result = await response.json();
//       return result.data || result;
//     } catch (error) {
//       console.error('❌ Error creating department:', error);
//       throw error;
//     }
//   }

//   async updateDepartment(departmentId, departmentData) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await fetch(`${this.baseURL}/admin/departments/update/${departmentId}`, {
//         method: 'PUT',
//         headers,
//         body: JSON.stringify(departmentData),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to update department: ${errorText}`);
//       }

//       const result = await response.json();
//       return result.data || result;
//     } catch (error) {
//       console.error('❌ Error updating department:', error);
//       throw error;
//     }
//   }

//   async deleteDepartment(departmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await fetch(`${this.baseURL}/admin/departments/delete/${departmentId}`, {
//         method: 'DELETE',
//         headers,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to delete department: ${errorText}`);
//       }

//       const result = await response.json();
//       return result;
//     } catch (error) {
//       console.error('❌ Error deleting department:', error);
//       throw error;
//     }
//   }

//   async getDepartmentById(departmentId) {
//     try {
//       const headers = await this.getHeaders();
//       const response = await fetch(`${this.baseURL}/admin/departments/${departmentId}`, {
//         method: 'GET',
//         headers,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to fetch department: ${errorText}`);
//       }

//       const result = await response.json();
//       return result.data || result;
//     } catch (error) {
//       console.error('❌ Error fetching department:', error);
//       throw error;
//     }
//   }
// }

// // Create and export the service instance
// const departmentService = new DepartmentService();

// // Add debugging tools to window
// if (typeof window !== 'undefined') {
//   window.departmentService = departmentService;
//   window.diagnoseDepartments = () => departmentService.diagnoseIssue();
//   window.testDepartmentAuth = () => departmentService.testAuthHeaders();
//   window.checkAdminPerms = () => departmentService.checkAdminPermissions();
// }

// export default departmentService;