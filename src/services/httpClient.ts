import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api';

// HTTP Client Service for Static Frontend
// This service handles all API communication with the Node.js backend

class HttpClient {
  private client: AxiosInstance;
  private retryCount: number = 0;
  private maxRetries: number = 3; // Default retry attempts

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookies/sessions
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.retryCount = 0; // Reset retry count on success
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  // Get authentication token from localStorage
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
    }
    return null;
  }

  // Store authentication token
  public setAuthToken(token: string, rememberMe: boolean = false): void {
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('authToken', token);
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('authToken', token);
      }
    }
  }

  // Remove authentication token
  public removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
    }
  }

  // Handle response errors with retry logic
  private async handleResponseError(error: AxiosError): Promise<AxiosResponse> {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      this.removeAuthToken();
      // Only redirect to login page if not on a public page
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const publicPages = ['/courses', '/tuition-jobs', '/tutor-hub', '/premium-tutors', '/all-tutors', '/new-tutors', '/verified-tutors', '/tutor-request', '/'];
        const isPublicPage = publicPages.some(page => currentPath.startsWith(page));
        
        if (!isPublicPage) {
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
      return Promise.reject(error);
    }

    // Handle network errors with retry logic
    if (this.retryCount < this.maxRetries && this.shouldRetry(error)) {
      this.retryCount++;
      
      // Wait before retrying
      await this.delay(1000 * this.retryCount); // Default retry delay
      
      // Retry the request
      return this.client.request(originalRequest);
    }

    // Log error details
    this.logError(error);
    
    return Promise.reject(error);
  }

  // Determine if request should be retried
  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  // Delay function for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Log error details
  private logError(error: AxiosError): void {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
  }

  // Generic GET request
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic POST request
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PUT request
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PATCH request
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic DELETE request
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // File upload request
  public async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.client.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle and format errors
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 400:
          return new Error('Validation error. Please check your input.');
        case 401:
          return new Error('Unauthorized. Please log in.');
        case 403:
          return new Error('Access denied.');
        case 404:
          return new Error('Resource not found.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          if (error.code === 'ECONNABORTED') {
            return new Error('Request timeout. Please try again.');
          }
          if (!error.response) {
            return new Error('Network error. Please check your connection.');
          }
          return new Error(message || 'An unexpected error occurred');
      }
    }

    return error;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get current user info from token (if JWT)
  public getCurrentUser(): any {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Logout user
  public logout(): void {
    this.removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }
}

// Create singleton instance
const httpClient = new HttpClient();

export default httpClient;
export { HttpClient };
