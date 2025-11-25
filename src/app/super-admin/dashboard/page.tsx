'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext.next'
import { useRouter } from 'next/navigation'
import { SuperAdminDashboard } from '@/components/super-admin/SuperAdminDashboard'
import { Loader2 } from 'lucide-react'

export default function SuperAdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin');
        return;
      }

      const hasAccess = user.role === 'SUPER_ADMIN';

      if (!hasAccess) {
        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, loading, router]);

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

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null; 
  }

  return <SuperAdminDashboard user={user} />;
}
