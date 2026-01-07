'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { twoFactorService } from '@/lib/services/twoFactorService';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import ButtonSpinner from '../components/ButtonSpinner';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or phone
    password: '',
  });
  const [loading, setLoading] = useState(false);
  
  // 2FA States
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.identifier, formData.password);

      // Check if 2FA is required
      if (response.requiresTwoFactor && response.tempToken) {
        setTempToken(response.tempToken);
        setShow2FA(true);
        setLoading(false);
        toast.success('Please enter your 2FA code from Google Authenticator');
        return;
      }

      // Normal login (no 2FA) - ensure user and accessToken exist
      if (response.user && response.accessToken) {
        setAuth(response.user, response.accessToken);
        toast.success('Login successful!');

        // Redirect based on role
        if (response.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totpCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await twoFactorService.verify2FA(tempToken, totpCode);
      
      setAuth(response.user, response.accessToken);
      toast.success('Login successful!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
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
                {/* Lighter Gradient Overlay */}
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

                  {/* Welcome Back Text */}
                  <div className="mb-6 md:mb-8 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 leading-tight drop-shadow-lg">
                      Welcome
                    </h2>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5 leading-tight bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                      Back!
                    </h2>
                    
                    <p className="text-red-50 text-sm md:text-base leading-relaxed drop-shadow-md max-w-sm mx-auto md:mx-0">
                      {show2FA 
                        ? "Enter your 2FA code from Google Authenticator to continue."
                        : "Continue your learning journey. Login to access your courses and track your progress."}
                    </p>
                  </div>

                  {/* Login Benefits - Hidden on mobile or when showing 2FA */}
                  {!show2FA && (
                    <>
                      <div className="hidden md:flex md:flex-col space-y-4 mb-10">
                        <div className="flex items-center space-x-3 group">
                          <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 group-hover:bg-red-500/40 transition-all duration-300 shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold drop-shadow-md">Access Your Courses</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 group">
                          <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 group-hover:bg-red-500/40 transition-all duration-300 shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold drop-shadow-md">Track Your Progress</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 group">
                          <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 group-hover:bg-red-500/40 transition-all duration-300 shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold drop-shadow-md">Join Community</span>
                        </div>
                      </div>

                      {/* Compact Features for Mobile */}
                      <div className="flex md:hidden justify-center space-x-6 mb-6">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium drop-shadow-md">Courses</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium drop-shadow-md">Progress</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium drop-shadow-md">Community</span>
                        </div>
                      </div>

                      {/* Quick Stats - Hidden on mobile */}
                      <div className="hidden md:block pt-8 border-t border-white/20">
                        <p className="text-xs text-red-200 mb-3 uppercase tracking-widest font-bold drop-shadow-md">
                          Quick Login
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-black drop-shadow-lg">1000+</p>
                            <p className="text-xs text-red-100 drop-shadow-md">Active Students</p>
                          </div>
                          <div>
                            <p className="text-2xl font-black drop-shadow-lg">500+</p>
                            <p className="text-xs text-red-100 drop-shadow-md">Video Lessons</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 2FA Security Badge */}
                  {show2FA && (
                    <div className="flex items-center justify-center md:justify-start space-x-3 p-4 bg-green-500/20 backdrop-blur-md rounded-xl border border-green-400/30">
                      <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold">Secure Login</p>
                        <p className="text-xs text-green-200">2FA Protection Active</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Login/2FA Form */}
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
                      {show2FA ? 'Two-Factor Authentication' : 'Login'}
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                      {show2FA 
                        ? 'Enter the 6-digit code from your authenticator app' 
                        : 'Enter your credentials to continue'}
                    </p>
                  </div>

                  {!show2FA ? (
                    // Normal Login Form
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Email or Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="email@example.com or 0771234567"
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                            required
                            disabled={loading}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 ml-1">You can use either your email or phone number</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                            required
                            minLength={6}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                          />
                          <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition">Remember me</span>
                        </label>
                        <Link
                          href="#"
                          className="text-red-600 hover:text-red-700 font-semibold hover:underline transition"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-3.5 md:py-4 rounded-xl hover:from-red-700 hover:via-red-800 hover:to-rose-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                      >
                        {loading && <ButtonSpinner />}
                        {loading ? 'Logging in...' : 'Login Now'}
                      </button>
                    </form>
                  ) : (
                    // 2FA Code Input Form
                    <form onSubmit={handle2FASubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-3 text-center">
                          Enter 6-Digit Code
                        </label>
                        <input
                          type="text"
                          placeholder="000000"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          autoFocus
                          className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-center text-3xl tracking-widest focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 font-mono"
                          required
                          disabled={loading}
                        />
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Code changes every 30 seconds
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || totpCode.length !== 6}
                        className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-3.5 md:py-4 rounded-xl hover:from-red-700 hover:via-red-800 hover:to-rose-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                      >
                        {loading && <ButtonSpinner />}
                        {loading ? 'Verifying...' : 'Verify Code'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShow2FA(false);
                          setTotpCode('');
                          setTempToken('');
                        }}
                        className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition"
                      >
                        ← Back to Login
                      </button>
                    </form>
                  )}

                  {!show2FA && (
                    <>
                      <div className="mt-6 md:mt-8 text-center">
                        <p className="text-sm text-gray-600">
                          Don't have an account?{' '}
                          <Link href="/register" className="text-red-600 hover:text-red-700 font-bold hover:underline transition">
                            Register now
                          </Link>
                        </p>
                      </div>

                      <div className="mt-6 text-center">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span>Secure login with encrypted password</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}