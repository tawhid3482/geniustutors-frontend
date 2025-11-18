
import { jwtDecode } from "jwt-decode";

export const decodedToken = (token: string) => {
  return jwtDecode(token);
};


// utils/token.ts
export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    // JWT token decode করা (client-side)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getTokenFromLocalStorage = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getDecodedToken = (): DecodedToken | null => {
  const token = getTokenFromLocalStorage();
  if (!token) return null;
  return decodeToken(token);
};