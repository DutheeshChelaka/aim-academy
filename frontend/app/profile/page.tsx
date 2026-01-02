'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Enrollment {
  id: string;
  enrolledAt: string;
  lesson: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl?: string;
    subject: {
      id: string;
      name: string;
      grade: {
        number: number;
      };
    };
    _count: {
      videos: number;
    };
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // ✅ Auth Protection with Hydration Check
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Real Data
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const response = await api.get('/enrollments/my');
        setEnrollments(response.data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [hasHydrated, isAuthenticated]);

  // ✅ Show Loader While Checking Auth
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Calculate stats from real data
  const totalCourses = enrollments.length;
  const totalVideos = enrollments.reduce((sum, e) => sum + e.lesson._count.videos, 0);
  const totalSpent = enrollments.reduce((sum, e) => sum + e.lesson.price, 0);

  // Get 3 most recent lessons
  const recentLessons = enrollments.slice(0, 3);

  // Format date
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* ✅ Shared Header */}
      <Header currentPage="profile" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 relative overflow-hidden"
        >
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
              
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/70 text-sm">Purchased Lessons</p>
                  <p className="text-2xl font-black text-white">{totalCourses}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/70 text-sm">Total Videos</p>
                  <p className="text-2xl font-black text-white">{totalVideos}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <p className="text-white/70 text-sm">Total Invested</p>
                  <p className="text-2xl font-black text-white">Rs. {totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Lessons Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Recently Purchased
            </h2>
            <Link
              href="/my-courses"
              className="text-sm font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
                  <div className="w-full h-40 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="w-full h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-gray-200"
            >
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Purchased Lessons Yet</h3>
              <p className="text-gray-600 mb-6">Start learning by purchasing your first lesson</p>
              <Link
                href="/grade"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Browse Grades & Lessons
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLessons.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.05, 
                    translateY: -8,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden group"
                >
                  <Link href={`/lesson/${enrollment.lesson.id}`}>
                    {/* Thumbnail or Gradient */}
                    <div className="relative h-40 overflow-hidden">
                      {enrollment.lesson.thumbnailUrl ? (
                        <Image
                          src={enrollment.lesson.thumbnailUrl}
                          alt={enrollment.lesson.title}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                            </div>
                            <p className="font-bold text-sm">{enrollment.lesson._count.videos} Videos</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Purchased Badge */}
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Purchased
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                          Grade {enrollment.lesson.subject.grade.number}
                        </span>
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {enrollment.lesson.subject.name}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                        {enrollment.lesson.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {enrollment.lesson.description || 'Comprehensive video lessons for this topic'}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {getTimeAgo(enrollment.enrolledAt)}
                        </span>
                        <span className="font-bold text-red-600">
                          Rs. {enrollment.lesson.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Link
            href="/my-courses"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">My Courses</h3>
            <p className="text-sm text-gray-600">View all purchased lessons</p>
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
            href="/grade"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Browse Grades</h3>
            <p className="text-sm text-gray-600">Explore available lessons</p>
          </Link>

          <button
            onClick={handleLogout}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-500 hover:shadow-lg transition-all group text-left"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Logout</h3>
            <p className="text-sm text-gray-600">Sign out of your account</p>
          </button>
        </motion.div>
      </main>

      {/* ✅ Shared Footer */}
      <Footer />
    </div>
  );
}