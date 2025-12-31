'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { gradeService, Grade } from '@/lib/services/gradeService';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, Variants } from 'framer-motion';
import { SkeletonCard } from '../components/SkeletonLoader';

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
      staggerChildren: 0.08
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

export default function BrowseGradesPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Grades
  useEffect(() => {
    if (!hasHydrated) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchGrades = async () => {
      setLoading(true);
      try {
        const data = await gradeService.getAll();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [hasHydrated, isAuthenticated]);

  // ✅ Show Loader
  if (!hasHydrated || !isAuthenticated) {
    return <PageLoader />;
  }

  // Filter grades by search
  const filteredGrades = grades.filter(grade =>
    grade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* Header */}
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-block px-4 py-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full text-sm font-bold mb-6"
            >
              Choose Your Grade
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6"
            >
              Browse All
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                Available Grades
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Select your grade level to explore subjects and start your learning journey
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              variants={fadeInUp}
              className="max-w-md mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search grades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Stats Overview */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
        >
          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{grades.length}</p>
                <p className="text-sm text-gray-600 font-semibold">Total Grades</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">
                  {grades.reduce((sum, grade) => sum + grade._count.subjects, 0)}
                </p>
                <p className="text-sm text-gray-600 font-semibold">Total Subjects</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            className="bg-white rounded-2xl shadow-md p-6 border-2 border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">500+</p>
                <p className="text-sm text-gray-600 font-semibold">Video Lessons</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Grades Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            {searchQuery ? `Search Results (${filteredGrades.length})` : 'All Grades'}
          </h2>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-red-600 hover:text-red-700 font-bold transition"
            >
              Clear Search
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {[...Array(12)].map((_, index) => (
              <div key={index}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : filteredGrades.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-200"
          >
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? `No results for "${searchQuery}"` : 'No grades available at the moment'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredGrades.map((grade, index) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.15, 
                  translateY: -15,
                  rotateX: 10,
                  rotateY: index % 2 === 0 ? 8 : -8,
                  transition: { duration: 0.4, type: 'spring', stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                <Link
                  href={`/grade/${grade.id}`}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 transition-all overflow-hidden block"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/40 to-transparent transition-all duration-700 translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                  
                  <div className="p-6 sm:p-8 text-center relative z-10">
                    <div className="text-6xl sm:text-7xl font-black text-gray-900 group-hover:text-red-600 mb-3 transition-all duration-300 group-hover:scale-110">
                      {grade.number}
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">
                      {grade.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {grade._count.subjects} {grade._count.subjects === 1 ? 'Subject' : 'Subjects'}
                    </p>
                  </div>
                  
                  {/* Arrow Icon with bounce */}
                  <div className="absolute top-3 right-3 w-8 h-8 bg-gray-100 group-hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-all group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl shadow-2xl p-12 text-white text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Can't Find Your Grade?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            More grades are being added regularly. Check back soon or contact us for more information.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}