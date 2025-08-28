import axios from 'axios'
import authService from './authService'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 15000, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};


apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Get token with automatic refresh check
            const token = await authService.getValidToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Handle FormData
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }

            console.log('🔄 API Request', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data instanceof FormData ? 'FormData' : 
                      typeof config.data === 'object' ? JSON.stringify(config.data)?.substring(0, 200) + '...' : 
                      config.data,
                hasAuth: !!config.headers.Authorization
            });
            
            return config;
        } catch (error) {
            console.error('❌ Request interceptor error:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
            dataCount: Array.isArray(response.data) ? response.data.length : 
                      response.data?.data?.trackings?.length || 
                      response.data?.data?.length || 
                      'unknown'
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            console.error('❌ Network Error:', error.message);
            return Promise.reject({
                message: 'Network error - please check your connection',
                status: 'network_error',
                originalError: error
            });
        }

        const { status } = error.response;
        
        // 401 handling with refresh token logic
        if (status === 401 && !originalRequest._retry) {
            console.log('🔄 Received 401, attempting token refresh...');
            
            if (isRefreshing) {
                // If refresh is already in progress, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await authService.refreshToken();
                
                if (newToken) {
                    console.log('✅ Token refreshed successfully');
                    
                    
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    
                   
                    processQueue(null, newToken);
                    
                   
                    return apiClient(originalRequest);
                } else {
                    throw new Error('No new token received');
                }
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                
                
                processQueue(refreshError, null);
                
                // Logout user
                authService.logout();
                
                return Promise.reject({
                    message: 'Session expired. Please log in again.',
                    status: 401,
                    requiresReauth: true,
                    originalError: refreshError
                });
            } finally {
                isRefreshing = false;
            }
        }

       
        const errorResponse = {
            message: 'An unexpected error occurred',
            status: error.response?.status,
            data: error.response?.data,
            originalError: error
        };

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorResponse.message = data?.message || 'Bad request - please check your input';
                    break;
                case 401:
                    errorResponse.message = 'Unauthorized - please log in again';
                    errorResponse.requiresReauth = true;
                    break;
                case 403:
                    errorResponse.message = 'Forbidden - you don\'t have permission for this action';
                    break;
                case 404:
                    errorResponse.message = data?.message || 'Resource not found';
                    break;
                case 422:
                    errorResponse.message = data?.message || 'Validation error - please check your input';
                    break;
                case 429:
                    errorResponse.message = 'Too many requests - please try again later';
                    break;
                case 500:
                    errorResponse.message = 'Server error - please try again later';
                    break;
                case 503:
                    errorResponse.message = 'Service temporarily unavailable';
                    break;
                default:
                    errorResponse.message = data?.message || `Request failed with status ${status}`;
            }
        } else if (error.request) {
            errorResponse.message = 'Network error - please check your connection';
        } else if (error.code === 'ECONNABORTED') {
            errorResponse.message = 'Request timeout - please try again';
        }

        console.error('❌ API Error:', {
            status: errorResponse.status,
            message: errorResponse.message,
            url: originalRequest?.url,
            method: originalRequest?.method
        });
        
        return Promise.reject(errorResponse);
    }
);


const requestQueue = new Map();

//function to handle request deduplication
const deduplicateRequests = (config) => {
    const requestKey = `${config.method}-${config.url}-${JSON.stringify(config.params)}`;
    
    if (requestQueue.has(requestKey)) {
        console.log('🔄 Deduplicating request:', requestKey);
        return requestQueue.get(requestKey);
    }
    
    const requestPromise = axios(config).finally(() => {
        requestQueue.delete(requestKey);
    });
    
    requestQueue.set(requestKey, requestPromise);
    return requestPromise;
};

//  helper methods to apiClient
apiClient.getAuthStatus = () => ({
    isRefreshing,
    queueSize: failedQueue.length,
    pendingRequests: requestQueue.size
});

apiClient.clearQueue = () => {
    failedQueue = [];
    requestQueue.clear();
    console.log('🧹 API client queues cleared');
};

//  retry mechanism for failed requests
apiClient.withRetry = async (requestFn, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Request attempt ${attempt}/${maxRetries}`);
            const result = await requestFn();
            return result;
        } catch (error) {
            lastError = error;
            
            // Don't retry auth errors or client errors (4xx)
            if (error.status >= 400 && error.status < 500) {
                break;
            }
            
            // Don't retry on last attempt
            if (attempt === maxRetries) {
                break;
            }
            
            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
};

export default apiClient;