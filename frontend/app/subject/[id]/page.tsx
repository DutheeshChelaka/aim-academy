'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { subjectService, Subject } from '@/lib/services/subjectService';
import { Lesson } from '@/lib/services/lessonService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import toast from 'react-hot-toast';
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
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
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
        const [subjectData, lessonsData] = await Promise.all([
          subjectService.getById(subjectId),
          subjectService.getLessons(subjectId),
        ]);
        
        setSubject(subjectData);
        setLessons(lessonsData);

        // Check enrollment for each lesson
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
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load subject data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, hasHydrated, isAuthenticated]);

  // ✅ Show Loader While Checking Auth
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  // Helper to calculate total duration
  const calculateDuration = (videoCount: number) => {
    const hours = Math.floor((videoCount * 20) / 60);
    const mins = (videoCount * 20) % 60;
    return `${hours}h ${mins}m`;
  };

  // Count purchased lessons
  const purchasedCount = Object.values(enrollments).filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subject Not Found</h2>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
              href={`/grade/${subject.gradeId}`}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-lg transition-all mb-6 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Grade {subject.grade.number}
            </Link>

            <div className="flex items-center mb-4">
              <span className="px-4 py-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full text-sm font-bold">
                Grade {subject.grade.number}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
              {subject.name}
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mb-6">
              Master {subject.name} concepts with comprehensive video lessons covering all topics in the Grade {subject.grade.number} syllabus.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
                <span className="font-bold">Professional Teachers</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span className="font-bold">{lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-600 rounded-xl p-6 mb-10"
        >
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">How it works</h3>
              <ul className="text-red-800 space-y-1 text-sm">
                <li>• Purchase any lesson to access all videos inside that lesson</li>
                <li>• Each video can be watched 2 times</li>
                <li>• Secure payment via PayHere</li>
                <li>• Instant access after payment confirmation</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200"
          >
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Lessons Available</h3>
            <p className="text-gray-600 mb-6">Lessons will be added soon for this subject.</p>
            <Link
              href={`/grade/${subject.gradeId}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Subjects
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl sm:text-3xl font-black text-gray-900"
              >
                Available Lessons
              </motion.h2>
              <span className="text-sm text-gray-500 font-semibold">
                {purchasedCount} of {lessons.length} purchased
              </span>
            </div>

            {/* Lessons Grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6"
            >
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  variants={scaleIn}
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all"
                >
                  <div className="grid md:grid-cols-3 gap-0">
                    {/* Thumbnail */}
                    <div className="relative h-48 md:h-full bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-3">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{lesson._count.videos} Videos</span>
                        </div>
                      </div>
                      {enrollments[lesson.id] && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Purchased
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 p-6 sm:p-8">
                      <div className="flex items-start justify-between mb-4">
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                          Lesson {index + 1}
                        </span>
                        <div className="text-right">
                          <div className="text-3xl font-black text-red-600">
                            Rs. {lesson.price}
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">LKR</div>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                        {lesson.title}
                      </h3>

                      <p className="text-gray-600 mb-4">
                        {lesson.description || 'Comprehensive video tutorials covering all essential topics.'}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-4 mb-5">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          <span className="font-semibold">{lesson._count.videos} Videos</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">{calculateDuration(lesson._count.videos)}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {enrollments[lesson.id] ? (
                        <Link
                          href={`/lesson/${lesson.id}`}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Watch Videos
                        </Link>
                      ) : (
                        <Link
                          href={`/payment/${lesson.id}`}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          Buy Now - Rs. {lesson.price}
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </main>

      {/* ✅ Shared Footer Component */}
      <Footer />
    </div>
  );
}