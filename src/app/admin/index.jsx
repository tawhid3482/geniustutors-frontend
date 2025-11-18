'use client';

import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { useAuth } from "@/contexts/AuthContext.next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      router.push('/admin');
      return;
    }
    
    // Redirect based on role - only redirect non-admin users
    if (!loading && user) {
      if (user.role !== 'admin' && user.role !== 'manager') {
        // If not an admin or manager, redirect to appropriate page
        if (user.role === 'super_admin') {
          router.push('/super-admin');
        } else {
          router.push('/');
        }
      }
      // No redirection for admin/manager users - they should stay on this page
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

  // Redirect if not authenticated or not an admin/manager
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
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
        <AdminDashboard />
      </main>
    </div>
  );
}