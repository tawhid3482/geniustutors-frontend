import { api } from '@/config/api';
import { getAuthHeaders } from '@/utils/auth';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  user_count: number;
  permission_count: number;
  canEdit?: boolean;
}

export interface RoleDetails {
  role: Role;
  permissions: Permission[];
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    status: string;
    assigned_at: string;
  }>;
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

export interface UserWithRoles {
  id: string;
  full_name: string;
  email: string;
  primary_role: string;
  status: string;
  created_at: string;
  assigned_roles: string;
}

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/role-management/roles');
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can manage roles.');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch roles');
  }
};

// Get all permissions
export const getPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await api.get('/role-management/permissions');
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching permissions:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can view permissions.');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch permissions');
  }
};

// Create a new role
export const createRole = async (roleData: CreateRoleData): Promise<{ message: string; roleId: string }> => {
  try {
    const response = await api.post('/role-management/roles', roleData);
    return response.data || response;
  } catch (error: any) {
    console.error('Error creating role:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can create roles.');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid role data');
    }
    throw new Error(error.response?.data?.error || 'Failed to create role');
  }
};

// Update a role
export const updateRole = async (roleId: string, roleData: UpdateRoleData): Promise<{ message: string }> => {
  try {
    const response = await api.put(`/role-management/roles/${roleId}`, roleData);
    return response.data || response;
  } catch (error: any) {
    console.error('Error updating role:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can update roles.');
    }
    if (error.response?.status === 404) {
      throw new Error('Role not found');
    }
    throw new Error(error.response?.data?.error || 'Failed to update role');
  }
};

// Delete a role
export const deleteRole = async (roleId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/role-management/roles/${roleId}`);
    return response.data || response;
  } catch (error: any) {
    console.error('Error deleting role:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can delete roles.');
    }
    if (error.response?.status === 404) {
      throw new Error('Role not found');
    }
    throw new Error(error.response?.data?.error || 'Failed to delete role');
  }
};

// Get role details
export const getRoleDetails = async (roleId: string): Promise<RoleDetails> => {
  try {
    const response = await api.get(`/role-management/roles/${roleId}`);
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching role details:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can view role details.');
    }
    if (error.response?.status === 404) {
      throw new Error('Role not found');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch role details');
  }
};

// Get role permissions with module grouping
export const getRolePermissions = async (roleId: string): Promise<{
  role: Role;
  permissions: Record<string, Permission[]>;
  totalPermissions: number;
}> => {
  try {
    const response = await api.get(`/role-management/roles/${roleId}/permissions`);
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching role permissions:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can view role permissions.');
    }
    if (error.response?.status === 404) {
      throw new Error('Role not found');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch role permissions');
  }
};

// Assign role to user
export const assignRoleToUser = async (userId: string, roleId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/role-management/users/${userId}/roles`, { roleId });
    return response.data || response;
  } catch (error: any) {
    console.error('Error assigning role to user:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can assign roles.');
    }
    if (error.response?.status === 404) {
      throw new Error('User or role not found');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Role is already assigned to this user');
    }
    throw new Error(error.response?.data?.error || 'Failed to assign role');
  }
};

// Remove role from user
export const removeRoleFromUser = async (userId: string, roleId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/role-management/users/${userId}/roles/${roleId}`);
    return response.data || response;
  } catch (error: any) {
    console.error('Error removing role from user:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can remove roles.');
    }
    if (error.response?.status === 404) {
      throw new Error('Role assignment not found');
    }
    throw new Error(error.response?.data?.error || 'Failed to remove role');
  }
};

// Get users with their roles
export const getUsersWithRoles = async (): Promise<UserWithRoles[]> => {
  try {
    const response = await api.get('/role-management/users');
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching users with roles:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can view user roles.');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

// Get user permissions
export const getUserPermissions = async (userId: string): Promise<{ permissions: Record<string, Permission[]>; totalPermissions: number }> => {
  try {
    const response = await api.get(`/role-management/user-permissions/${userId}`);
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching user permissions:', error);
    if (error.response?.status === 403) {
      throw new Error('Access denied. Only administrators can view user permissions.');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch user permissions');
  }
};

// Get current user's permissions
export const getMyPermissions = async (): Promise<{ permissions: Record<string, boolean>; totalPermissions: number }> => {
  try {
    const response = await api.get('/role-management/my-permissions');
    return response.data || response;
  } catch (error: any) {
    console.error('Error fetching my permissions:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch permissions');
  }
};

// Check if current user has specific permission
export const hasPermission = async (permissionName: string): Promise<boolean> => {
  try {
    const { permissions } = await getMyPermissions();
    return permissions[permissionName] === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Check if current user has any of the specified permissions
export const hasAnyPermission = async (permissionNames: string[]): Promise<boolean> => {
  try {
    const { permissions } = await getMyPermissions();
    return permissionNames.some(name => permissions[name] === true);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Group permissions by module for better organization
export const groupPermissionsByModule = (permissions: Permission[]) => {
  if (!permissions || !Array.isArray(permissions)) {
    return {};
  }
  
  return permissions.reduce((groups, permission) => {
    if (!groups[permission.module]) {
      groups[permission.module] = [];
    }
    groups[permission.module].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);
};

// Check if a role can be edited
export const canEditRole = (role: Role): boolean => {
  return !role.is_system_role || role.name === 'Manager';
};

// Get permission display name
export const getPermissionDisplayName = (permission: Permission) => {
  const actionMap: Record<string, string> = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    approve: 'Approve',
    process: 'Process',
    refund: 'Refund',
    export: 'Export',
    settings: 'Manage Settings',
    logs: 'View Logs',
    roles: 'Manage Roles'
  };

  const moduleMap: Record<string, string> = {
    users: 'Users',
    tutors: 'Tutors',
    jobs: 'Jobs',
    content: 'Content',
    payments: 'Payments',
    analytics: 'Analytics',
    system: 'System'
  };

  const action = actionMap[permission.action] || permission.action;
  const permissionModule = moduleMap[permission.module] || permission.module;

  return `${action} ${permissionModule}`;
};
