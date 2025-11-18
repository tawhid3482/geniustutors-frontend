'use client';

import { DashboardNavbar } from '@/components/layout/DashboardNavbar';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { useAuth } from '@/contexts/AuthContext.next';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { TutorDashboard } from '@/components/tutor/TutorDashboard';
import { SuperAdminDashboard } from '@/components/super-admin/SuperAdminDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ManagerDashboard } from '@/components/manager/ManagerDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      router.push('/');
      return;
    }

    // Redirect users to their specific dashboards
    if (user && user.role) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'manager') {
        router.push('/manager/dashboard');
      } else if (user.role === 'super_admin') {
        router.push('/super-admin/dashboard');
      } else if (user.role === 'student') {
        router.push('/student');
      }
      // Tutors stay on /dashboard, no redirect needed
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  const role = user?.role;

  return (
    <div className="w-full h-screen overflow-hidden">
      {role === 'super_admin' && <SuperAdminDashboard user={user} />}
      {role === 'admin' && <AdminDashboard user={user} />}
      {role === 'manager' && <ManagerDashboard user={user} />}
      {role === 'tutor' && <TutorDashboard />}
      {/* Students are redirected to /student, so this should not render */}
      {(!role || role === 'student') && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg">Redirecting to student dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
