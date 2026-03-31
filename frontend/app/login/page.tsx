'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { twoFactorService } from '@/lib/services/twoFactorService';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import ButtonSpinner from '../components/ButtonSpinner';

/**
 * Sub-component for cleaner Form Inputs
 */
const FormInput = ({ label, icon, ...props }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-gray-800">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all outline-none text-gray-900 placeholder-gray-400 text-sm md:text-base disabled:opacity-60"
      />
    </div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  // State Grouping
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA States
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const onLoginSuccess = useCallback((user: any, token: string) => {
    setAuth(user, token);
    toast.success('Welcome back!');
    router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
  }, [router, setAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clear session only on explicit intent to login
      localStorage.removeItem('auth-storage'); 

      const response = await authService.login(formData.identifier, formData.password);

      if (response.requiresTwoFactor && response.tempToken) {
        setTempToken(response.tempToken);
        setShow2FA(true);
        toast('Verification required', { icon: '🛡️' });
        return;
      }

      if (response.user && response.accessToken) {
        onLoginSuccess(response.user, response.accessToken);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
      toast.error(msg);
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) return toast.error('Enter 6-digit code');

    setLoading(true);
    try {
      const response = await twoFactorService.verify2FA(tempToken, totpCode);
      onLoginSuccess(response.user, response.accessToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid 2FA code');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageLoader />
      <main className="min-h-screen flex items-center justify-center p-4 relative bg-slate-900">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[20%]"
          style={{ backgroundImage: 'url(/images/background.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-red-900/20 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-5xl animate-in fade-in zoom-in duration-500">
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
            <div className="grid md:grid-cols-5">
              
              {/* Left Side: Branding */}
              <div className="md:col-span-2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-red-950 text-white overflow-hidden">
                <div 
                   className="absolute inset-0 opacity-40 bg-cover bg-center"
                   style={{ backgroundImage: 'url(/images/cardleftimage.jpg)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 to-black/80" />
                
                {/* Visual Decoration: Dot Grid */}
                <div className="absolute top-10 right-10 grid grid-cols-4 gap-2 opacity-20">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
                  ))}
                </div>

                <div className="relative z-10">
                  <Image
                    src="/images/logo-dark-removebg-preview.png"
                    alt="Logo"
                    width={160}
                    height={60}
                    className="mb-10 object-contain drop-shadow-xl"
                    priority
                  />
                  <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-4">
                    Welcome <br />
                    <span className="text-red-500">Back!</span>
                  </h2>
                  <p className="text-gray-300 text-sm md:text-base mb-8 max-w-xs">
                    {show2FA ? "One more step to secure your account." : "Access your dashboard and continue your progress."}
                  </p>
                  
                  {/* Features List (Hidden on Mobile) */}
                  {!show2FA && (
                    <div className="hidden md:space-y-4 mb-10">
                      {['Access Courses', 'Track Progress', 'Join Community'].map((text, i) => (
                        <div key={i} className="flex items-center space-x-3 text-sm font-semibold group cursor-default">
                          <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="md:col-span-3 p-8 md:p-12 lg:p-16 bg-white">
                <div className="max-w-sm mx-auto">
                  <header className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">
                      {show2FA ? 'Verify Identity' : 'Login'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                      {show2FA ? 'Enter your authenticator code' : 'Please enter your account details'}
                    </p>
                  </header>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-3 text-red-800 text-sm animate-shake">
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                      {error}
                    </div>
                  )}

                  {!show2FA ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <FormInput
                        label="Email or Phone"
                        name="identifier"
                        type="text"
                        placeholder="email@example.com"
                        value={formData.identifier}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      />

                      <FormInput
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                      />

                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 transition">
                          <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <span>Remember me</span>
                        </label>
<Link href="/forgot-password" className="text-red-600 font-bold hover:underline">
  Forgot password?
</Link>                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                      >
                        {loading ? <><ButtonSpinner /> Logging in...</> : 'Login Now'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handle2FASubmit} className="space-y-6">
                      <div className="text-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="000000"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-center text-4xl tracking-[1rem] font-mono focus:ring-2 focus:ring-red-500 outline-none"
                          autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-4 uppercase tracking-widest">Expires in 30s</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || totpCode.length !== 6}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                      >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setShow2FA(false)}
                        className="w-full text-gray-500 text-sm font-semibold hover:text-gray-800 transition"
                      >
                        ← Use different account
                      </button>
                    </form>
                  )}

                  {!show2FA && (
                    <p className="mt-8 text-center text-gray-600 text-sm">
                      New here? <Link href="/register" className="text-red-600 font-bold hover:underline">Create an account</Link>
                    </p>
                  )}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </>
  );
}