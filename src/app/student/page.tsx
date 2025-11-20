'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext.next';
import { RefreshCw } from 'lucide-react';
// import { StudentDashboardMain } from '@/components/student/dashboard/StudentDashboardMain';

export default function StudentDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logic for unauthenticated or non-student users
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to home page
        router.push('/');
        return;
      }

      // Check if user has student role
      if (user.role && user.role !== 'student') {
        // Redirect users to their specific dashboards
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'manager') {
          router.push('/manager/dashboard');
        } else if (user.role === 'super_admin') {
          router.push('/super-admin/dashboard');
        } else if (user.role === 'tutor') {
          router.push('/dashboard');
        } else {
          // For other roles, redirect to home
          router.push('/');
        }
        return;
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Verifying student access...</p>
        </div>
      </div>
    );
  }

  // User not authenticated or doesn't have access - show loading while redirecting
  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Redirecting...</p>
        </div>
      </div>
    );
  }

  // return <StudentDashboardMain />;
}
