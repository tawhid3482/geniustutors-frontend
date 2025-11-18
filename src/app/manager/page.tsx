'use client';

import { ManagerDashboard } from '@/components/manager/ManagerDashboard';
import { useAuth } from '@/contexts/AuthContext.next';

export default function ManagerPage() {
  const { user } = useAuth();
  return <ManagerDashboard user={user} />;
}
