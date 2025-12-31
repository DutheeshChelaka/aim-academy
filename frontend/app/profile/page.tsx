'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import { motion } from 'framer-motion';

// Mock data - Replace with real API calls later
interface EnrolledLesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  progress: number;
  thumbnail: string;
  lastAccessed: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [recentLessons, setRecentLessons] = useState<EnrolledLesson[]>([]);

  // ✅ Auth Protection with Hydration Check
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Data After Hydration
  useEffect(() => {
    if (!hasHydrated) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Fetch enrolled lessons
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API call
        // const data = await enrollmentService.getRecentLessons();
        
        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecentLessons([
          {
            id: '1',
            title: 'Introduction to Algebra',
            subject: 'Mathematics',
            grade: 'Grade 10',
            progress: 75,
            thumbnail: '/images/childwrite.jpg',
            lastAccessed: '2 hours ago'
          },
          {
            id: '2',
            title: 'Cell Biology',
            subject: 'Science',
            grade: 'Grade 10',
            progress: 45,
            thumbnail: '/images/childwrite.jpg',
            lastAccessed: '1 day ago'
          },
          {
            id: '3',
            title: 'Shakespeare Studies',
            subject: 'English',
            grade: 'Grade 10',
            progress: 90,
            thumbnail: '/images/childwrite.jpg',
            lastAccessed: '3 days ago'
          }
        ]);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasHydrated, isAuthenticated]);

  // ✅ Show Loader While Checking Auth
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* Header */}
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

            <nav className="hidden lg:flex items-center space-x-1">
              <Link href="/dashboard" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                Home
              </Link>
              <Link href="/my-courses" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                My Courses
              </Link>
              <Link href="/profile" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-sm">
                Profile
              </Link>
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-black text-5xl shadow-2xl ring-4 ring-white/20">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                {user?.name || 'Student Name'}
              </h1>
              <p className="text-red-400 font-semibold mb-4">{user?.phoneNumber}</p>
              
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/70 text-sm">Enrolled Courses</p>
                  <p className="text-2xl font-black text-white">3</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/70 text-sm">Completed Lessons</p>
                  <p className="text-2xl font-black text-white">12</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/70 text-sm">Average Progress</p>
                  <p className="text-2xl font-black text-white">70%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Lessons Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Continue Learning
            </h2>
            <Link
              href="/my-courses"
              className="text-sm font-bold text-red-600 hover:text-red-700 transition"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
                  <div className="w-full h-40 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="w-full h-2 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    translateY: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden cursor-pointer group"
                >
                  <Link href={`/lesson/${lesson.id}`}>
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {lesson.progress}%
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-600">{lesson.subject}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{lesson.grade}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-red-600 to-red-700 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">Last accessed {lesson.lastAccessed}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/my-courses"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Courses</h3>
            <p className="text-sm text-gray-600">View all enrolled courses</p>
          </Link>

          <Link
            href="/dashboard"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Dashboard</h3>
            <p className="text-sm text-gray-600">Back to main dashboard</p>
          </Link>

          <Link
            href="/dashboard#courses"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Browse Grades</h3>
            <p className="text-sm text-gray-600">Explore available courses</p>
          </Link>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group cursor-pointer">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Settings</h3>
            <p className="text-sm text-gray-600">Manage your account</p>
          </div>
        </div>
      </main>
    </div>
  );
}