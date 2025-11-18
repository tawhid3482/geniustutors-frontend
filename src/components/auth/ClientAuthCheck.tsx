'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClientAuthCheckProps {
  children: React.ReactNode;
}

export default function ClientAuthCheck({ children }: ClientAuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // TODO: Implement MySQL-based authentication check
      setIsAuthenticated(false); // Default to not authenticated
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}