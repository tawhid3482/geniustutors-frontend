'use client';

import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { useAuth } from "@/contexts/AuthContext.next";
import { SuperAdminDashboard } from "@/components/super-admin/SuperAdminDashboard";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuperAdminPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      router.push('/');
      return;
    }
    
    // Redirect based on role - only redirect non-super-admin users
    if (!loading && user) {
      if (user.role !== 'SUPER_ADMIN') {
        // If not a super admin, redirect to appropriate page
        if (user.role === 'ADMIN' || user.role === 'MANGER') {
          router.push('/');
        } else {
          router.push('/');
        }
      }
      // No redirection for super_admin users - they should stay on this page
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

  // Redirect if not authenticated or not a super_admin
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col bg-background w-full overflow-x-hidden">
      <DashboardNavbar
        user={user ? {
          name: user.full_name,
          email: user.email,
          role: user.role,
          avatar: user.avatar_url
        } : undefined}
        onLogout={handleLogout}
      />
      <main className="flex-1 w-full overflow-x-hidden">
        <SuperAdminDashboard />
      </main>
    </div>
  );
}