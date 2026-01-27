'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from './components/PageLoader';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return <PageLoader />;
}