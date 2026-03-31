'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { lessonService, EnrolledLesson } from '@/lib/services/lessonService';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function MyCoursesPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [enrolledLessons, setEnrolledLessons] = useState<EnrolledLesson[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  // ✅ Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Real Enrollments using new method
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const lessons = await lessonService.getMyEnrolledLessons();
        setEnrolledLessons(lessons);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [hasHydrated, isAuthenticated]);

  if (!hasHydrated || !isAuthenticated) return <PageLoader />;

  // Filter enrollments
  const filteredLessons = filter === 'recent' 
    ? enrolledLessons.slice(0, 6) 
    : enrolledLessons;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
      <Header currentPage="my-courses" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            My Purchased Lessons
          </h1>
          <p className="text-gray-600">Access all your purchased video lessons with unlimited views</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{enrolledLessons.length}</p>
                <p className="text-sm text-gray-600 font-semibold">Purchased Lessons</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">
                  {enrolledLessons.reduce((sum, lesson) => sum + lesson._count.videos, 0)}
                </p>
                <p className="text-sm text-gray-600 font-semibold">Total Videos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">
                  Rs. {enrolledLessons.reduce((sum, lesson) => sum + lesson.price, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 font-semibold">Total Invested</p>
              </div>
            </div>
          </motion.div>
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
            All Lessons ({enrolledLessons.length})
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
              filter === 'recent'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-500'
            }`}
          >
            Recent (Last 6)
          </button>
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
                <div className="w-full h-32 bg-gray-300 rounded-xl mb-4"></div>
                <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                <div className="w-full h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : enrolledLessons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200"
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
            {filteredLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.05, 
                  translateY: -10,
                  transition: { duration: 0.3 }
                }}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden group"
              >
                <Link href={`/lesson/${lesson.id}`}>
                  {/* Gradient Header */}
                  <div className="relative h-32 bg-gradient-to-br from-red-600 to-red-700 p-6 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                      <p className="font-bold text-sm">{lesson._count.videos} Videos</p>
                    </div>

                    {/* Status Badge - Published or Draft */}
                    <div className="absolute top-3 right-3">
                      {lesson.isPublished ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                        Grade {lesson.subject?.grade.number}
                      </span>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {lesson.subject?.name}
                      </span>
                      {!lesson.isPublished && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Unpublished
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                      {lesson.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {lesson.description || 'Comprehensive video lessons for this topic'}
                    </p>

                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {formatDate(lesson.enrolledAt)}
                      </span>
                      <span className="font-bold text-red-600">
                        Rs. {lesson.price.toLocaleString()}
                      </span>
                    </div>

                    <button className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                      Watch Videos
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}