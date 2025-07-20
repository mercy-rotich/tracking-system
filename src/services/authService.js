class AuthService{
  constructor(){
    this.baseURL = import.meta.env.VITE_BASE_URL;
    this.refreshTokenInterval = null;
    this.sessionCheckInterval = null;
    this.isRefreshing = false;
    this.failedQueue = [];
    this.refreshBuffer = 5 * 60 * 1000;

    this.initializePageExitHandlers();

  }

  initializePageExitHandlers(){
    //logs out user when closing tab/browser

    window.addEventListener('beforeunload',() => {
      console.log('page unloading,looging out....');
      this.logoutSync();

    });

    //refreshes token when returning to the tab
    document.addEventListener('visibilitychange',() =>{
      if(!document.hidden){
        this.checkAndrefreshToken();
      }
    });

     // Check token when window gains focus
     window.addEventListener('focus', () => {
      console.log('window focused,checking token ...');
      this.checkAndrefreshToken();
     })

  }

  logoutSync(){
    try{
      console.log(' Performing sync logout (client-side only)');
      this.clearStorage();
      this.stopBackgroundServices();
      console.log('sync logout completed')
    }catch (error){
      console.error('sync logout error:',error);
    
      this.clearStorage();
      this.stopBackgroundServices();
      
    }
  }

  async login(credentials){
    try{
      
        console.log('🔐 Starting login process');
  
        const response = await fetch(`${this.baseURL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

      if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      const responseData = data.data || data;

      //extract token information
      const tokenInfo = this.extractTokenInfo(responseData, data);
      const userInfo = this.extractUserInfo(responseData,data,credentials);

      if(!tokenInfo.accessToken){
        throw new Error('Login response missing required token');
      }

      //store authentication token
      this.storeAuthData(tokenInfo,userInfo);
      this.startBackgroundServices();

      console.log('✅ Login successful');
      return{
        ...data,
        token:tokenInfo.accessToken,
        user:userInfo
      };

    }catch(error){
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  //extract token information from response

  extractTokenInfo(responseData,data){
    return{
      accessToken: responseData.accessToken || responseData.token || data.accessToken || data.token,
      refreshToken: responseData.refreshToken || data.refreshToken,
      expiresIn: responseData.expiresIn || data.expiresIn,
      tokenType: responseData.tokenType || data.tokenType || 'Bearer'
    };
  }

  //extract user information from response
  extractUserInfo(responseData,data,credentials){
    const user =  responseData.user || data.user || responseData;
    return{
      id:user.userId || user.id,
      username:user.username || credentials.username,
      email: user.email,
      firstName:user.firstName,
      lastName: user.lastName,
      roles: user.roles || []

    };
  }

  //store authentication data
  storeAuthData(tokenInfo,userInfo){
    const storage = {
      sessionToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken || '',
      tokenExpiry: this.calculateExpiry(tokenInfo.expiresIn),
      user: JSON.stringify(userInfo),
      loginTime: new Date().toISOString()
    };

    Object.entries(storage).forEach(([key,value]) =>{
      localStorage.setItem(key,value);
    });
    console.log('Authentication data stored');
  }

  validateTokenFormat(token){
    if(!token) return false;

    try{
      const parts = token.split('.');
      if(parts.length !== 3 ) return false;

      //decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if(payload.exp && payload.exp < currentTime){
        console.warn('⚠️ Token has expired')
        return false;
      }

      return true;
    }catch (error){
      console.error('❌ Invalid token format:', error);
      return false;
    }
  }

  calculateExpiry(expiresIn){
    if(!expiresIn) return '';

    const expiryTime = typeof expiresIn === 'number'
    ?Date.now() + expiresIn
    :new Date(expiresIn).getTime();

    return new Date(expiryTime).toISOString();
  }

  startBackgroundServices(){
    this.startTokenRefresh();
    this.startSessionCheck();
    console.log('Background services started')
  }
  
  stopBackgroundServices(){
    [this.refreshTokenInterval, this.sessionCheckInterval].forEach(interval =>{
      if(interval) clearInterval(interval)
    });
  this.refreshTokenInterval = null;
  this.sessionCheckInterval = null;
  console.log(' Background services stopped');
 }

 async refreshToken(){
  if (this.isRefreshing){
    return new Promise((resolve,reject) =>{
      this.failedQueue.push({resolve,reject});
    });
  }

  this.isRefreshing = true;
  console.log('🔄 Refreshing token...');

  try{
    const refreshToken = localStorage.getItem('refreshToken');
    if(!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method:'POST',
      headers:{'content-Type': 'application/json'},
      body: JSON.stringify({refreshToken}),
    });

    if(!response.ok) {
      const errorData = await response.json().catch(() =>({}));
      throw new Error(errorData.message || 'Token refresh failed');
    }

    const data = await response.json();
    const newToken = data.accessToken || data.token;

    if(!newToken) throw new Error('Refresh response missing nwe token');

    localStorage.setItem('sessionToken', newToken);
    localStorage.setItem('refreshToken', data.refreshToken || refreshToken);
    if(data.expiresIn){
      localStorage.setItem('tokenExpiry',this.calculateExpiry(data.expiresIn));
    }

    //resolve queue requests
    this.failedQueue.forEach(({resolve}) => resolve(newToken));
    this.failedQueue = [];

    console.log('✅ Token refreshed successfully')
    return newToken;
  }catch(error){
    console.error('❌ Token refresh failed:', error);
    
    this.failedQueue.forEach(({reject}) => reject(error));
    this.failedQueue = [];

    if(error.message.includes('refresh token') || error.message.includes('unauthorized')) {
      this.logout()
    }

    throw error;
    
  }finally {
    this.isRefreshing = false;
  }
 }

 //check if token should be refreshed
 shouldRefreshToken() {
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  if(!tokenExpiry) return false;

  const timeUntilExpiry = new Date(tokenExpiry).getTime() - Date.now();
  return timeUntilExpiry < this.refreshBuffer;
 }

 //check and refresh token if needed
 async checkAndrefreshToken() {
  if(!this.isAuthenticated()) return false;
  if(this.shouldRefreshToken()){
    try{
      await this.refreshToken();
      return true;
    }catch (error) {
      console.error('Background token refresh failed:', error);
      return false;
    }
  }
  return true;

 }
 //start token refresh monitoring
 startTokenRefresh() {
  if(this.refreshTokenInterval) clearInterval(this.refreshTokenInterval);
  this.refreshTokenInterval = setInterval(async () => {
    if(this.isAuthenticated()) {
      await this.checkAndrefreshToken();
    }
  },60000);

  console.log('⏰ Token refresh monitoring started')
}

async validateSession() {
  const token = this.getToken();
  if(!token) throw new Error('No token available');

  const response = await fetch(`${this.baseURL}/auth/validate`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if(!response.ok) {
    if(response.status === 401 && localStorage.getItem('refreshToken')) {
      await this.refreshToken();
      return {valid: true,refreshed:true};
    }
    throw new Error('Session invalid');
  }

  return response.json();
}

//start session validation monitoring
startSessionCheck(){
  if(this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);

  this.sessionCheckInterval = setInterval(async () => {
    try{
      await this.validateSession();
      console.log('✅ Session valid')
    }catch (error) {
      console.error('❌ Session validation failed:', error);

      if(localStorage.getItem('refreshToken')) {
        try{
          await this.refreshToken();
          return;
        } catch(refreshError) {
          console.error('❌ Failed to recover session:', refreshError);
        }
      }
      this.logout();
    }
  },5*60*1000);

  console.log('🔍 Session validation started');
}

//authentication check
isAuthenticated() {
  try {
    const token = this.getToken();
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const user = this.getCurrentUser();
    
    // Enhanced validation
    const hasValidToken = token && this.validateTokenFormat(token);
    const hasUser = user && user.id;
    const notExpired = !tokenExpiry || new Date(tokenExpiry).getTime() > Date.now();
    
    const isValid = hasValidToken && hasUser && notExpired;
    
    if (!isValid) {
      console.warn('⚠️ Authentication validation failed:', {
        hasValidToken,
        hasUser,
        notExpired,
        tokenExpiry
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('❌ Authentication check error:', error);
    return false;
  }
}

async logout() {
  
    console.log(' Performing client-side logout...');
    this.clearStorage();
    this.stopBackgroundServices();

    console.log(' Logged out successfully');
    if(typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authLogout', {
        detail: {timestamp: new Date().toISOString()}
      }));
    }
  }


clearStorage() {
  ['sessionToken', 'refreshToken', 'tokenExpiry', 'user', 'loginTime', 'userPermissions', 'userRoles']
    .forEach(key => localStorage.removeItem(key));
    console.log('🧹 Local storage cleared');
}

// Get valid token
async getValidToken() {
  if (!this.isAuthenticated()) {
    throw new Error('Not authenticated');
  }

  if (this.shouldRefreshToken()) {
    await this.refreshToken();
  }

  return this.getToken();
}

//get token with validation
getToken() {
  try{
    const token = localStorage.getItem('sessionToken');
    if(!token || !this.validateTokenFormat(token)) {
      return null;

    }
    return token;

  }catch (error){
    console.error('❌ Error getting token:', error);
      return null;
  }
}

getCurrentUser(){
  try{
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }catch(error){
    console.error('❌ Error parsing user data:', error);
    localStorage.removeItem('user');
    return null;
  }
}

//roles and permissions methods
async getUserRolesAndPermissions(){
  try{
    const token = this.getToken();
    if(!token) throw new Error('No authentication token available')

      const response = await fetch(`${this.baseURL}/auth/roles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if(!response.ok) {
        if(response.status === 401) {
          await this.refreshToken();
          return this.getUserRolesAndPermissions();
        }
        throw new Error (`Failed to fetch roles: ${response.status}`)
      }
      const result = await response.json();

       // Store permissions and roles
       localStorage.setItem('userPermissions', JSON.stringify(result.data.permissions));
       localStorage.setItem('userRoles', JSON.stringify(result.data.roles));

       return result.data;
  }catch (error) {
    console.error('❌ Error fetching user roles:', error);
    throw error;
  }
}

// Permission and role checks
hasPermission(permission) {
  try {
    const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
    return permissions[permission] === true;
  }catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}
hasRole(role){
  try{
    const roles = JSON.parse(localStorage.getItem('userRoles')|| '[]');
    return roles.includes(role);
  }catch(error){
    console.error('Error checking role:', error);
    return false;
  }
}

hasAnyRole(rolesList) {
  try {
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    return rolesList.some(role => userRoles.includes(role));
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
}

 canManageUsers() {
  return this.hasPermission('canManageUsers');
 }

 isAdmin() {
  return this.hasPermission('isAdmin') || this.hasRole('ADMIN');
}

isDean() {
  return this.hasPermission('isDean') || this.hasRole('DEAN');
}

// Debug methods
getAuthStatus() {
  return {
    isAuthenticated: this.isAuthenticated(),
    shouldRefresh: this.shouldRefreshToken(),
    isRefreshing: this.isRefreshing,
    servicesRunning: {
      tokenRefresh: !!this.refreshTokenInterval,
      sessionCheck: !!this.sessionCheckInterval
    }
  };
}
}
// Create singleton instance
const authService = new AuthService();

// Debug helpers
if (typeof window !== 'undefined') {
  window.debugAuth = () => console.log(authService.getAuthStatus());
  window.forceRefresh = () => authService.refreshToken();
  window.manualLogout = () => authService.logout();
}

export default authService;