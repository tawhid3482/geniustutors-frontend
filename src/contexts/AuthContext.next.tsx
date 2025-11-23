'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/utils/auth';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  signIn: (phone: string, password: string) => Promise<void>;
  adminSignIn: (phone: string, password: string) => Promise<void>;
  signUp: (phone: string, password: string, userData: any) => Promise<{ token?: string; user?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (phone: string) => Promise<any>;
  adminResetPassword: (phone: string) => Promise<any>;
  verifyResetCode: (phone: string, token: string, password: string) => Promise<any>;
  adminVerifyResetCode: (phone: string, token: string, password: string) => Promise<any>;
  redirectToDashboard: (user: any, isNewRegistration?: boolean) => void;
  updateUserProfile?: (updatedUser: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Import API configuration
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// Use the base URL from the API configuration
const API_URL = API_BASE_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check for token and set user if present
    const token = getAuthToken();
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setProfile(parsedUser); // Set profile to user data initially
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        removeAuthToken();
      }
    }
    setLoading(false);
  }, []);

  const redirectToDashboard = (user: any, isNewRegistration: boolean = false) => {
    if (user && user.role) {
      // For new registrations, redirect to thank you page first
      if (isNewRegistration) {
        const userName = user.name || user.full_name || '';
        window.location.href = `/thank-you?role=${user.role}&name=${encodeURIComponent(userName)}`;
        return;
      }
      
      // For existing users logging in, go directly to dashboard
      switch (user.role) {
        case 'admin':
          window.location.href = '/admin/dashboard';
          break;
        case 'manager':
          window.location.href = '/manager/dashboard';
          break;
        case 'super_admin':
          window.location.href = '/super-admin/dashboard';
          break;
        case 'student':
          window.location.href = '/student';
          break;
        case 'tutor':
          window.location.href = '/tutor';
          break;
        default:
          // For other roles, redirect to a general dashboard or home
          window.location.href = '/';
      }
    }
  };

  const signIn = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setAuthToken(data.data[1]);
      localStorage.setItem('user', JSON.stringify(data.data[0]));
      setUser(data.data[0]);
      setProfile(data.data[0]); // Set profile to user data
      
      // Redirect to appropriate dashboard based on role
      redirectToDashboard(data.data[0]);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminSignIn = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.ADMIN_LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Admin Login failed');
      setAuthToken(data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      setProfile(data.data.user); // Set profile to user data
      
      // Use the redirectToDashboard function for consistent redirection
      redirectToDashboard(data.data.user);
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (phone: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, ...userData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Email verification removed - proceed with normal registration
      
      // If no email verification required, proceed with normal flow
      if (data.data.token) {
        setAuthToken(data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setProfile(data.data.user); // Set profile to user data
        
        // Redirect to appropriate dashboard based on role
        redirectToDashboard(data.data.user);
      }
      
      return {
        token: data.data.token,
        user: data.data.user
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    removeAuthToken();
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const adminResetPassword = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.ADMIN_FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (phone: string, token: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const adminVerifyResetCode = async (phone: string, token: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}${API_ENDPOINTS.AUTH.ADMIN_RESET_PASSWORD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedUser: any) => {
    setUser(updatedUser);
    setProfile(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signIn,
        adminSignIn,
        signUp,
        signOut,
        resetPassword,
        adminResetPassword,
        verifyResetCode,
        adminVerifyResetCode,
        redirectToDashboard,
        updateUserProfile,
        setUser,
        setProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};