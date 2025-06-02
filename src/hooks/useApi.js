import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

// Custom hook for API calls with automatic token handling
export const useApi = () => {
  const { logout } = useAuth();

  const apiCall = async (url, options = {}) => {
    try {
      let token = authService.getToken();
      
      // Check if token needs refresh before making the call
      if (authService.shouldRefreshToken()) {
        token = await authService.refreshToken();
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      // Handle token expiration
      if (response.status === 401) {
        try {
          // Try to refresh token
          token = await authService.refreshToken();
          
          // Retry the original request
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              ...options.headers,
            },
          });
          
          return retryResponse;
        } catch (refreshError) {
          // Refresh failed, logout user
          logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  return { apiCall };
};
