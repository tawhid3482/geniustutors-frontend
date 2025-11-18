'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext.next';

export default function TutorCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect to main dashboard if user is authenticated
  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Show loading while redirecting
  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}
