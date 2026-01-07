'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import ButtonSpinner from '../components/ButtonSpinner';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        name: formData.name,
      });

      toast.success(response.message);
      
      // Redirect to OTP verification page with email
      router.push(`/verify-otp?email=${formData.email}${response.otp ? `&otp=${response.otp}` : ''}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
                {/* Enhanced Gradient Overlay */}
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
                  {/* Logo - Smaller on mobile */}
                  <div className="mb-6 md:mb-10 flex justify-center md:justify-start">
                    <Image
                      src="/images/logo-dark-removebg-preview.png"
                      alt="AIM Academy"
                      width={120}
                      height={48}
                      className="object-contain drop-shadow-2xl md:w-[160px] md:h-[64px]"
                    />
                  </div>

                  {/* Welcome Text - Compact on mobile */}
                  <div className="mb-6 md:mb-8 text-center md:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 leading-tight drop-shadow-lg">
                      Hello,
                    </h2>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5 leading-tight bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                      Welcome!
                    </h2>
                    
                    <p className="text-red-50 text-sm md:text-base leading-relaxed drop-shadow-md max-w-sm mx-auto md:mx-0">
                      Join thousands of students achieving academic excellence with AIM Academy's premium online learning platform.
                    </p>
                  </div>

                  {/* Feature List - Hidden on mobile, shown on md+ */}
                  <div className="hidden md:flex md:flex-col space-y-4 mb-10">
                    <div className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 group-hover:bg-red-500/40 transition-all duration-300 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold drop-shadow-md">Expert Teachers</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 group-hover:bg-red-500/40 transition-all duration-300 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold drop-shadow-md">HD Video Lessons</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 group">
                      <div className="w-10 h-10 bg-red-600/30 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-red-400/30 group-hover:bg-red-500/40 transition-all duration-300 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold drop-shadow-md">Affordable Pricing</span>
                    </div>
                  </div>

                  {/* Compact Features for Mobile - Shown only on small screens */}
                  <div className="flex md:hidden justify-center space-x-6 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium drop-shadow-md">Experts</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium drop-shadow-md">HD Videos</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600/30 backdrop-blur-md rounded-lg flex items-center justify-center mb-1 border border-red-400/30 shadow-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium drop-shadow-md">Affordable</span>
                    </div>
                  </div>

                  {/* Social Links - Hidden on mobile, shown on md+ */}
                  <div className="hidden md:block pt-8 border-t border-white/20">
                    <p className="text-xs text-red-200 mb-4 uppercase tracking-widest font-bold drop-shadow-md">Follow Us</p>
                    <div className="flex space-x-3">
                      <a href="#" className="w-11 h-11 bg-red-600/30 backdrop-blur-md hover:bg-red-500/50 border border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-11 h-11 bg-red-600/30 backdrop-blur-md hover:bg-red-500/50 border border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-11 h-11 bg-red-600/30 backdrop-blur-md hover:bg-red-500/50 border border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
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
                      Create Account
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">Fill in your details to get started</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {/* Email Field - NEW */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          placeholder="0771234567"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                          required
                          pattern="[0-9]{10}"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">10-digit mobile number</p>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password */}
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
                          placeholder="At least 6 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                          required
                          minLength={6}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Confirm Password - NEW */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base"
                          required
                          minLength={6}
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
                      {loading ? 'Creating Account...' : 'Register Now'}
                    </button>
                  </form>

                  <div className="mt-6 md:mt-8 text-center">
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/login" className="text-red-600 hover:text-red-700 font-bold hover:underline transition">
                        Login here
                      </Link>
                    </p>
                  </div>

                  <div className="mt-4 md:mt-6 text-center">
                    <p className="text-xs text-gray-500">
                      By registering, you agree to our{' '}
                      <a href="#" className="text-red-600 hover:underline">Terms</a>
                      {' '}and{' '}
                      <a href="#" className="text-red-600 hover:underline">Privacy Policy</a>
                    </p>
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