
import React from 'react';
import { useAuth } from '../../hooks/UseAuth';

const PermissionWrapper = ({ 
  children, 
  permission = null, 
  role = null, 
  anyRole = null,
  fallback = null,
  showFallback = true,
  requireAll = false 
}) => {
  const { hasPermission, hasRole, hasAnyRole, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="permission-loading">
        <i className="fas fa-spinner fa-spin"></i>
        Loading permissions...
      </div>
    );
  }

  // If not authenticated, deny access
  if (!isAuthenticated) {
    return showFallback && fallback ? <>{fallback}</> : null;
  }

  let hasAccess = true;
  const conditions = [];

  // Check permission
  if (permission) {
    conditions.push(hasPermission(permission));
  }

  // Check specific role
  if (role) {
    conditions.push(hasRole(role));
  }

  // Check any of the roles
  if (anyRole) {
    conditions.push(hasAnyRole(anyRole));
  }

  // Determine access based on requireAll flag
  if (requireAll) {
    
    hasAccess = conditions.length > 0 && conditions.every(condition => condition);
  } else {
    
    hasAccess = conditions.length > 0 && conditions.some(condition => condition);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback) {
    return <>{fallback}</>;
  }

  return null;
};

export default PermissionWrapper;