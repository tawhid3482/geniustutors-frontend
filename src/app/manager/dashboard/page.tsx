'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext.next'
import { useRouter } from 'next/navigation'
import { ManagerDashboard } from '@/components/manager/ManagerDashboard'
import { Loader2 } from 'lucide-react'

export default function ManagerDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin');
        return;
      }

      const hasAccess = user.role === 'MANAGER';

      if (!hasAccess) {
        // User doesn't have required role, redirect based on role
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
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
      <div className="min-h-screen w-full bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Verifying manager access...</p>
        </div>
      </div>
    );
  }

  // console.log(user)

  // User not authenticated or doesn't have access
  if (!user || user.role !== 'MANAGER') {
    return null; // Return null as we're redirecting in useEffect
  }

  return <ManagerDashboard user={user} />;
}
