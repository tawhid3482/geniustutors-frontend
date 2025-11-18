'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext.next'
import { useRouter } from 'next/navigation'
import { SuperAdminDashboard } from '@/components/super-admin/SuperAdminDashboard'
import { Loader2, Shield } from 'lucide-react'

export default function SuperAdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to admin login
        router.push('/admin');
        return;
      }

      // Check if user has required role
      const hasAccess = user.role === 'super_admin';

      if (!hasAccess) {
        // User doesn't have required role, redirect based on role
        if (user.role === 'admin' || user.role === 'manager') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
          <p className="text-gray-800 text-lg">Verifying super admin access...</p>
        </div>
      </div>
    );
  }

  // User not authenticated or doesn't have access
  if (!user || user.role !== 'super_admin') {
    return null; // Return null as we're redirecting in useEffect
  }

  return <SuperAdminDashboard user={user} />;
}
