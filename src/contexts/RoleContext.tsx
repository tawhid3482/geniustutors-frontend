'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { User } from '@/utils/rolePermissions';

interface RoleContextType {
  user: User | null;
  canDelete: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canApprove: boolean;
  canSuspend: boolean;
  canManageRoles: boolean;
  hasElevatedPrivileges: boolean;
  isManager: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  user: User | null;
}

export function RoleProvider({ children, user }: RoleProviderProps) {
  const canDelete = user?.role === 'super_admin' || user?.role === 'admin';
  const canEdit = ['super_admin', 'admin', 'manager'].includes(user?.role || '');
  const canCreate = ['super_admin', 'admin', 'manager'].includes(user?.role || '');
  const canApprove = ['super_admin', 'admin', 'manager'].includes(user?.role || '');
  const canSuspend = user?.role === 'super_admin' || user?.role === 'admin';
  const canManageRoles = user?.role === 'super_admin' || user?.role === 'admin';
  const hasElevatedPrivileges = user?.role === 'super_admin' || user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const value: RoleContextType = {
    user,
    canDelete,
    canEdit,
    canCreate,
    canApprove,
    canSuspend,
    canManageRoles,
    hasElevatedPrivileges,
    isManager,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
