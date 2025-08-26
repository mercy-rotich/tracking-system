import axios from 'axios'
import authService from './authService'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = authService.getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }

            console.log('API Request', {
                method: config.method?.toUpperCase(),
                url: config.url,
                data: config.data instanceof FormData ? 'FormData' : config.data
            });
            
            return config;
        } catch (error) {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const newToken = await authService.refreshToken();

                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Redirect to login 
                authService.logout();
                return Promise.reject(refreshError);
            }
        }

        const errorResponse = {
            message: 'An unexpected error occurred', 
            status: error.response?.status,
            data: error.response?.data
        }

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    errorResponse.message = data?.message || 'Bad request - please check your input';
                    break;
                case 401:
                    errorResponse.message = 'Unauthorized - please log in again';
                    authService.logout(); 
                    break;
                case 403:
                    errorResponse.message = 'Forbidden - you don\'t have permission for this action';
                    break;
                case 404:
                    errorResponse.message = 'Resource not found';
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

        console.error('API Error:', errorResponse);
        return Promise.reject(errorResponse);
    }
);

export default apiClient;