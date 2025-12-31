'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import { motion } from 'framer-motion';

// Mock data - Replace with real API
interface EnrolledCourse {
  id: string;
  title: string;
  grade: string;
  subject: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  thumbnail: string;
  enrolledDate: string;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  // ✅ Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Data
  useEffect(() => {
    if (!hasHydrated) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCourses([
          {
            id: '1',
            title: 'Advanced Mathematics',
            grade: 'Grade 10',
            subject: 'Mathematics',
            progress: 75,
            totalLessons: 20,
            completedLessons: 15,
            thumbnail: '/images/childwrite.jpg',
            enrolledDate: 'Jan 15, 2025'
          },
          {
            id: '2',
            title: 'Biology Fundamentals',
            grade: 'Grade 10',
            subject: 'Science',
            progress: 45,
            totalLessons: 18,
            completedLessons: 8,
            thumbnail: '/images/childwrite.jpg',
            enrolledDate: 'Jan 20, 2025'
          },
          {
            id: '3',
            title: 'English Literature',
            grade: 'Grade 10',
            subject: 'English',
            progress: 90,
            totalLessons: 15,
            completedLessons: 14,
            thumbnail: '/images/childwrite.jpg',
            enrolledDate: 'Jan 10, 2025'
          }
        ]);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [hasHydrated, isAuthenticated]);

  // ✅ Show Loader
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  const filteredCourses = courses.filter(course => {
    if (filter === 'completed') return course.progress === 100;
    if (filter === 'in-progress') return course.progress < 100;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/my-courses" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-sm">
                My Courses
              </Link>
              <Link href="/profile" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                Profile
              </Link>
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/profile" className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </Link>

              <button
                onClick={() => { logout(); router.push('/login'); }}
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            My Courses
          </h1>
          <p className="text-gray-600">Track your learning progress and continue where you left off</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-500'
            }`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              filter === 'in-progress'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-500'
            }`}
          >
            In Progress ({courses.filter(c => c.progress < 100).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-500'
            }`}
          >
            Completed ({courses.filter(c => c.progress === 100).length})
          </button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded-xl mb-4"></div>
                <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                <div className="w-full h-2 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
            <Link
              href="/dashboard#courses"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  translateY: -10,
                  transition: { duration: 0.3 }
                }}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden group cursor-pointer"
              >
                <Link href={`/course/${course.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {course.progress === 100 && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Completed
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {course.progress}%
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{course.grade}</span>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">{course.subject}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition">
                      {course.title}
                    </h3>

                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                      <span>Enrolled {course.enrolledDate}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-red-600 to-red-700 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>

                    <button className="w-full mt-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2">
                      Continue Learning
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}