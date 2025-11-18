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
      router.push('/admin');
      return;
    }
    
    // Redirect based on role - only redirect non-super-admin users
    if (!loading && user) {
      if (user.role !== 'super_admin') {
        // If not a super admin, redirect to appropriate page
        if (user.role === 'admin' || user.role === 'manager') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        // Redirect super_admin users to the dashboard section
        router.push('/super-admin/dashboard');
      }
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
  if (!user || user.role !== 'super_admin') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <SuperAdminDashboard user={user} />
    </div>
  );
}
