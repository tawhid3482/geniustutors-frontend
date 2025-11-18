// Authentication utility functions

// Get user permissions from localStorage
export const getUserPermissions = (): { [key: string]: boolean } => {
  try {
    const permissionsStr = localStorage.getItem('userPermissions');
    if (permissionsStr) {
      return JSON.parse(permissionsStr);
    }
    return {};
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return {};
  }
};

// Check if user has specific permission
export const hasPermission = (permission: string): boolean => {
  try {
    const permissions = getUserPermissions();
    return permissions[permission] === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (permissions: string[]): boolean => {
  try {
    const userPermissions = getUserPermissions();
    return permissions.some(permission => userPermissions[permission] === true);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (permissions: string[]): boolean => {
  try {
    const userPermissions = getUserPermissions();
    return permissions.every(permission => userPermissions[permission] === true);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Check if user has role
export const hasRole = (role: string): boolean => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role === role;
    }
    return false;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles: string[]): boolean => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return roles.includes(user.role);
    }
    return false;
  } catch (error) {
    console.error('Error checking roles:', error);
    return false;
  }
};

// Get current user role
export const getCurrentUserRole = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Store user permissions in localStorage
export const storeUserPermissions = (permissions: { [key: string]: boolean }): void => {
  try {
    localStorage.setItem('userPermissions', JSON.stringify(permissions));
  } catch (error) {
    console.error('Error storing user permissions:', error);
  }
};

// Clear user permissions from localStorage
export const clearUserPermissions = (): void => {
  try {
    localStorage.removeItem('userPermissions');
  } catch (error) {
    console.error('Error clearing user permissions:', error);
  }
};

// Get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  }
  return null;
};

// Set auth token
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove auth token
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
  }
};

// Get auth headers for API requests
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Handle auth errors
export const handleAuthError = (error: any): void => {
  if (error.message?.includes('Authentication failed') || error.message?.includes('No authentication token')) {
    // Clear auth data and redirect to login only if not on a public page
    removeAuthToken();
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const publicPages = ['/courses', '/tuition-jobs', '/tutor-hub', '/premium-tutors', '/all-tutors', '/new-tutors', '/verified-tutors', '/tutor-request', '/'];
      const isPublicPage = publicPages.some(page => currentPath.startsWith(page));
      
      if (!isPublicPage) {
        window.location.href = '/auth/login';
      }
    }
  }
}; 