'use client';

import React from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/auth';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null
}) => {
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default PermissionGuard;
