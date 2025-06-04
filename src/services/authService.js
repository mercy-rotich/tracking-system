// services/authService.js
class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.refreshTokenInterval = null;
    this.sessionCheckInterval = null;
    this.activityCheckInterval = null;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.lastActivity = Date.now();
    this.refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry
    this.maxInactivityTime = 30 * 60 * 1000; // 30 minutes of inactivity
    this.activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Start monitoring user activity immediately
    this.initializeActivityMonitoring();
  }

  // Initialize user activity monitoring
  initializeActivityMonitoring() {
    const updateActivity = () => {
      this.lastActivity = Date.now();
      console.log('🔄 User activity detected at:', new Date().toISOString());
    };

    // Add event listeners for user activity
    this.activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Also monitor visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        updateActivity();
        // Check if token needs refresh when user returns to tab
        this.checkAndRefreshToken();
      }
    });
  }

  // Enhanced login method with improved token management
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Login failed with error:', errorData);
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Extract tokens and user data (your existing logic)
      let sessionToken = null;
      let refreshToken = null;
      let tokenExpiry = null;
      let userData = null;

      const responseData = data.data || data;
      
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

      if (!sessionToken) {
        throw new Error(`Login response missing required token. Available fields: ${Object.keys(data).join(', ')}`);
      }

      // Convert relative expiry to absolute timestamp if needed
      if (tokenExpiry && typeof tokenExpiry === 'number' && tokenExpiry < Date.now()) {
        // Assume it's seconds from now
        tokenExpiry = new Date(Date.now() + (tokenExpiry * 1000)).toISOString();
      } else if (tokenExpiry && typeof tokenExpiry === 'number') {
        // Assume it's milliseconds timestamp
        tokenExpiry = new Date(tokenExpiry).toISOString();
      }
      
      // Store tokens
      localStorage.setItem('sessionToken', sessionToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('tokenExpiry', tokenExpiry || '');
      localStorage.setItem('user', JSON.stringify(userData || { username: credentials.username }));
      localStorage.setItem('loginTime', new Date().toISOString());
      
      console.log('💾 Tokens stored successfully');

      // Start all monitoring services
      this.startBackgroundServices();

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

  // Start all background services
  startBackgroundServices() {
    this.startTokenRefresh();
    this.startSessionCheck();
    this.startActivityBasedRefresh();
    console.log('🚀 Background authentication services started');
  }

  // Stop all background services
  stopBackgroundServices() {
    this.stopTokenRefresh();
    this.stopSessionCheck();
    this.stopActivityBasedRefresh();
    console.log('🛑 Background authentication services stopped');
  }

  // Enhanced token refresh with better error handling and retry logic
  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    console.log('🔄 Starting token refresh...');

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Token refresh failed');
      }

      const data = await response.json();
      
      // Extract new tokens using same logic as login
      const newToken = data.token || data.accessToken || data.access_token;
      const newRefreshToken = data.refreshToken || data.refresh_token || refreshToken;
      const newExpiry = data.expiresAt || data.expires_at || data.expiry;

      if (!newToken) {
        throw new Error('Refresh response missing new token');
      }

      // Store new tokens
      localStorage.setItem('sessionToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      if (newExpiry) {
        localStorage.setItem('tokenExpiry', newExpiry);
      }

      console.log('✅ Token refreshed successfully');

      // Resolve all queued requests
      this.failedQueue.forEach(({ resolve }) => resolve(newToken));
      this.failedQueue = [];

      return newToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // Reject all queued requests
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      
      // Only logout if it's a critical error (not network issues)
      if (error.message.includes('refresh token') || error.message.includes('unauthorized')) {
        console.log('🔐 Logging out due to refresh token failure');
        this.logout(true);
      }
      
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Check if token should be refreshed
  shouldRefreshToken() {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return false;
    
    const expiryTime = new Date(tokenExpiry).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    
    // Refresh if within the buffer time
    return timeUntilExpiry < this.refreshBuffer;
  }

  // Check and refresh token if needed
  async checkAndRefreshToken() {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.shouldRefreshToken()) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        console.error('Background token refresh failed:', error);
        return false;
      }
    }
    
    return true;
  }

  // Enhanced periodic token refresh
  startTokenRefresh() {
    this.stopTokenRefresh(); // Clear any existing interval
    
    this.refreshTokenInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        await this.checkAndRefreshToken();
      }
    }, 60000); // Check every minute

    console.log('⏰ Token refresh monitoring started (every 60 seconds)');
  }

  stopTokenRefresh() {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
      console.log('⏰ Token refresh monitoring stopped');
    }
  }

  // Activity-based refresh - refresh token when user is active and token is near expiry
  startActivityBasedRefresh() {
    this.stopActivityBasedRefresh(); // Clear any existing interval
    
    this.activityCheckInterval = setInterval(async () => {
      const timeSinceActivity = Date.now() - this.lastActivity;
      
      // Only refresh if user has been active recently
      if (timeSinceActivity < this.maxInactivityTime) {
        if (this.isAuthenticated() && this.shouldRefreshToken()) {
          console.log('🔄 Activity-based token refresh triggered');
          await this.checkAndRefreshToken();
        }
      } else {
        console.log(`😴 User inactive for ${Math.round(timeSinceActivity / 60000)} minutes`);
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    console.log('👆 Activity-based refresh monitoring started');
  }

  stopActivityBasedRefresh() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
      console.log('👆 Activity-based refresh monitoring stopped');
    }
  }

  // Enhanced session validation
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
      // Try to refresh token before giving up
      if (response.status === 401 && localStorage.getItem('refreshToken')) {
        console.log('🔄 Session invalid, attempting token refresh...');
        await this.refreshToken();
        return { valid: true, refreshed: true };
      }
      throw new Error('Session invalid');
    }

    return response.json();
  }

  // Enhanced session checking with automatic refresh
  startSessionCheck() {
    this.stopSessionCheck(); // Clear any existing interval
    
    this.sessionCheckInterval = setInterval(async () => {
      try {
        await this.validateSession();
        console.log('✅ Session validation successful');
      } catch (error) {
        console.error('❌ Session validation failed:', error);
        
        // Try to refresh token before logging out
        if (localStorage.getItem('refreshToken')) {
          try {
            await this.refreshToken();
            console.log('✅ Session recovered via token refresh');
            return;
          } catch (refreshError) {
            console.error('❌ Failed to recover session:', refreshError);
          }
        }
        
        // Only logout if we can't recover
        this.logout(true);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    console.log('🔍 Session validation monitoring started (every 5 minutes)');
  }

  stopSessionCheck() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('🔍 Session validation monitoring stopped');
    }
  }

  // Method to manually trigger refresh (useful for API interceptors)
  async ensureValidToken() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }

    return this.getToken();
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
      
      const isValid = authStatus.hasToken && authStatus.hasUser && !authStatus.isExpired;
      
      return isValid;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }

  // Enhanced logout
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
      // Clear storage
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      
      // Stop all background services
      this.stopBackgroundServices();
      
      console.log('🔐 Logged out and cleared all data');
    }
  }

  // Get token with automatic refresh if needed
  async getValidToken() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }

    return this.getToken();
  }

  // Original methods (kept for compatibility)
  getToken() {
    try {
      const token = localStorage.getItem('sessionToken');
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  // Debug methods
  debugStorage() {
    const loginTime = localStorage.getItem('loginTime');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const timeSinceLogin = loginTime ? Date.now() - new Date(loginTime).getTime() : 0;
    const timeUntilExpiry = tokenExpiry ? new Date(tokenExpiry).getTime() - Date.now() : 0;
    
    console.log('🔍 Storage Debug Report:', {
      sessionToken: localStorage.getItem('sessionToken') ? 'Present' : 'Missing',
      refreshToken: localStorage.getItem('refreshToken') ? 'Present' : 'Missing',
      tokenExpiry: localStorage.getItem('tokenExpiry') ? 'Present' : 'Missing',
      user: localStorage.getItem('user') ? 'Present' : 'Missing',
      loginTime: loginTime,
      timeSinceLogin: `${Math.round(timeSinceLogin / 60000)} minutes`,
      timeUntilExpiry: `${Math.round(timeUntilExpiry / 60000)} minutes`,
      lastActivity: new Date(this.lastActivity).toISOString(),
      timeSinceActivity: `${Math.round((Date.now() - this.lastActivity) / 60000)} minutes`,
      backgroundServices: {
        tokenRefresh: !!this.refreshTokenInterval,
        sessionCheck: !!this.sessionCheckInterval,
        activityCheck: !!this.activityCheckInterval
      }
    });
  }

  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      shouldRefresh: this.shouldRefreshToken(),
      isRefreshing: this.isRefreshing,
      lastActivity: new Date(this.lastActivity).toISOString(),
      servicesRunning: {
        tokenRefresh: !!this.refreshTokenInterval,
        sessionCheck: !!this.sessionCheckInterval,
        activityCheck: !!this.activityCheckInterval
      }
    };
  }
}

const authService = new AuthService();

// Enhanced global debug functions
window.debugAuth = () => authService.debugStorage();
window.authStatus = () => authService.getAuthStatus();
window.forceRefresh = () => authService.refreshToken();

export default authService;