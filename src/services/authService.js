// services/authService.js
class AuthService {
    constructor() {
      this.baseURL = import.meta.env.VITE_BASE_URL;
      this.refreshTokenInterval = null;
      this.sessionCheckInterval = null;
      this.isRefreshing = false;
      this.failedQueue = [];
    }
  
    // Enhanced login method with better debugging
    async login(credentials) {
      try {
        console.log('🔐 Starting login process with credentials:', {
          username: credentials.username,
          hasPassword: !!credentials.password,
          rememberMe: credentials.rememberMe
        });

        const response = await fetch(`${this.baseURL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        console.log('📡 Login response status:', response.status);
        console.log('📡 Login response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Login failed with error:', errorData);
          throw new Error(errorData.message || 'Invalid credentials');
        }

        const data = await response.json();
        
        // Enhanced debugging - show complete response structure
        console.log('✅ Login response received:', {
          fullResponse: data,
          responseKeys: Object.keys(data),
          dataType: typeof data,
          isSuccess: data.success,
          hasData: !!data.data,
          directFields: {
            token: data.token,
            accessToken: data.accessToken,
            access_token: data.access_token,
            jwt: data.jwt,
            authToken: data.authToken
          }
        });
        
        // Try different possible field names and nested structures
        let sessionToken = null;
        let refreshToken = null;
        let tokenExpiry = null;
        let userData = null;

        // Check if response has nested data structure
        const responseData = data.data || data;
        
        // Try various token field names
        sessionToken = responseData.token || 
                      responseData.accessToken || 
                      responseData.access_token || 
                      responseData.jwt || 
                      responseData.authToken ||
                      data.token ||
                      data.accessToken ||
                      data.access_token ||
                      data.jwt ||
                      data.authToken;

        refreshToken = responseData.refreshToken || 
                      responseData.refresh_token || 
                      data.refreshToken || 
                      data.refresh_token;

        tokenExpiry = responseData.expiresAt || 
                     responseData.expires_at || 
                     responseData.expiry || 
                     responseData.exp ||
                     responseData.expiresIn ||
                     data.expiresAt || 
                     data.expires_at || 
                     data.expiry || 
                     data.exp ||
                     data.expiresIn;

        userData = responseData.user || 
                  responseData.userData || 
                  responseData.profile ||
                  data.user || 
                  data.userData || 
                  data.profile;

        // If no explicit user data, create from available info
        if (!userData && (data.username || data.email || data.id)) {
          userData = {
            id: data.id || data.userId || data.user_id,
            username: data.username || data.user || credentials.username,
            email: data.email,
            firstName: data.firstName || data.first_name,
            lastName: data.lastName || data.last_name,
            role: data.role || data.userRole
          };
        }

        console.log('🔍 Extracted values:', {
          sessionToken: sessionToken ? `Found (${sessionToken.substring(0, 20)}...)` : 'Missing',
          refreshToken: refreshToken ? 'Found' : 'Missing',
          tokenExpiry: tokenExpiry ? 'Found' : 'Missing',
          userData: userData ? 'Found' : 'Missing',
          userDataKeys: userData ? Object.keys(userData) : []
        });

        // If still no token found, try to proceed anyway for debugging
        if (!sessionToken) {
          console.warn('⚠️ No session token found. Attempting to use response as token for debugging...');
          console.log('Available response structure:', JSON.stringify(data, null, 2));
          
          // Last resort: check if the entire response might be the token (for some APIs)
          if (typeof data === 'string') {
            sessionToken = data;
          } else {
            throw new Error(`Login response missing required token. Available fields: ${Object.keys(data).join(', ')}`);
          }
        }
        
        // Store tokens with validation
        try {
          localStorage.setItem('sessionToken', sessionToken);
          localStorage.setItem('refreshToken', refreshToken || '');
          localStorage.setItem('tokenExpiry', tokenExpiry || '');
          localStorage.setItem('user', JSON.stringify(userData || { username: credentials.username }));
          
          console.log('💾 Tokens stored successfully');
        } catch (storageError) {
          console.error('❌ Error storing tokens:', storageError);
          throw new Error('Failed to store authentication data');
        }
        
        // Immediate verification
        const verification = {
          storedToken: localStorage.getItem('sessionToken'),
          storedRefreshToken: localStorage.getItem('refreshToken'),
          storedUser: localStorage.getItem('user'),
          storedExpiry: localStorage.getItem('tokenExpiry')
        };
        
        console.log('🔍 Storage verification:', verification);

        // Start token refresh monitoring (only if we have a refresh token)
        this.startTokenRefresh();
        this.startSessionCheck();

        return {
          ...data,
          token: sessionToken,
          refreshToken: refreshToken,
          user: userData || { username: credentials.username },
          expiresAt: tokenExpiry
        };
      } catch (error) {
        console.error('💥 Login error:', error);
        throw error;
      }
    }

    // Enhanced token getter with debugging
    getToken() {
      try {
        const token = localStorage.getItem('sessionToken');
        console.log('🎫 Getting token:', {
          tokenExists: !!token,
          tokenLength: token ? token.length : 0,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
        });
        return token;
      } catch (error) {
        console.error('❌ Error getting token:', error);
        return null;
      }
    }

    // Enhanced user getter with debugging
    getCurrentUser() {
      try {
        const userStr = localStorage.getItem('user');
        console.log('👤 Getting user - raw string:', {
          hasUserData: !!userStr,
          userStringLength: userStr ? userStr.length : 0,
          userStringPreview: userStr ? userStr.substring(0, 100) + '...' : 'null'
        });
        
        if (!userStr) {
          console.warn('⚠️ No user data found in storage');
          return null;
        }
        
        const user = JSON.parse(userStr);
        console.log('👤 Parsed user:', {
          user: user,
          userKeys: Object.keys(user || {}),
          hasId: !!(user?.id || user?.userId || user?._id),
          hasUsername: !!(user?.username || user?.email)
        });
        
        return user;
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('user'); // Clear corrupted data
        return null;
      }
    }

    // Enhanced authentication check
    isAuthenticated() {
      try {
        const token = this.getToken();
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const user = this.getCurrentUser();
        
        const authStatus = {
          hasToken: !!token,
          hasExpiry: !!tokenExpiry,
          hasUser: !!user,
          isExpired: tokenExpiry ? new Date(tokenExpiry).getTime() <= Date.now() : true,
          expiryDate: tokenExpiry ? new Date(tokenExpiry).toISOString() : null,
          currentTime: new Date().toISOString()
        };
        
        console.log('🔐 Auth check status:', authStatus);
        
        const isValid = authStatus.hasToken && authStatus.hasUser && !authStatus.isExpired;
        console.log('✅ Authentication valid:', isValid);
        
        return isValid;
      } catch (error) {
        console.error('❌ Error checking authentication:', error);
        return false;
      }
    }

    // Debug method to check storage state
    debugStorage() {
      console.log('🔍 Storage Debug Report:', {
        sessionToken: localStorage.getItem('sessionToken') ? 'Present' : 'Missing',
        refreshToken: localStorage.getItem('refreshToken') ? 'Present' : 'Missing',
        tokenExpiry: localStorage.getItem('tokenExpiry') ? 'Present' : 'Missing',
        user: localStorage.getItem('user') ? 'Present' : 'Missing',
        allStorageKeys: Object.keys(localStorage),
        storageLength: localStorage.length
      });
      
      // Try to parse and display user data
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('👤 Current user data:', user);
        }
      } catch (e) {
        console.error('❌ Error parsing stored user data:', e);
      }
    }

    // Rest of your methods remain the same...
    async logout(force = false) {
      try {
        const token = this.getToken();
        
        if (token && !force) {
          await fetch(`${this.baseURL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
        
        this.stopTokenRefresh();
        this.stopSessionCheck();
        
        console.log('🔐 Logged out and cleared storage');
      }
    }

    async refreshToken() {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        });
      }

      this.isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        
        localStorage.setItem('sessionToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiry', data.expiresAt);

        this.failedQueue.forEach(({ resolve }) => resolve(data.token));
        this.failedQueue = [];

        return data.token;
      } catch (error) {
        this.failedQueue.forEach(({ reject }) => reject(error));
        this.failedQueue = [];
        
        this.logout(true);
        throw error;
      } finally {
        this.isRefreshing = false;
      }
    }

    shouldRefreshToken() {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (!tokenExpiry) return false;
      
      const expiryTime = new Date(tokenExpiry).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      return timeUntilExpiry < 5 * 60 * 1000;
    }

    startTokenRefresh() {
      this.refreshTokenInterval = setInterval(async () => {
        if (this.shouldRefreshToken()) {
          try {
            await this.refreshToken();
          } catch (error) {
            console.error('Auto token refresh failed:', error);
          }
        }
      }, 60000);
    }

    stopTokenRefresh() {
      if (this.refreshTokenInterval) {
        clearInterval(this.refreshTokenInterval);
        this.refreshTokenInterval = null;
      }
    }

    startSessionCheck() {
      this.sessionCheckInterval = setInterval(async () => {
        try {
          await this.validateSession();
        } catch (error) {
          console.error('Session validation failed:', error);
          this.logout(true);
        }
      }, 5 * 60 * 1000);
    }

    stopSessionCheck() {
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }
    }

    async validateSession() {
      const token = this.getToken();
      if (!token) throw new Error('No token available');

      const response = await fetch(`${this.baseURL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Session invalid');
      }

      return response.json();
    }
}

const authService = new AuthService();

// Add global debug function for testing
window.debugAuth = () => authService.debugStorage();

export default authService;