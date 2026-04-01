'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import PageLoader from '@/app/components/PageLoader';
import toast from 'react-hot-toast';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const redirect = searchParams.get('redirect');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setAuth(user, token);
        
        toast.success('Welcome back!');
        
        // Redirect to the intended page or dashboard
        if (redirect) {
          router.push(redirect);
        } else {
          router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        router.push('/login?error=auth_failed');
      }
    } else {
      toast.error('Missing credentials');
      router.push('/login?error=missing_credentials');
    }
  }, [searchParams, router, setAuth]);

  return <PageLoader />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthCallbackContent />
    </Suspense>
  );
}