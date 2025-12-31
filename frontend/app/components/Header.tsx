'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeaderProps {
  currentPage?: 'home' | 'my-courses' | 'profile';
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (page: string) => currentPage === page;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/images/logo-light.png"
              alt="AIM Academy"
              width={130}
              height={52}
              className="object-contain sm:w-[150px]"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/dashboard" 
              className={`px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition ${
                isActive('home')
                  ? 'text-white bg-gradient-to-r from-red-600 to-red-700'
                  : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/my-courses" 
              className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
                isActive('my-courses')
                  ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-sm'
                  : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              My Courses
            </Link>
            <Link 
              href="/profile" 
              className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
                isActive('profile')
                  ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-sm'
                  : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              Profile
            </Link>
            <Link href="/grade" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              Browse Grades
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User Info - Desktop */}
            <Link href="/profile" className="hidden sm:flex items-center space-x-3 hover:opacity-80 transition">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
                <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
              </div>
              <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
            </Link>

            {/* Mobile User Avatar */}
            <Link href="/profile" className="sm:hidden w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </Link>

            {/* Logout - Desktop */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pb-4 border-t border-gray-200 mt-2 pt-4"
          >
            <div className="flex flex-col space-y-2">
              <Link 
                href="/dashboard" 
                className={`px-4 py-3 text-sm font-bold rounded-lg ${
                  isActive('home')
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/my-courses" 
                className={`px-4 py-3 text-sm font-bold rounded-lg ${
                  isActive('my-courses')
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Courses
              </Link>
              <Link 
                href="/profile" 
                className={`px-4 py-3 text-sm font-bold rounded-lg ${
                  isActive('profile')
                    ? 'text-white bg-gradient-to-r from-red-600 to-red-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link href="/grade" className="px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Browse Grades
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-left flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}