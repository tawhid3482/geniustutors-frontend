// API Configuration
const getApiBaseUrl = () => {
  // Always use environment variable if set
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // Check if we're in static export mode
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    // For static export, always use the configured backend URL
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  }
  
  // Check if we're in production and on a VPS/server
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Use the same domain but with backend port 5000
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5000/api`;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth headers
const getAuthHeaders = (includeContentType: boolean = true) => {
  let token = null;
  if (typeof window !== 'undefined') {
    // Try both authentication systems
    token = localStorage.getItem('token') || localStorage.getItem('authToken');
  }
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Enhanced error handling for production
const handleApiError = (response: Response, errorData: any) => {
  const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
  const error = new Error(errorMessage);
  (error as any).response = { status: response.status, data: errorData };
  (error as any).isNetworkError = false;
  return error;
};

// Network error handler
const handleNetworkError = (error: any) => {
  const networkError = new Error('Network error - please check your connection');
  (networkError as any).isNetworkError = true;
  (networkError as any).originalError = error;
  return networkError;
};

// Create API client for HTTP requests
const api = {
  get: async (endpoint: string, config?: any) => {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
     
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          ...config?.headers,
        },
        ...config,
      });
      
 
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
     
        throw handleApiError(response, errorData);
      }
      
      const responseData = await response.json();
    
      return responseData;
    } catch (error: any) {

      if (error.isNetworkError) {
        throw error;
      }
      throw handleNetworkError(error);
    }
  },
  
  post: async (endpoint: string, data?: any, config?: any) => {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
 
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      });
      

      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw handleApiError(response, errorData);
      }
      
      const responseData = await response.json();

      return responseData;
    } catch (error: any) {

      if (error.isNetworkError) {
        throw error;
      }
      throw handleNetworkError(error);
    }
  },
  
  put: async (endpoint: string, data?: any, config?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw handleApiError(response, errorData);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.isNetworkError) {
        throw error;
      }
      throw handleNetworkError(error);
    }
  },
  
  delete: async (endpoint: string, config?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          ...config?.headers,
        },
        ...config,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw handleApiError(response, errorData);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.isNetworkError) {
        throw error;
      }
      throw handleNetworkError(error);
    }
  },
  
  patch: async (endpoint: string, data?: any, config?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        ...config,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw handleApiError(response, errorData);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.isNetworkError) {
        throw error;
      }
      throw handleNetworkError(error);
    }
  },
  
  // File upload method
  upload: async (endpoint: string, formData: FormData, config?: any) => {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint}`;
    
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(false), // Don't include Content-Type for file uploads
          ...config?.headers,
        },
        body: formData,
        ...config,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw handleApiError(response, errorData);
      }
      
      return response.json();
    } catch (error: any) {
      if (error.isNetworkError) {
        throw error;
      }
      throw handleNetworkError(error);
    }
  },
};

export { api };

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ADMIN_RESET_PASSWORD: '/auth/admin/reset-password',
    ADMIN_LOGIN: '/auth/admin/login',
    ADMIN_FORGOT_PASSWORD: '/auth/admin/forgot-password',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  TUTOR_REQUESTS: {
    CREATE: '/tutor-requests',
    GET_STUDENT_REQUESTS: '/tutor-requests/student',
    GET_ALL: '/tutor-requests',
    // GET_BY_ID: (id: string) => `/tutor-requests/${id}`,
    UPDATE_STATUS: (id: string) => `/tutor-requests/${id}/status`,
    DELETE: (id: string) => `/tutor-requests/${id}`,
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
  },
  TAXONOMY: {
    GET: '/website/taxonomy',
    UPDATE: '/website/taxonomy',
  },
};