'use client';

import { useState, useEffect } from 'react';
import { api } from '@/config/api';
import { storeUserPermissions, clearUserPermissions } from '@/utils/auth';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

interface UserPermissions {
  [key: string]: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's permissions
      const response = await api.get('/role-management/my-permissions');
      
      if (response.permissions) {
        setPermissions(response.permissions);
        storeUserPermissions(response.permissions);
      } else {
        setPermissions({});
        clearUserPermissions();
      }
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      setError(error.message || 'Failed to fetch permissions');
      setPermissions({});
      clearUserPermissions();
    } finally {
      setLoading(false);
    }
  };

  const refreshPermissions = () => {
    fetchPermissions();
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    refreshPermissions
  };
};
