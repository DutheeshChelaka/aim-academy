'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';
  const otpFromUrl = searchParams.get('otp') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (otpFromUrl) {
      setOtp(otpFromUrl);
    }
  }, [otpFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.verifyOtp({
        phoneNumber,
        code: otp,
      });
      toast.success(response.message);
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 m-4 border border-gray-100">
        <div className="flex justify-center mb-6 -mt-4">
          <div className="bg-white p-4 rounded-2xl">
            <Image
              src="/images/logo-light.png"
              alt="AIM Academy"
              width={180}
              height={72}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Number
          </h1>
          <p className="text-gray-600">
            We sent a 6-digit code to
          </p>
          <p className="text-gray-900 font-semibold mt-1">
            {phoneNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2 text-center">
              Enter OTP Code
            </label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-center text-2xl font-bold tracking-widest"
              required
              maxLength={6}
              pattern="[0-9]{6}"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          {otpFromUrl && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800 text-center">
                Development Mode: OTP auto-filled for testing
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Did not receive the code?{' '}
            <button className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition">
              Resend OTP
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          
            href="/register"
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          <a>
            Back to Register
          </a>
        </div>
      </div>
    </div>
  );
}