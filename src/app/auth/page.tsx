'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) {
      router.replace(`/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
    } else {
      router.replace('/');
    }
  }, [router, searchParams]);
  return null;
} 
 