/**
 * Role-based permission utilities
 * Centralized logic for determining what actions users can perform based on their role
 */

export interface User {
  id: string;
  role: string;
  [key: string]: any;
}

/**
 * Check if a user can perform delete operations
 * @param user - The user object
 * @returns boolean - true if user can delete, false otherwise
 */
export function canDelete(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Only super_admin and admin can delete
  // Managers cannot delete anything
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Check if a user can perform edit operations
 * @param user - The user object
 * @returns boolean - true if user can edit, false otherwise
 */
export function canEdit(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // All admin roles can edit
  return ['super_admin', 'admin', 'manager'].includes(user.role);
}

/**
 * Check if a user can perform create operations
 * @param user - The user object
 * @returns boolean - true if user can create, false otherwise
 */
export function canCreate(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // All admin roles can create
  return ['super_admin', 'admin', 'manager'].includes(user.role);
}

/**
 * Check if a user can perform approve/reject operations
 * @param user - The user object
 * @returns boolean - true if user can approve/reject, false otherwise
 */
export function canApprove(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // All admin roles can approve/reject
  return ['super_admin', 'admin', 'manager'].includes(user.role);
}

/**
 * Check if a user can perform suspend/activate operations
 * @param user - The user object
 * @returns boolean - true if user can suspend/activate, false otherwise
 */
export function canSuspend(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Only super_admin and admin can suspend/activate
  // Managers cannot suspend/activate users
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Check if a user can manage roles and permissions
 * @param user - The user object
 * @returns boolean - true if user can manage roles, false otherwise
 */
export function canManageRoles(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Only super_admin and admin can manage roles
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Get the user's role display name
 * @param user - The user object
 * @returns string - The display name for the role
 */
export function getRoleDisplayName(user: User | null | undefined): string {
  if (!user) return 'Unknown';
  
  const roleMap: { [key: string]: string } = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'manager': 'Manager',
    'tutor': 'Tutor',
    'student': 'Student'
  };
  
  return roleMap[user.role] || user.role;
}

/**
 * Check if a user has elevated privileges (super_admin or admin)
 * @param user - The user object
 * @returns boolean - true if user has elevated privileges
 */
export function hasElevatedPrivileges(user: User | null | undefined): boolean {
  if (!user) return false;
  
  return user.role === 'super_admin' || user.role === 'admin';
}

/**
 * Check if a user is a manager
 * @param user - The user object
 * @returns boolean - true if user is a manager
 */
export function isManager(user: User | null | undefined): boolean {
  if (!user) return false;
  
  return user.role === 'manager';
}
