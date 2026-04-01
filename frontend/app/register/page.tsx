'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import ButtonSpinner from '../components/ButtonSpinner';
import Header from '../components/Header';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ Get redirect parameter from URL
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);
  
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(phone)) return 'Phone must be 10 digits starting with 0';
    return '';
  };

  const validateName = (name: string) => {
    if (!name) return 'Name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    if (name.length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  // Real-time validation on blur
  const handleBlur = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'name':
        error = validateName(value);
        break;
      case 'password':
        error = validatePassword(value);
        // Also revalidate confirm password if it's been filled
        if (formData.confirmPassword) {
          setErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
          }));
        }
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Clear error on change
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    const nameError = validateName(formData.name);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    // Set all errors
    setErrors({
      email: emailError,
      phoneNumber: phoneError,
      name: nameError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Check if there are any errors
    if (emailError || phoneError || nameError || passwordError || confirmPasswordError) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        name: formData.name.trim(),
      });

      toast.success(response.message);
      
      // ✅ Redirect to OTP verification page with email AND redirect parameter
      const otpUrl = `/verify-otp?email=${encodeURIComponent(formData.email)}${
        redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''
      }`;
      router.push(otpUrl);
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      // Specific error handling
      if (errorMessage.toLowerCase().includes('email already registered')) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
      } else if (errorMessage.toLowerCase().includes('phone number already registered')) {
        setErrors(prev => ({ ...prev, phoneNumber: 'This phone number is already registered' }));
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Google Sign-In Handler
  const handleGoogleSignIn = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const callbackUrl = redirectUrl 
      ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
      : `${window.location.origin}/auth/callback`;
    
    window.location.href = `${backendUrl}/auth/google?callback=${encodeURIComponent(callbackUrl)}`;
  };

  return (
    <>
      <PageLoader />
      
      {/* ✅ ADDED: Wrapper div for Header + Content */}
      <div className="min-h-screen bg-gray-50">
        {/* ✅ ADDED: Header Component */}
        <Header />
        
        {/* ✅ MODIFIED: Main content with adjusted height */}
        <div 
          className="flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat min-h-[calc(100vh-80px)]"
          style={{
            backgroundImage: 'url(/images/background.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-3 h-3 bg-red-500/30 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-75"></div>
            <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-red-400/20 rounded-full animate-pulse delay-150"></div>
            
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

          <div className="relative z-10 w-full max-w-5xl">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div 
                  className="md:col-span-2 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden bg-cover bg-center min-h-[300px] md:min-h-0"
                  style={{
                    backgroundImage: 'url(/images/cardleftimage.jpg)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-red-900/30 to-black/75"></div>

                  <div className="hidden sm:grid absolute top-8 right-8 grid-cols-5 gap-2.5 opacity-30 animate-pulse">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                    ))}
                  </div>

                  <div className="hidden md:block absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                  <div className="hidden md:block absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-30"></div>

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
                        Hello,
                      </h2>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-5 leading-tight bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                        Welcome!
                      </h2>
                      
                      <p className="text-red-50 text-sm md:text-base leading-relaxed drop-shadow-md max-w-sm mx-auto md:mx-0">
                        {redirectUrl 
                          ? 'Sign up to continue with your purchase and start learning!'
                          : 'Join thousands of students achieving academic excellence with AIM Academy\'s premium online learning platform.'
                        }
                      </p>
                    </div>

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

                    <div className="hidden md:block pt-8 border-t border-white/20">
                      <p className="text-xs text-red-200 mb-4 uppercase tracking-widest font-bold drop-shadow-md">Follow Us</p>
                      <div className="flex space-x-3">
                        <a href="https://www.facebook.com/share/1CnkVyUbSV/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-red-600/30 backdrop-blur-md hover:bg-red-500/50 border border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                        <a href="https://wa.me/94721154777" target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-red-600/30 backdrop-blur-md hover:bg-red-500/50 border border-red-400/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

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
                        Create Account
                      </h1>
                      <p className="text-gray-600 text-sm md:text-base">
                        {redirectUrl 
                          ? 'Sign up to continue with your purchase'
                          : 'Fill in your details to get started'
                        }
                      </p>
                    </div>

                    {/* ✅ NEW: Google Sign-In Button */}
                    <button
                      onClick={handleGoogleSignIn}
                      type="button"
                      className="w-full mb-6 py-3.5 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md group"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* ✅ Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-semibold">Or register with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      {/* Email */}
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
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={(e) => handleBlur('email', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                            required
                            disabled={loading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-600 text-xs mt-1.5 ml-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email}
                          </p>
                        )}
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
                            onChange={(e) => handleChange('phoneNumber', e.target.value)}
                            onBlur={(e) => handleBlur('phoneNumber', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                            required
                            disabled={loading}
                          />
                        </div>
                        {errors.phoneNumber ? (
                          <p className="text-red-600 text-xs mt-1.5 ml-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.phoneNumber}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1.5 ml-1">10 digits starting with 0</p>
                        )}
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
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={(e) => handleBlur('name', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-2 ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                            required
                            disabled={loading}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-600 text-xs mt-1.5 ml-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.name}
                          </p>
                        )}
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
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min 6 characters, 1 uppercase, 1 number"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            onBlur={(e) => handleBlur('password', e.target.value)}
                            className={`w-full pl-12 pr-12 py-3 md:py-3.5 bg-gray-50 border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-xs mt-1.5 ml-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.password}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
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
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                            className={`w-full pl-12 pr-12 py-3 md:py-3.5 bg-gray-50 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-xs mt-1.5 ml-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.confirmPassword}
                          </p>
                        )}
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
                        <Link 
                          href={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                          className="text-red-600 hover:text-red-700 font-bold hover:underline transition"
                        >
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
      </div>
    </>
  );
  
}
export default function RegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RegisterPageContent />
    </Suspense>
  );
}