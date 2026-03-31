'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/lib/services/authService';
import toast from 'react-hot-toast';
import ButtonSpinner from '../components/ButtonSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Handle resend cooldown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (countdown > 0) return;

    setLoading(true);
    setError('');
    
    try {
      await authService.requestPasswordReset(email);
      setSubmitted(true);
      setCountdown(60); // 1-minute cooldown
      toast.success('Reset link dispatched!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Check your connection and try again';
      
      // Check for "email not registered" or similar errors
      if (
        errorMessage.toLowerCase().includes('not found') || 
        errorMessage.toLowerCase().includes('not registered') ||
        errorMessage.toLowerCase().includes('no user') ||
        errorMessage.toLowerCase().includes('does not exist')
      ) {
        setError('This email is not registered. Please check your email or sign up.');
        toast.error('Email not registered');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-red-500/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-75"></div>
        <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-red-400/20 rounded-full animate-pulse delay-150"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-10">
          
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo-light.png" 
              alt="AIM Academy"
              width={140}
              height={56}
              className="object-contain hover:scale-105 transition-transform"
              priority
            />
          </div>

          {!submitted ? (
            <div className="space-y-6">
              <header className="text-center">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-sm">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Forgot Password?</h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base px-2">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </header>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 text-red-800 text-sm animate-shake">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold">{error}</p>
                    {error.toLowerCase().includes('not registered') && (
                      <Link href="/register" className="text-red-600 hover:text-red-700 font-bold underline mt-1 inline-block">
                        Create an account →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all outline-none text-gray-900 placeholder-gray-400`}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white py-3.5 md:py-4 rounded-xl hover:from-red-700 hover:via-red-800 hover:to-rose-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base md:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                >
                  {loading && <ButtonSpinner />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in-95 duration-300" aria-live="polite">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-3">Check Your Inbox</h2>
              <p className="text-gray-500 mb-8 px-2">
                We sent a secure link to <span className="text-gray-900 font-bold">{email}</span>. Please click it within 60 minutes.
              </p>

              <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Guide</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    Check your spam or "Promotions" folder.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    The link is for one-time use only.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || countdown > 0}
                  className="w-full text-red-600 font-bold hover:text-red-700 disabled:text-gray-400 transition-colors text-sm"
                >
                  {countdown > 0 ? `Resend available in ${countdown}s` : "Didn't get the email? Resend"}
                </button>
                
                <button
                  onClick={() => { setSubmitted(false); setCountdown(0); setError(''); }}
                  className="block w-full text-gray-400 font-medium text-xs hover:text-gray-600 transition"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          )}

          <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="text-gray-500 hover:text-gray-900 font-bold text-sm inline-flex items-center gap-2 group transition"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Return to Login
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}