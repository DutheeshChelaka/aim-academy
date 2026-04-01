'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export default function GradeDetailPage() {
  const params = useParams();
  const gradeId = params.id as string;
  const { hasHydrated } = useAuthStore();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'most-lessons' | 'least-lessons'>('all');

  // ✅ REMOVED AUTH PROTECTION - Allow guest browsing
  useEffect(() => {
    if (!hasHydrated) return;

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
  }, [gradeId, hasHydrated]);

  // ✅ Only show loader while hydrating
  if (!hasHydrated) {
    return <PageLoader />;
  }

  // Enhanced subject colors with better gradients
  const subjectColors = [
    { 
      gradient: 'from-red-500 via-red-600 to-rose-700',
      light: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      ring: 'ring-red-500/20',
      glow: 'shadow-red-500/20'
    },
    { 
      gradient: 'from-gray-600 via-gray-700 to-slate-800',
      light: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      ring: 'ring-gray-500/20',
      glow: 'shadow-gray-500/20'
    },
    { 
      gradient: 'from-rose-500 via-pink-600 to-red-600',
      light: 'bg-pink-50',
      text: 'text-pink-600',
      border: 'border-pink-200',
      ring: 'ring-pink-500/20',
      glow: 'shadow-pink-500/20'
    },
    { 
      gradient: 'from-slate-600 via-gray-700 to-gray-800',
      light: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      ring: 'ring-slate-500/20',
      glow: 'shadow-slate-500/20'
    },
    { 
      gradient: 'from-red-600 via-red-700 to-red-800',
      light: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      ring: 'ring-red-600/20',
      glow: 'shadow-red-600/20'
    },
  ];

  const getSubjectColor = (index: number) => {
    return subjectColors[index % subjectColors.length];
  };

  // Filter and search subjects
  const filteredSubjects = subjects
    .filter(subject => 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (selectedFilter === 'most-lessons') {
        return b._count.lessons - a._count.lessons;
      } else if (selectedFilter === 'least-lessons') {
        return a._count.lessons - b._count.lessons;
      }
      return 0;
    });

  const totalLessons = subjects.reduce((sum, s) => sum + s._count.lessons, 0);
  const avgLessonsPerSubject = subjects.length > 0 ? Math.round(totalLessons / subjects.length) : 0;

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden">
      <div className="h-2 bg-gray-200 animate-pulse"></div>
      <div className="p-6 space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        <div className="pt-4 border-t-2 border-gray-100">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Accent Line with Animation */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 origin-left"
      ></motion.div>

      <Header currentPage="grade" />

      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 sm:py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-10 right-10 w-96 h-96 bg-red-500 rounded-full blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.08, 0.12, 0.08]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl"
          ></motion.div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            {/* Breadcrumb Navigation */}
            <nav className="mb-6 flex items-center space-x-2 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-white font-semibold">{grade?.name || `Grade ${gradeId}`}</span>
            </nav>

            {/* Back Button - Enhanced */}
            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl transition-all mb-8 group shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Grade Badge - Enhanced with Glow Effect */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.2, 
                  type: 'spring', 
                  stiffness: 200,
                  damping: 15
                }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all">
                  <span className="text-6xl sm:text-7xl font-black">{grade?.number || gradeId}</span>
                </div>
              </motion.div>

              {/* Title and Stats */}
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                >
                  {grade?.name || `Grade ${gradeId}`}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 text-base sm:text-lg lg:text-xl mb-6 max-w-2xl"
                >
                  Explore your subjects and dive into interactive lessons designed to help you excel
                </motion.p>

                {/* Stats Cards - Enhanced */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white">{subjects.length}</p>
                        <p className="text-xs text-gray-400 font-medium">Subjects</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white">{totalLessons}</p>
                        <p className="text-xs text-gray-400 font-medium">Total Lessons</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all group col-span-2 sm:col-span-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white">{avgLessonsPerSubject}</p>
                        <p className="text-xs text-gray-400 font-medium">Avg per Subject</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="space-y-8">
            {/* Search Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-96 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="flex gap-2">
                <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-28 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Cards Skeleton */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-xl border-2 border-gray-100"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-32 h-32 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </motion.div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">No Subjects Available</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Subjects will be added soon for this grade. Check back later for updates!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
            >
              {/* Search Input */}
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-gray-900 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('most-lessons')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedFilter === 'most-lessons'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Most Lessons
                </button>
                <button
                  onClick={() => setSelectedFilter('least-lessons')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedFilter === 'least-lessons'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Least Lessons
                </button>
              </div>
            </motion.div>

            {/* Results Counter */}
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-gray-600"
              >
                Found <span className="font-bold text-red-600">{filteredSubjects.length}</span> subject{filteredSubjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </motion.div>
            )}

            {/* Section Header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Available Subjects
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Choose a subject below to access all available lessons and start your learning journey
              </p>
            </motion.div>

            {/* Subjects Grid - Enhanced */}
            {filteredSubjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200"
              >
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No subjects found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredSubjects.map((subject, index) => {
                  const colorScheme = getSubjectColor(index);
                  return (
                    <motion.div
                      key={subject.id}
                      variants={scaleIn}
                      whileHover={{ 
                        y: -8,
                        transition: { duration: 0.2 }
                      }}
                      className="group"
                    >
                      <Link
                        href={`/subject/${subject.id}`}
                        className={`relative bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 ${colorScheme.border} hover:border-red-500 overflow-hidden transition-all block h-full ${colorScheme.glow} hover:shadow-xl`}
                      >
                        {/* Gradient Header */}
                        <div className={`h-2.5 bg-gradient-to-r ${colorScheme.gradient} relative overflow-hidden`}>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                              repeatDelay: 3
                            }}
                          />
                        </div>

                        <div className="p-6">
                          {/* Subject Icon - Enhanced */}
                          <div className="relative mb-5">
                            <div className={`absolute inset-0 ${colorScheme.light} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                            <div className={`relative w-20 h-20 ${colorScheme.light} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg ring-4 ${colorScheme.ring} group-hover:ring-8`}>
                              <span className={`text-4xl font-black ${colorScheme.text}`}>
                                {subject.name.charAt(0)}
                              </span>
                            </div>
                          </div>

                          {/* Subject Name */}
                          <h3 className={`text-xl font-bold mb-3 ${colorScheme.text} group-hover:text-red-600 transition-colors line-clamp-2`}>
                            {subject.name}
                          </h3>

                          {/* Lesson Count Badge */}
                          <div className="mb-5">
                            <div className={`inline-flex items-center px-3 py-1.5 ${colorScheme.light} ${colorScheme.text} rounded-full text-sm font-semibold`}>
                              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                              </svg>
                              {subject._count.lessons} {subject._count.lessons === 1 ? 'Lesson' : 'Lessons'}
                            </div>
                          </div>

                          {/* Action Footer - Enhanced */}
                          <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                            <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                              View Lessons
                            </span>
                            <div className={`w-11 h-11 bg-gradient-to-r ${colorScheme.gradient} rounded-xl flex items-center justify-center transition-all shadow-md group-hover:shadow-lg group-hover:scale-110`}>
                              <svg className="w-5 h-5 text-white transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Hover Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none`}></div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shine"></div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Add custom CSS for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
        .group:hover .group-hover\\:animate-shine {
          animation: shine 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}