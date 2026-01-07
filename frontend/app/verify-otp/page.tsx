'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import ButtonSpinner from '../components/ButtonSpinner';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast.error('Email parameter missing');
      router.push('/register');
    }

    // Auto-fill OTP if provided (development mode)
    if (otpParam) {
      setOtp(otpParam);
    }
  }, [searchParams, router]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    if (!email) {
      toast.error('Email missing. Please register again.');
      router.push('/register');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOTP(email, otp);
      toast.success('Email verified successfully! 🎉');
      
      // Redirect to login after short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email missing');
      return;
    }

    setLoading(true);
    try {
      await authService.resendOTP(email);
      toast.success('OTP resent to your email!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageLoader />
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/background.jpg)' }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-3 h-3 bg-red-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-75"></div>
          <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-red-400/20 rounded-full animate-pulse delay-150"></div>
        </div>

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-5xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-5">
              {/* Left Side - Image Section */}
              <div 
                className="md:col-span-2 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden bg-cover bg-center min-h-[300px] md:min-h-0"
                style={{ backgroundImage: 'url(/images/cardleftimage.jpg)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-red-900/30 to-black/75"></div>

                <div className="relative z-10 text-white">
                  <div className="mb-6 md:mb-10 flex justify-center md:justify-start">
                    <Image
                      src="/images/logo-dark-removebg-preview.png"
                      alt="AIM Academy"
                      width={120}
                      height={48}
                      className="object-contain drop-shadow-2xl md:w-[160px] md:h-[64px]"
                    />
                  </div>

                  <div className="mb-6 md:mb-8 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 leading-tight drop-shadow-lg">
                      Verify
                    </h2>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5 leading-tight bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                      Your Email
                    </h2>
                    
                    <p className="text-red-50 text-sm md:text-base leading-relaxed drop-shadow-md max-w-sm mx-auto md:mx-0">
                      We've sent a 6-digit verification code to <span className="font-bold">{email}</span>. Please check your inbox.
                    </p>
                  </div>

                  {/* Security Icon */}
                  <div className="hidden md:flex items-center justify-center md:justify-start space-x-3 p-4 bg-green-500/20 backdrop-blur-md rounded-xl border border-green-400/30">
                    <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold">Secure Verification</p>
                      <p className="text-xs text-green-200">Code expires in 10 minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - OTP Form */}
              <div className="md:col-span-3 p-6 sm:p-8 md:p-12">
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
                      Enter Verification Code
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                      Check your email for the 6-digit code
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    {/* Email Display */}
                    <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Verifying email:</p>
                      <p className="text-sm font-bold text-gray-900 break-all">{email || 'Loading...'}</p>
                    </div>

                    {/* OTP Input */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-3 text-center">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        autoFocus
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-center text-3xl tracking-widest focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 font-mono"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Code expires in 10 minutes
                      </p>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-3.5 md:py-4 rounded-xl hover:from-red-700 hover:via-red-800 hover:to-rose-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                    >
                      {loading && <ButtonSpinner />}
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    {/* Resend Button */}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="w-full py-3 text-red-600 hover:text-red-700 font-medium transition disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Didn't receive the code? Resend
                    </button>
                  </form>

                  <div className="mt-6 md:mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      Wrong email?{' '}
                      <Link href="/register" className="text-red-600 hover:text-red-700 font-bold hover:underline transition">
                        Register again
                      </Link>
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-900 mb-2">💡 Tips:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Check your spam/junk folder</li>
                      <li>• Code is valid for 10 minutes</li>
                      <li>• Make sure to enter all 6 digits</li>
                    </ul>
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

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyOTPContent />
    </Suspense>
  );
}
/*
```

---

## 📂 **File Structure**
```
frontend/
  app/
    verify-otp/
      page.tsx  ← CREATE THIS FILE
```

---

## ✅ **After Creating the File:**

1. **Save the file**
2. **Frontend will auto-reload**
3. **Try registering again:**
```
/*Email: test@example.com
Phone: 0775555555
Name: Test User
Password: password123
Confirm: password123*/