'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { gradeService, Grade } from '@/lib/services/gradeService';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { SkeletonCard } from '../components/SkeletonLoader';

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
      staggerChildren: 0.1,
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

export default function BrowseGradesPage() {
  const { hasHydrated } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // ✅ REMOVED AUTH PROTECTION - Allow guest browsing
  useEffect(() => {
    if (!hasHydrated) return;

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
  }, [hasHydrated]);

  // ✅ Only show loader while hydrating
  if (!hasHydrated) {
    return <PageLoader />;
  }

  const filteredGrades = grades.filter(grade =>
    grade.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Premium Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-lg"></div>

      <Header currentPage="grade" />

      {/* Hero Section - Ultra Modern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 sm:py-24">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600/20 backdrop-blur-md border border-red-500/40 rounded-full text-sm font-bold shadow-lg"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              Choose Your Grade
            </motion.div>
            
            {/* Heading */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                Browse All
                <br />
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600">
                    Available Grades
                  </span>
                  <motion.div 
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  ></motion.div>
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                Select your grade level to explore subjects and embark on your learning adventure
              </p>
            </motion.div>

            {/* Enhanced Search Bar */}
            <motion.div 
              variants={fadeInUp}
              className="max-w-xl mx-auto"
            >
              <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-2xl blur-xl transition-opacity" style={{ opacity: searchFocused ? 1 : 0 }}></div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for your grade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full px-6 py-5 pl-14 bg-white/10 backdrop-blur-md border-2 border-white/20 focus:border-red-500/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none transition-all text-lg"
                  />
                  <svg 
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
              ),
              value: grades.length,
              label: 'Total Grades',
              gradient: 'from-red-500 to-red-600',
              bgColor: 'bg-red-100',
              textColor: 'text-red-600'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              ),
              value: grades.reduce((sum, grade) => sum + grade._count.subjects, 0),
              label: 'Total Subjects',
              gradient: 'from-gray-600 to-gray-700',
              bgColor: 'bg-gray-100',
              textColor: 'text-gray-700'
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              ),
              value: '500+',
              label: 'Video Lessons',
              gradient: 'from-red-500 to-pink-600',
              bgColor: 'bg-red-100',
              textColor: 'text-red-600'
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
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl p-8 transition-all border-2 border-gray-100 hover:border-red-200 cursor-pointer overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/50 to-transparent transition-all duration-700 translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <motion.div 
                  className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all ${stat.textColor}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {stat.icon}
                </motion.div>
                <div>
                  <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                  <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section Header with Results Count */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              {searchQuery ? `Search Results` : 'All Grades'}
            </h2>
            <p className="text-gray-600 mt-1">
              {searchQuery 
                ? `Found ${filteredGrades.length} ${filteredGrades.length === 1 ? 'grade' : 'grades'} matching "${searchQuery}"`
                : `Showing all ${grades.length} available grades`
              }
            </p>
          </div>
          
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSearchQuery('')}
              className="group flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all border-2 border-red-200 hover:border-red-300"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Search
            </motion.button>
          )}
        </motion.div>

        {/* Grades Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {[...Array(12)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredGrades.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-md border-2 border-gray-200"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `We couldn't find any grades matching "${searchQuery}". Try a different search term.`
                : 'No grades available at the moment. Check back soon!'
              }
            </p>
            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchQuery('')}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Clear Search & View All
              </motion.button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
            >
              {filteredGrades.map((grade, index) => (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.1, 
                    translateY: -12,
                    transition: { duration: 0.3, type: 'spring', stiffness: 300 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/grade/${grade.id}`}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-red-400 transition-all overflow-hidden block"
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Multiple shine effects */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 group-hover:via-white/60 to-transparent transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
                    
                    <div className="p-8 text-center relative z-10">
                      <motion.div 
                        className="text-7xl font-black text-gray-900 group-hover:text-red-600 mb-3 transition-all duration-300"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        {grade.number}
                      </motion.div>
                      <p className="text-sm font-bold text-gray-700 mb-1 group-hover:text-red-600 transition-colors">
                        {grade.name}
                      </p>
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        <span>{grade._count.subjects} {grade._count.subjects === 1 ? 'Subject' : 'Subjects'}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced arrow icon */}
                    <motion.div 
                      className="absolute top-3 right-3 w-9 h-9 bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-red-700 rounded-full flex items-center justify-center transition-all shadow-md group-hover:shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 relative overflow-hidden bg-gradient-to-r from-red-600 via-red-600 to-red-700 rounded-3xl shadow-2xl p-12 sm:p-16 text-white"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center space-y-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              Can't Find Your Grade?
            </h2>
            <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
              More grades are being added regularly. Check back soon or contact us for more information about upcoming content.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}