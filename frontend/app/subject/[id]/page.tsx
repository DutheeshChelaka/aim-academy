'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { subjectService, Subject } from '@/lib/services/subjectService';
import { Lesson } from '@/lib/services/lessonService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import PageLoader from '@/app/components/PageLoader';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, Variants, AnimatePresence } from 'framer-motion';

// Enhanced Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [filterView, setFilterView] = useState<'all' | 'purchased' | 'unpurchased'>('all');

  // ✅ REMOVED AUTH PROTECTION - Allow guest browsing
  useEffect(() => {
    if (!hasHydrated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [subjectData, lessonsData] = await Promise.all([
          subjectService.getById(subjectId),
          subjectService.getLessons(subjectId),
        ]);
        
        setSubject(subjectData);
        setLessons(lessonsData);

        // ✅ Only check enrollment if user is logged in
        if (isAuthenticated) {
          const enrollmentChecks = await Promise.all(
            lessonsData.map(async (lesson: any) => {
              try {
                const result = await enrollmentService.checkEnrollment(lesson.id);
                return { lessonId: lesson.id, isEnrolled: result.isEnrolled };
              } catch (error) {
                return { lessonId: lesson.id, isEnrolled: false };
              }
            })
          );

          const enrollmentMap: { [key: string]: boolean } = {};
          enrollmentChecks.forEach(({ lessonId, isEnrolled }) => {
            enrollmentMap[lessonId] = isEnrolled;
          });
          setEnrollments(enrollmentMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load subject data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, hasHydrated, isAuthenticated]);

  // ✅ Only show loader while hydrating
  if (!hasHydrated) {
    return <PageLoader />;
  }

  const calculateDuration = (videoCount: number) => {
    const hours = Math.floor((videoCount * 20) / 60);
    const mins = (videoCount * 20) % 60;
    return `${hours}h ${mins}m`;
  };

  const purchasedCount = Object.values(enrollments).filter(Boolean).length;
  const totalPrice = lessons.reduce((sum, lesson) => sum + lesson.price, 0);

  // ✅ Filter lessons - guests only see 'all'
  const filteredLessons = lessons.filter(lesson => {
    if (!isAuthenticated) return true; // Guests see all
    if (filterView === 'purchased') return enrollments[lesson.id];
    if (filterView === 'unpurchased') return !enrollments[lesson.id];
    return true;
  });

  if (loading) {
    return <PageLoader />;
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subject Not Found</h2>
          <p className="text-gray-600 mb-6">The subject you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-lg"></div>

      <Header currentPage="home" />

      {/* Hero Section - Ultra Modern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 sm:py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Back Button */}
            <motion.div variants={fadeInUp}>
              <Link
                href={`/grade/${subject.gradeId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-xl transition-all mb-6 group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Grade {subject.grade.number}
              </Link>
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-full text-sm font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
                Grade {subject.grade.number}
              </span>
            </motion.div>

            {/* Title */}
            <motion.div variants={fadeInUp} className="mb-8">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                {subject.name}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-3xl">
                Master {subject.name} concepts with comprehensive video lessons covering all topics in the Grade {subject.grade.number} syllabus.
              </p>
            </motion.div>

            {/* Stats Pills */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                    </svg>
                  ),
                  label: 'Professional Teachers'
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  ),
                  label: `${lessons.length} ${lessons.length === 1 ? 'Lesson' : 'Lessons'}`
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  ),
                  label: 'HD Quality Videos'
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 border border-white/20 hover:bg-white/20 transition-all"
                >
                  {item.icon}
                  <span className="font-bold text-sm">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        {/* Enhanced Stats Overview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              ),
              value: lessons.length,
              label: 'Total Lessons',
              gradient: 'from-red-500 to-red-600',
              bgColor: 'bg-red-100',
              textColor: 'text-red-600'
            },
            // ✅ Only show "Purchased" stat if logged in
            ...(isAuthenticated ? [{
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ),
              value: purchasedCount,
              label: 'Purchased',
              gradient: 'from-green-500 to-green-600',
              bgColor: 'bg-green-100',
              textColor: 'text-green-600'
            }] : []),
            {
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              ),
              value: lessons.reduce((sum, lesson) => sum + lesson._count.videos, 0),
              label: 'Total Videos',
              gradient: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-100',
              textColor: 'text-blue-600'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              ),
              value: `Rs. ${totalPrice.toLocaleString()}`,
              label: 'Total Value',
              gradient: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-100',
              textColor: 'text-purple-600'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              whileHover={{ 
                scale: 1.05, 
                translateY: -8,
                transition: { duration: 0.3 }
              }}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl p-6 transition-all border-2 border-gray-100 hover:border-red-200 cursor-pointer overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/50 to-transparent transition-all duration-700 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              
              <div className="relative z-10 text-center">
                <motion.div 
                  className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all ${stat.textColor}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Alert - Updated for guests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-2xl p-6 mb-12 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-3">How Lesson Access Works</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  isAuthenticated ? 'Purchase any lesson to access all videos inside' : 'Login or sign up to purchase lessons',
                  'Unlimited views for each video',
                  'Secure payment via PayHere',
                  'Instant access after payment confirmation',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-blue-800 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs - Only show for logged-in users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              Available Lessons
            </h2>
            <p className="text-gray-600">
              {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
            </p>
          </div>

          {/* ✅ Only show filter tabs if logged in */}
          {isAuthenticated && (
            <div className="flex gap-2">
              {[
                { value: 'all' as const, label: 'All', count: lessons.length },
                { value: 'purchased' as const, label: 'Purchased', count: purchasedCount },
                { value: 'unpurchased' as const, label: 'Not Purchased', count: lessons.length - purchasedCount },
              ].map((filter) => (
                <motion.button
                  key={filter.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterView(filter.value)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    filterView === filter.value
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-md border-2 border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Lessons Available</h3>
            <p className="text-gray-600 mb-8">Lessons will be added soon for this subject.</p>
            <Link
              href={`/grade/${subject.gradeId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Subjects
            </Link>
          </motion.div>
        ) : filteredLessons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-3xl shadow-md border-2 border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Lessons Found</h3>
            <p className="text-gray-600 mb-6">
              {filterView === 'purchased' 
                ? "You haven't purchased any lessons yet."
                : "All lessons have been purchased!"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterView('all')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              View All Lessons
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={filterView}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={staggerContainer}
              className="space-y-6"
            >
              {filteredLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  variants={scaleIn}
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  className="group"
                >
                  <Link
                    href={`/lesson/${lesson.id}`}
                    className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-red-400 overflow-hidden transition-all"
                  >
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Enhanced Thumbnail */}
                      <div className="relative h-64 md:h-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {lesson.thumbnailUrl ? (
                          <>
                            <Image
                              src={lesson.thumbnailUrl}
                              alt={lesson.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                  <span className="text-white text-sm font-bold">{lesson._count.videos} Videos</span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-3">
                                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              </div>
                              <span className="text-sm font-bold text-gray-700">{lesson._count.videos} Videos</span>
                            </div>
                          </div>
                        )}
                        
                        {/* ✅ Status Badge - Only show if logged in AND purchased */}
                        {isAuthenticated && enrollments[lesson.id] && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 z-10"
                          >
                            <span className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Purchased
                            </span>
                          </motion.div>
                        )}

                        {/* Lesson Number Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
                            Lesson {index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Content */}
                      <div className="md:col-span-2 p-6 sm:p-8 relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                              {lesson.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                              {lesson.description || 'Comprehensive video tutorials covering all essential topics with expert instruction.'}
                            </p>
                          </div>
                          
                          <div className="text-right ml-6">
                            <div className="text-4xl font-black text-red-600 mb-1">
                              {lesson.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 font-bold">LKR</div>
                          </div>
                        </div>

                        {/* Enhanced Stats */}
                        <div className="flex flex-wrap gap-4 mb-6">
                          {[
                            {
                              icon: (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              ),
                              label: `${lesson._count.videos} Videos`
                            },
                            {
                              icon: (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              ),
                              label: calculateDuration(lesson._count.videos)
                            },
                            {
                              icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              ),
                              label: 'Unlimited Views'
                            },
                          ].map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                              <div className="text-gray-600">{stat.icon}</div>
                              <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                          <div className="flex items-center gap-2 text-red-600 font-bold">
                            <span>View Lesson Details</span>
                            <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>

                          {isAuthenticated && enrollments[lesson.id] && (
                            <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-lg">
                              Access Now
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}