
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
        
        // get fresh roles and permissions
        try {
          console.log('🔄 Loading fresh user roles and permissions...');
          const roleData = await authService.getUserRolesAndPermissions();
          console.log('✅ Fresh role data loaded:', roleData);
          setPermissions(roleData.permissions || {});
          setRoles(roleData.roles || []);
        } catch (roleError) {
          console.warn('⚠️ Failed to load fresh roles, using cached data:', roleError);
          
          const cachedPermissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
          const cachedRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
          setPermissions(cachedPermissions);
          setRoles(cachedRoles);
        }
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
        setPermissions({});
        setRoles([]);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setUser(null);
      setPermissions({});
      setRoles([]);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const hasPermission = (permission) => {
    return permissions[permission] === true;
  };

  const hasRole = (role) => {
    return roles.includes(role);
  };

  const hasAnyRole = (rolesList) => {
    return rolesList.some(role => roles.includes(role));
  };

  const refreshUserData = () => {
    loadUserData();
  };

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