'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { useRouter } from 'next/navigation';
import { TutorDashboard } from '@/components/tutor/TutorDashboard';

export default function TutorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }
    
    if (!authLoading && user && user.role !== 'tutor') {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'tutor') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <TutorDashboard />
    </div>
  );
}
