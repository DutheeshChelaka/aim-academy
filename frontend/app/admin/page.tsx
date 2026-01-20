'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '../components/PageLoader';
import { motion, Variants } from 'framer-motion';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  // ✅ Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Fetch Stats
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [hasHydrated, isAuthenticated, user]);

  // ✅ Calculate additional metrics
  const metrics = useMemo(() => {
    if (!stats) return null;

    const totalRevenue = stats.recentEnrollments?.reduce((sum: number, e: any) => 
      sum + (e.lesson?.price || 0), 0
    ) || 0;

    const avgRevenuePerStudent = stats.totalStudents > 0 
      ? totalRevenue / stats.totalStudents 
      : 0;

    const avgVideosPerLesson = stats.totalLessons > 0
      ? stats.totalVideos / stats.totalLessons
      : 0;

    return {
      totalRevenue,
      avgRevenuePerStudent,
      avgVideosPerLesson
    };
  }, [stats]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      title: 'Grades',
      description: 'Manage grade levels and organize curriculum structure',
      href: '/admin/grades',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      count: stats?.totalGrades || 0,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
          <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      title: 'Subjects',
      description: 'Create and manage subjects for each grade level',
      href: '/admin/subjects',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      count: stats?.totalSubjects || 0,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
    },
    {
      title: 'Lessons',
      description: 'Create lessons with pricing and video content',
      href: '/admin/lessons',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      count: stats?.totalLessons || 0,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Videos',
      description: 'Upload and manage video content for lessons',
      href: '/admin/videos',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      count: stats?.totalVideos || 0,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      ),
    },
    {
      title: 'Students',
      description: 'View and manage registered students',
      href: '/admin/students',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      count: stats?.totalStudents || 0,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      title: 'Enrollments',
      description: 'Track lesson purchases and payments',
      href: '/admin/enrollments',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      count: stats?.totalEnrollments || 0,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      title: 'Add New Grade',
      href: '/admin/grades',
      color: 'from-red-500 to-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      title: 'Create Subject',
      href: '/admin/subjects',
      color: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: 'New Lesson',
      href: '/admin/lessons',
      color: 'from-purple-500 to-purple-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Upload Video',
      href: '/admin/videos',
      color: 'from-green-500 to-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Top Accent Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/admin" className="flex items-center hover:opacity-80 transition">
              <Image
                src="/images/logo-light.png"
                alt="AIM Academy"
                width={130}
                height={52}
                className="object-contain sm:w-[150px]"
                priority
              />
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                ADMIN
              </span>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black">
                    Welcome Back, {user?.name?.split(' ')[0] || 'Admin'}
                  </h1>
                </div>
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl">
                  Manage your academy and track performance from your dashboard
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">Current Time</span>
                </div>
                <div className="text-3xl font-black">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
                <div className="text-sm text-gray-400">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
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
            <p className="text-gray-600 font-semibold">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 hover:shadow-xl hover:border-red-500 transition-all group cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <div className={`${item.bgColor} ${item.textColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {item.count}
                  </div>
                  <div className="text-xs font-semibold text-gray-600">
                    {item.title}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Revenue & Analytics */}
            {metrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-3 gap-6 mb-8"
              >
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                      Total Revenue
                    </div>
                  </div>
                  <div className="text-4xl font-black mb-2">
                    Rs. {Math.floor(metrics.totalRevenue / 1000)}K
                  </div>
                  <div className="text-sm text-green-100">
                    From {stats.totalEnrollments} enrollments
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                      Avg Revenue
                    </div>
                  </div>
                  <div className="text-4xl font-black mb-2">
                    Rs. {Math.floor(metrics.avgRevenuePerStudent)}
                  </div>
                  <div className="text-sm text-blue-100">
                    Per student
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">
                      Content Ratio
                    </div>
                  </div>
                  <div className="text-4xl font-black mb-2">
                    {metrics.avgVideosPerLesson.toFixed(1)}
                  </div>
                  <div className="text-sm text-purple-100">
                    Videos per lesson
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Quick Actions
                  </h2>
                </div>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="block bg-white rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 p-4 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition">
                            {action.title}
                          </h3>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* System Status */}
                <div className="mt-6 bg-white rounded-xl shadow-md border-2 border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                      System Status
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Database</span>
                      </div>
                      <span className="text-xs font-bold text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">API Server</span>
                      </div>
                      <span className="text-xs font-bold text-green-600">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Payments</span>
                      </div>
                      <span className="text-xs font-bold text-green-600">Operational</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recent Enrollments */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Recent Activity
                    </h2>
                  </div>
                  <Link
                    href="/admin/enrollments"
                    className="text-sm font-bold text-red-600 hover:text-red-700 transition flex items-center gap-1"
                  >
                    View All
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {stats.recentEnrollments.slice(0, 5).map((enrollment: any, index: number) => (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                                {enrollment.user.name?.charAt(0).toUpperCase() || 'S'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-base font-bold text-gray-900 truncate">
                                    {enrollment.user.name || 'Student'}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                                    New Purchase
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1 truncate">
                                  {enrollment.lesson.title}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                    Grade {enrollment.lesson.subject.grade.number}
                                  </span>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                                    {enrollment.lesson.subject.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-black text-red-600 mb-1">
                                Rs. {enrollment.lesson.price?.toLocaleString() || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-gray-600">Enrollments will appear here when students purchase lessons</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Management Cards */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                  Content Management
                </h2>
              </div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {menuItems.map((item, index) => (
                  <motion.div key={index} variants={scaleIn}>
                    <Link
                      href={item.href}
                      className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`${item.bgColor} ${item.textColor} w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            {item.icon}
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-gray-900">{item.count}</div>
                            <div className="text-xs text-gray-500 font-semibold">Total</div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center text-red-600 font-semibold text-sm">
                          <span>Manage {item.title}</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}