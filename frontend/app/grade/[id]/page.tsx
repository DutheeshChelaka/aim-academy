'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { gradeService, Grade } from '@/lib/services/gradeService';
import { Subject } from '@/lib/services/subjectService';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, Variants } from 'framer-motion';

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

export default function GradeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const gradeId = params.id as string;
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

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

    const fetchData = async () => {
      setLoading(true);
      try {
        const [gradeData, subjectsData] = await Promise.all([
          gradeService.getById(gradeId),
          gradeService.getSubjects(gradeId),
        ]);
        setGrade(gradeData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching grade data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gradeId, hasHydrated, isAuthenticated]);

  // ✅ Show Loader While Checking Auth
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  // Subject colors matching theme (Red/Gray only)
  const subjectColors = [
    { color: 'from-red-600 to-red-700', lightColor: 'bg-red-50', textColor: 'text-red-600', borderColor: 'border-red-200' },
    { color: 'from-gray-700 to-gray-800', lightColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-200' },
    { color: 'from-red-500 to-pink-600', lightColor: 'bg-pink-50', textColor: 'text-pink-600', borderColor: 'border-pink-200' },
    { color: 'from-gray-600 to-gray-700', lightColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' },
    { color: 'from-red-700 to-red-800', lightColor: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-300' },
  ];

  const getSubjectColor = (index: number) => {
    return subjectColors[index % subjectColors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* ✅ Shared Header Component */}
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            {/* Back Button */}
            <Link
              href="/grade"
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg transition-all mb-6 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Grades
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Grade Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white/20"
              >
                <span className="text-5xl sm:text-6xl font-black">{grade?.number || gradeId}</span>
              </motion.div>

              {/* Title */}
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3">
                  {grade?.name || `Grade ${gradeId}`}
                </h1>
                <p className="text-gray-300 text-base sm:text-lg lg:text-xl mb-4">
                  Select a subject to explore lessons and start learning
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {subjects.reduce((sum, s) => sum + s._count.lessons, 0)} Total Lessons
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200"
          >
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Available</h3>
            <p className="text-gray-600 mb-6">Subjects will be added soon for this grade.</p>
            <Link
              href="/grade"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Grades
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Section Header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
                Available Subjects
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Choose a subject below to access all available lessons
              </p>
            </motion.div>

            {/* Subjects Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {subjects.map((subject, index) => {
                const colorScheme = getSubjectColor(index);
                return (
                  <motion.div
                    key={subject.id}
                    variants={scaleIn}
                    whileHover={{ 
                      scale: 1.05, 
                      translateY: -10,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={`/subject/${subject.id}`}
                      className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 ${colorScheme.borderColor} hover:border-red-500 overflow-hidden transition-all block`}
                    >
                      {/* Color Strip */}
                      <div className={`h-2 bg-gradient-to-r ${colorScheme.color}`}></div>

                      <div className="p-6">
                        {/* Subject Icon/Initial */}
                        <div className={`w-16 h-16 ${colorScheme.lightColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                          <span className={`text-3xl font-black ${colorScheme.textColor}`}>
                            {subject.name.charAt(0)}
                          </span>
                        </div>

                        {/* Subject Name */}
                        <h3 className={`text-xl font-bold mb-2 ${colorScheme.textColor} group-hover:text-red-600 transition-colors`}>
                          {subject.name}
                        </h3>

                        {/* Lesson Count */}
                        <p className="text-gray-500 text-sm mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                          {subject._count.lessons} {subject._count.lessons === 1 ? 'Lesson' : 'Lessons'}
                        </p>

                        {/* Action Footer */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                          <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                            View Lessons
                          </span>
                          <div className="w-10 h-10 bg-gray-100 group-hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-sm">
                            <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Hover Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </main>

      {/* ✅ Shared Footer Component */}
      <Footer />
    </div>
  );
}