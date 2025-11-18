// API Configuration
const getApiBaseUrl = () => {
  // Always use environment variable if set
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
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

// Production environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// API timeout configuration
export const API_TIMEOUT = IS_PRODUCTION ? 30000 : 10000; // 30s in production, 10s in development

// Retry configuration for production
export const API_RETRY_ATTEMPTS = IS_PRODUCTION ? 3 : 1;
export const API_RETRY_DELAY = 1000; // 1 second