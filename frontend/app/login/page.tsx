'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
const response = await authService.login(formData.phoneNumber, formData.password);

// Store auth data (user first, then token)
setAuth(response.user, response.accessToken);

toast.success('Login successful!');

// Redirect based on role
if (response.user.role === 'ADMIN') {
  router.push('/admin');
} else {
  router.push('/dashboard');
}
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
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

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Login to continue your learning
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="0771234567"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400"
              required
              pattern="[0-9]{10}"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 placeholder-gray-400"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link
              href="#"
              className="text-sm text-red-600 hover:text-red-700 font-semibold hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl hover:from-red-700 hover:to-red-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-red-600 hover:text-red-700 font-bold hover:underline transition"
            >
              Register now
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Secure login with encrypted password
          </p>
        </div>
      </div>
    </div>
  );
}