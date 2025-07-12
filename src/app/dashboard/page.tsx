
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait until auth status is resolved

    if (!user) {
      // Should be caught by layout, but as a fallback
      router.replace('/login');
      return;
    }

    // Redirect to a default page if user lands on /dashboard
    if (user.type === 'seller') {
      router.replace('/dashboard/orders');
    } else {
      router.replace('/dashboard/orders'); 
    }
  }, [user, isLoading, router]);

  return <Loading />;
}
