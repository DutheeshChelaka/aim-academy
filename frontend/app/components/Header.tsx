'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  currentPage?: 'home' | 'my-courses' | 'profile' | 'grade';
}

export default function Header({ currentPage }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    // Use passive listener to optimize scroll performance on main thread
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Home link destination
  const homeLink = '/dashboard';

  // Navigation Links array
  const navLinks = [
    { name: 'Home', href: '/dashboard', key: 'home' },
    { name: 'Browse Grades', href: '/grade', key: 'grade' },
    ...(isAuthenticated
      ? [{ name: 'My Courses', href: '/my-courses', key: 'my-courses' }]
      : [])
  ];

  // SSR/Hydration Loader navigation markup to match the height and design exactly (prevents CLS layout shift)
  if (!hasHydrated) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/images/logo-light.png"
              alt="AIM Academy"
              width={130}
              height={52}
              className="object-contain"
              priority
            />
          </div>
          {/* Skeleton placeholders to match width and prevent Layout Shift */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="w-16 h-5 bg-zinc-100 rounded animate-pulse"></div>
            <div className="w-24 h-5 bg-zinc-100 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-zinc-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg border-b border-zinc-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.02)]' 
          : 'bg-white/95 backdrop-blur-md border-b border-zinc-100 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link href={homeLink} className="flex items-center group transition-transform duration-200">
            <Image
              src="/images/logo-light.png"
              alt="AIM Academy"
              width={130}
              height={52}
              className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
                  currentPage === link.key
                    ? 'bg-red-50 text-red-600 shadow-sm border border-red-100/50'
                    : 'text-zinc-600 hover:text-red-600 hover:bg-zinc-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              /* Profile Menu Dropdown */
              <div className="relative ml-4 group">
                <button className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-zinc-200/60 hover:bg-zinc-50 transition-all cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-tr from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white text-sm font-extrabold shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-zinc-700 max-w-[100px] truncate">{user?.name || 'User'}</span>
                  <svg
                    width="16"
                    height="16"
                    className="w-4 h-4 text-zinc-400 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Box */}
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-zinc-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 origin-top-right overflow-hidden z-50">
                  <div className="px-5 py-4 bg-gradient-to-br from-zinc-50 to-rose-50/20 border-b border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Logged In As</p>
                    <p className="text-sm font-black text-zinc-900 truncate mt-1">{user?.name || 'User'}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email || ''}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/profile"
                      className={`flex items-center px-4 py-3 text-sm rounded-xl transition-all ${
                        currentPage === 'profile'
                          ? 'bg-red-50 text-red-600 font-bold'
                          : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                    >
                      <svg width="20" height="20" className="w-5 h-5 mr-3 text-zinc-400 group-hover:text-red-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50/60 rounded-xl transition-all font-bold cursor-pointer"
                    >
                      <svg width="20" height="20" className="w-5 h-5 mr-3 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Guest Auth Buttons */
              <div className="flex items-center ml-4 space-x-2">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-500 hover:to-rose-500 transition-all shadow-[0_4px_12px_rgba(220,38,38,0.15)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.25)] transform hover:-translate-y-0.5"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border border-zinc-200/60 hover:bg-zinc-50 transition-colors text-zinc-700"
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-100 py-4 space-y-2 animate-in slide-in-from-top duration-300 ease-out">
            {isAuthenticated && (
              <div className="px-4 py-3.5 bg-gradient-to-br from-zinc-50 to-rose-50/20 border border-zinc-100 rounded-xl mx-2 mb-3">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Logged In As</p>
                <p className="text-sm font-black text-zinc-900 mt-0.5">{user?.name || 'User'}</p>
                <p className="text-xs text-zinc-500">{user?.email || ''}</p>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl mx-2 font-bold text-sm transition-all ${
                  currentPage === link.key
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-red-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl mx-2 text-sm font-bold transition-all ${
                    currentPage === 'profile'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-red-600'
                  }`}
                >
                  <svg width="20" height="20" className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-[calc(100%-16px)] flex items-center px-4 py-3 rounded-xl mx-2 text-red-600 hover:bg-red-50 text-sm transition-all font-bold cursor-pointer"
                >
                  <svg width="20" height="20" className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 px-2 pt-3 border-t border-zinc-100 mt-3">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-zinc-700 font-bold rounded-xl hover:bg-zinc-50 transition-all text-center text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl hover:from-red-500 hover:to-rose-500 transition-all text-center text-sm shadow-md"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}