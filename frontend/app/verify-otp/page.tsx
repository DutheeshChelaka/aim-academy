'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const phoneNumber = searchParams.get('phone') || '';
  const otpFromUrl = searchParams.get('otp') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (otpFromUrl) {
      setOtp(otpFromUrl);
    }
  }, [otpFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.verifyOTP(phoneNumber, otp);
      
      // Store auth data
      setAuth(response.user, response.accessToken);      
      toast.success('Phone number verified successfully!');
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);

    try {
      const response = await authService.resendOTP(phoneNumber);
      toast.success(response.message);
      
      // Auto-fill OTP in development
      if (response.otp) {
        setOtp(response.otp);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <PageLoader />
      {/* Background Image */}
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/background.jpg)',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Dots */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-red-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-75"></div>
          <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-red-400/20 rounded-full animate-pulse delay-150"></div>
          
          {/* Chevron Decorations */}
          <div className="absolute top-32 left-20 opacity-10">
            <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
              <path d="M20 0L0 20L20 40M20 20L0 40L20 60M20 40L0 60L20 80" stroke="white" strokeWidth="3"/>
            </svg>
          </div>
          <div className="absolute bottom-20 right-32 opacity-10">
            <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
              <path d="M20 0L40 20L20 40M20 20L40 40L20 60M20 40L40 60L20 80" stroke="white" strokeWidth="3"/>
            </svg>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-5xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Left Side - Image Section */}
              <div 
                className="md:col-span-2 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden bg-cover bg-center min-h-[300px] md:min-h-0"
                style={{
                  backgroundImage: 'url(/images/cardleftimage.jpg)',
                }}
              >
                {/* Lighter Gradient Overlay - YOUR ADJUSTMENT */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-red-900/30 to-black/75"></div>

                {/* Animated Dots Grid - Hidden on mobile */}
                <div className="hidden sm:grid absolute top-8 right-8 grid-cols-5 gap-2.5 opacity-30 animate-pulse">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                  ))}
                </div>

                {/* Decorative Lines - Hidden on mobile */}
                <div className="hidden md:block absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                <div className="hidden md:block absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-30"></div>

                {/* Content */}
                <div className="relative z-10 text-white">
                  {/* Logo */}
                  <div className="mb-6 md:mb-10 flex justify-center md:justify-start">
                    <Image
                      src="/images/logo-dark-removebg-preview.png"
                      alt="AIM Academy"
                      width={120}
                      height={48}
                      className="object-contain drop-shadow-2xl md:w-[160px] md:h-[64px]"
                    />
                  </div>

                  {/* Verification Icon & Text */}
                  <div className="mb-6 md:mb-8 text-center md:text-left">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600/30 backdrop-blur-md border border-red-400/30 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-lg">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 leading-tight drop-shadow-lg">
                      Almost There!
                    </h2>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5 leading-tight bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                      Verify OTP
                    </h2>
                    
                    <p className="text-red-50 text-sm md:text-base leading-relaxed drop-shadow-md max-w-sm mx-auto md:mx-0">
                      We've sent a 6-digit verification code to your phone. Enter it below to complete your registration.
                    </p>
                  </div>

                  {/* Security Features - Hidden on mobile */}
                  <div className="hidden md:flex md:flex-col space-y-4 mb-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold drop-shadow-md">Secure Verification</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold drop-shadow-md">Code expires in 10 min</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold drop-shadow-md">Privacy Protected</span>
                    </div>
                  </div>

                  {/* Compact Security for Mobile */}
                  <div className="flex md:hidden justify-center space-x-6 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium drop-shadow-md">Secure</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium drop-shadow-md">10 min</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium drop-shadow-md">Private</span>
                    </div>
                  </div>

                  {/* Divider - Hidden on mobile */}
                  <div className="hidden md:block pt-8 border-t border-white/20">
                    <p className="text-xs text-red-200 uppercase tracking-widest font-bold drop-shadow-md">
                      Secure Registration
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - OTP Form */}
              <div className="md:col-span-3 p-6 sm:p-8 md:p-12">
                {/* Mobile Logo */}
                <div className="md:hidden flex justify-center mb-6">
                  <Image
                    src="/images/logo-light.png"
                    alt="AIM Academy"
                    width={140}
                    height={56}
                    className="object-contain"
                  />
                </div>

                <div className="max-w-md mx-auto">
                  <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
                      Verify Your Number
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                      Enter the 6-digit code sent to
                    </p>
                    <p className="text-gray-900 font-bold text-base md:text-lg mt-1">
                      {phoneNumber}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 text-center">
                        Enter OTP Code
                      </label>
                      <input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-4 md:py-5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-center text-3xl md:text-4xl font-black tracking-[0.5em] md:tracking-[0.6em]"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        disabled={loading}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Check your messages for the code
                      </p>
                    </div>

                    {otpFromUrl && (
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs text-yellow-800 font-semibold">
                            Development Mode: OTP auto-filled for testing
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-3.5 md:py-4 rounded-xl hover:from-red-700 hover:via-red-800 hover:to-rose-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        'Verify & Continue'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 md:mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Need help?</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                      Didn't receive the code?{' '}
                      <button
                        onClick={handleResendOTP}
                        disabled={resending}
                        className="text-red-600 hover:text-red-700 font-bold hover:underline transition disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {resending ? 'Sending...' : 'Resend OTP'}
                      </button>
                    </p>
                    <Link
                      href="/register"
                      className="block text-sm text-gray-600 hover:text-gray-900 font-semibold transition"
                    >
                      ← Back to Register
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}