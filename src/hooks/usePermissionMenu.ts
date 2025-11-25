import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  permission?: string;
  subMenus?: MenuItem[];
}

export interface Permission {
  id: string;
  fullName: string;
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
        // For now, use role-based permissions since your API doesn't return permissions
        const roleBasedPermissions = getDefaultPermissions(user.role);
        setUserPermissions(roleBasedPermissions);
        
        // If you want to fetch from API later, use this:
        // const response = await fetch(`http://localhost:5000/api/auth/me/${user.id}`);
        // const data = await response.json();
        // console.log('User data:', data);
        // 
        // // If the API returns permissions in the future
        // if (data.data?.permissions) {
        //   setUserPermissions(data.data.permissions.map((p: Permission) => p.name));
        // } else {
        //   // Fallback to role-based permissions
        //   const roleBasedPermissions = getDefaultPermissions(user.role);
        //   setUserPermissions(roleBasedPermissions);
        // }
      } catch (error: any) {
        console.error('Error fetching permissions:', error);
        // Fallback to role-based permissions
        const roleBasedPermissions = getDefaultPermissions(user.role);
        setUserPermissions(roleBasedPermissions);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  // Get default permissions based on role
  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          'Manage Users',
          'Manage Admins', 
          'Manage Super Admins',
          'System Configuration',
          'View Dashboard',
          'Manage Roles',
          'Delete System Roles',
          'Manage Tutors',
          'Manage Students',
          'Manage Payments',
          'Manage Testimonials',
          'Manage Courses',
          'Manage Platform'
        ];
      case 'ADMIN':
        return [
          'Manage Users',
          'Manage Tutors',
          'Manage Students',
          'View Dashboard',
          'Manage Payments',
          'Manage Testimonials',
          'Manage Courses'
        ];
      case 'MANAGER':
        return [
          'Manage Tutors',
          'Manage Students',
          'View Dashboard',
          'Manage Testimonials',
          'Manage Courses'
        ];
      case 'TUTOR':
        return [
          'View Profile',
          'Manage Availability'
        ];
      case 'STUDENT_GUARDIAN':
        return [
          'View Profile',
          'Find Tutors'
        ];
      default:
        return [];
    }
  };

  // Check if user has permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Admin has all permissions except super admin specific ones
    if (user.role === 'ADMIN') {
      const adminRestrictedPermissions = [
        'Manage Super Admins',
        'Delete System Roles',
        'System Configuration'
      ];
      return !adminRestrictedPermissions.includes(permission);
    }
    
    // Manager and other roles need explicit permissions
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
        // Only keep the item if it has visible submenus
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