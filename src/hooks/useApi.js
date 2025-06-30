import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export const useApi = () => {
  const { logout } = useAuth();

  const apiCall = async (url, options = {}) => {
    try {
      let token = authService.getToken();
      
      
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
          
          token = await authService.refreshToken();
          
          
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
