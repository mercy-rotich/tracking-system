class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.refreshTokenInterval = null;
    this.sessionCheckInterval = null;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.refreshBuffer = 5 * 60 * 1000; 

    this.initializePageExitHandlers();
  }

  initializePageExitHandlers() {
    // Refreshes token when returning to the tab
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkAndRefreshToken();
      }
    });

    // Check token when window gains focus
    window.addEventListener('focus', () => {
      this.checkAndRefreshToken();
    });
  }

  logoutSync() {
    try {
      this.clearStorage();
      this.stopBackgroundServices();
    } catch (error) {
      console.error('Sync logout error:', error);
    }
  }

  async login(credentials) {
    try {
      console.log('🔐 Starting login process');

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      const responseData = data.data || data;

      const tokenInfo = this.extractTokenInfo(responseData, data);
      const userInfo = this.extractUserInfo(responseData, data, credentials);

      if (!tokenInfo.accessToken) {
        throw new Error('Login response missing required token');
      }

      this.storeAuthData(tokenInfo, userInfo);
      this.startBackgroundServices();

      return {
        ...data,
        token: tokenInfo.accessToken,
        user: userInfo
      };

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  extractTokenInfo(responseData, data) {
    return {
      accessToken: responseData.accessToken || responseData.token || data.accessToken || data.token,
      refreshToken: responseData.refreshToken || data.refreshToken,
      expiresIn: responseData.expiresIn || data.expiresIn,
      tokenType: responseData.tokenType || data.tokenType || 'Bearer'
    };
  }

  extractUserInfo(responseData, data, credentials) {
    const user = responseData.user || data.user || responseData;
    return {
      id: user.userId || user.id,
      username: user.username || credentials.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles || []
    };
  }

  storeAuthData(tokenInfo, userInfo) {
    const storage = {
      sessionToken: tokenInfo.accessToken,
      authToken: tokenInfo.accessToken, 
      refreshToken: tokenInfo.refreshToken || '',
      tokenExpiry: this.calculateExpiry(tokenInfo.expiresIn),
      user: JSON.stringify(userInfo),
      loginTime: new Date().toISOString()
    };

    Object.entries(storage).forEach(([key, value]) => {
      if (value) sessionStorage.setItem(key, value);
    });
  }

  validateTokenFormat(token) {
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
      
        return true; 
      }

      // Robust Base64Url decode
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        console.warn('⚠️ Token has expired');
        return false;
      }

      return true;
    } catch (error) {
      console.warn('⚠️ Token format warning (client-side):', error);
      return true;
    }
  }

  calculateExpiry(expiresIn) {
    if (!expiresIn) return '';
    const expiryTime = typeof expiresIn === 'number'
      ? Date.now() + (expiresIn * 1000) 
      : new Date(expiresIn).getTime();
    return new Date(expiryTime).toISOString();
  }

  startBackgroundServices() {
    this.startTokenRefresh();
    this.startSessionCheck();
  }

  stopBackgroundServices() {
    [this.refreshTokenInterval, this.sessionCheckInterval].forEach(interval => {
      if (interval) clearInterval(interval);
    });
    this.refreshTokenInterval = null;
    this.sessionCheckInterval = null;
  }

  async refreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
     
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newToken = data.data?.accessToken || data.accessToken || data.token;

      if (!newToken) throw new Error('Refresh response missing new token');
      
     
      sessionStorage.setItem('sessionToken', newToken);
      sessionStorage.setItem('authToken', newToken);
      
      if (data.data?.refreshToken || data.refreshToken) {
        sessionStorage.setItem('refreshToken', data.data?.refreshToken || data.refreshToken);
      }
      
      if (data.data?.expiresIn || data.expiresIn) {
        sessionStorage.setItem('tokenExpiry', this.calculateExpiry(data.data?.expiresIn || data.expiresIn));
      }

      this.failedQueue.forEach(({ resolve }) => resolve(newToken));
      this.failedQueue = [];

      return newToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      this.logout();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  shouldRefreshToken() {
  
    const tokenExpiry = sessionStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return false;
    const timeUntilExpiry = new Date(tokenExpiry).getTime() - Date.now();
    return timeUntilExpiry < this.refreshBuffer;
  }

  async checkAndRefreshToken() {
    if (!this.isAuthenticated()) return false;
    if (this.shouldRefreshToken()) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  }

  startTokenRefresh() {
    if (this.refreshTokenInterval) clearInterval(this.refreshTokenInterval);
    this.refreshTokenInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        await this.checkAndRefreshToken();
      }
    }, 60000); 
  }

  async validateSession() {
    const token = this.getToken();
    if (!token) throw new Error('No token available');

    const response = await fetch(`${this.baseURL}/auth/validate`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      
      if (response.status === 401 && sessionStorage.getItem('refreshToken')) {
        await this.refreshToken();
        return { valid: true, refreshed: true };
      }
      throw new Error('Session invalid');
    }
    return response.json();
  }

  startSessionCheck() {
    if (this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);
    this.sessionCheckInterval = setInterval(async () => {
      try {
        await this.validateSession();
      } catch (error) {
        // Try refresh one last time before logout
        if (sessionStorage.getItem('refreshToken')) {
          try {
            await this.refreshToken();
            return;
          } catch (e) {
           
          }
        }
        this.logout();
      }
    }, 5 * 60 * 1000); 
  }

  isAuthenticated() {
    const token = this.getToken();
    const tokenExpiry = sessionStorage.getItem('tokenExpiry');
    const user = this.getCurrentUser();

    // Basic validity check
    if (!token || !user) return false;

    // Check expiry if it exists
    if (tokenExpiry) {
      return new Date(tokenExpiry).getTime() > Date.now();
    }

    return true;
  }

  async logout() {
    console.log('Performing client-side logout...');
    this.clearStorage();
    this.stopBackgroundServices();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authLogout', {
        detail: { timestamp: new Date().toISOString() }
      }));
    }
  }

  clearStorage() {
    const keys = ['sessionToken', 'authToken', 'refreshToken', 'tokenExpiry', 'user', 'loginTime', 'userPermissions', 'userRoles'];
    
    keys.forEach(key => {
     
      sessionStorage.removeItem(key);
      // Clean up localStorage just in case to ensure full logout
      localStorage.removeItem(key);
    });
  }

  async getValidToken() {
    // If not authenticated (expired), try refresh first
    if (!this.isAuthenticated()) {
       try {
         await this.refreshToken();
       } catch (e) {
         throw new Error('Not authenticated');
       }
    }
    // Pre-emptive refresh
    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }
    return this.getToken();
  }

  getToken() {
    const token = sessionStorage.getItem('sessionToken') || sessionStorage.getItem('authToken');
    if (!token || !this.validateTokenFormat(token)) {
      return null;
    }
    return token;
  }

  getCurrentUser() {
    try {
     
      const userStr = sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      sessionStorage.removeItem('user');
      return null;
    }
  }

  async getUserRolesAndPermissions() {
    try {
      const token = await this.getValidToken();
      const response = await fetch(`${this.baseURL}/auth/roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch roles: ${response.status}`);
      const result = await response.json();

      
      sessionStorage.setItem('userPermissions', JSON.stringify(result.data.permissions));
      sessionStorage.setItem('userRoles', JSON.stringify(result.data.roles));

      return result.data;
    } catch (error) {
      console.error('❌ Error fetching user roles:', error);
      throw error;
    }
  }

  hasPermission(permission) {
    try {
    
      const permissions = JSON.parse(sessionStorage.getItem('userPermissions') || '{}');
      return permissions[permission] === true;
    } catch (e) { return false; }
  }

  hasRole(role) {
    try {
     
      const roles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
      return roles.includes(role);
    } catch (e) { return false; }
  }

  hasAnyRole(rolesList) {
    try {
     
      const userRoles = JSON.parse(sessionStorage.getItem('userRoles') || '[]');
      return rolesList.some(role => userRoles.includes(role));
    } catch (e) { return false; }
  }

  canManageUsers() { return this.hasPermission('canManageUsers'); }
  isAdmin() { return this.hasPermission('isAdmin') || this.hasRole('ADMIN'); }
  isDean() { return this.hasPermission('isDean') || this.hasRole('DEAN'); }

  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      shouldRefresh: this.shouldRefreshToken(),
      token: !!this.getToken()
    };
  }
}

const authService = new AuthService();

if (typeof window !== 'undefined') {
  window.authService = authService;
}

export default authService;