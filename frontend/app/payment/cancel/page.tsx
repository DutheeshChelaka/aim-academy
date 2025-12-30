'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Clear pending data
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingLessonId');
      sessionStorage.removeItem('pendingLessonTitle');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
        {/* Warning Icon */}
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-3">
          Payment Cancelled
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your payment was not completed
        </p>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-bold text-orange-900 mb-2">What happened?</h3>
          <p className="text-orange-800 text-sm">
            You cancelled the payment process. Don't worry, no charges were made to your account. You can try again whenever you're ready!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-red-700 hover:to-pink-700 transition-all"
          >
            Browse Lessons
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}