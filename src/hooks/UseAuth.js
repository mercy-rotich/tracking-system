import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      if (authService.isAuthenticated()) {
        const userData = authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        try {
          
          const roleData = await authService.getUserRolesAndPermissions();
          setPermissions(roleData.permissions || {});
          setRoles(roleData.roles || []);
        } catch (roleError) {
          console.warn('Using cached roles due to fetch error');
          const cachedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
          const cachedRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
          setPermissions(cachedPermissions);
          setRoles(cachedRoles);
        }
      } else {
        setUser(null);
        setPermissions({});
        setRoles([]);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();

   
    const handleLogout = () => {
      console.log('UseAuth detected logout event');
      setUser(null);
      setPermissions({});
      setRoles([]);
      setIsAuthenticated(false);
    };

    window.addEventListener('authLogout', handleLogout);
    return () => window.removeEventListener('authLogout', handleLogout);
  }, []);

  const hasPermission = (permission) => permissions[permission] === true;
  const hasRole = (role) => roles.includes(role);
  const hasAnyRole = (rolesList) => rolesList.some(role => roles.includes(role));
  const refreshUserData = () => loadUserData();

  const canManageUsers = hasPermission('canManageUsers') || hasRole('ADMIN');
  const canManageCurriculum = hasPermission('canManageCurriculum');
  const canViewReports = hasPermission('canViewReports');
  const isAdmin = hasPermission('isAdmin') || hasRole('ADMIN');
  const isDean = hasPermission('isDean') || hasRole('DEAN');
  const isViceChancellor = hasPermission('isViceChancellor');

  return {
    user,
    permissions,
    roles,
    isLoading,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyRole,
    refreshUserData,
    canManageUsers,
    canManageCurriculum,
    canViewReports,
    isAdmin,
    isDean,
    isViceChancellor
  };
};