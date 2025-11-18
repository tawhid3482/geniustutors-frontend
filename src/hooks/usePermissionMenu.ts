import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { api } from '@/config/api';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  permission?: string;
  subMenus?: MenuItem[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export function usePermissionMenu() {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setUserPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/permissions');
        console.log('Permissions response:', response);
        const permissions = response.permissions || response.data?.permissions || [];
        setUserPermissions(permissions.map((p: Permission) => p.name));
      } catch (error: any) {
        console.error('Error fetching permissions:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          isNetworkError: error.isNetworkError
        });
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Admin has all permissions except super admin specific ones
    if (user.role === 'admin') {
      const adminRestrictedPermissions = [
        'Manage Super Admins',
        'Delete System Roles',
        'System Configuration'
      ];
      return !adminRestrictedPermissions.includes(permission);
    }
    
    // Manager and other roles need explicit permissions from database
    return userPermissions.includes(permission);
  };

  // Check if user has any of the given permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the given permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Filter menu items based on permissions
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // If no permission required, show the item
      if (!item.permission) return true;
      
      // Check if user has the required permission
      if (!hasPermission(item.permission)) return false;
      
      // If item has submenus, filter them too
      if (item.subMenus) {
        const filteredSubMenus = filterMenuItems(item.subMenus);
        if (filteredSubMenus.length === 0) return false;
        item.subMenus = filteredSubMenus;
      }
      
      return true;
    });
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    filterMenuItems,
    loading
  };
}

