'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import { motion, Variants, AnimatePresence } from 'framer-motion';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

interface Enrollment {
  id: string;
  enrolledAt: string;
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };
  lesson: {
    id: string;
    title: string;
    price: number;
    subject: {
      id: string;
      name: string;
      grade: {
        id: string;
        number: number;
      };
    };
  };
}

type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'student' | 'lesson';
type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type ViewMode = 'table' | 'cards';

export default function EnrollmentsManagement() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  
  // Data states
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // ✅ Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  // ✅ Fetch Data
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAllEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
        toast.error('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [hasHydrated, isAuthenticated, user]);

  // ✅ Get unique values for filters
  const uniqueGrades = useMemo(() => {
    const grades = enrollments.map(e => ({ 
      id: e.lesson.subject.grade.id, 
      number: e.lesson.subject.grade.number 
    }));
    const unique = Array.from(new Map(grades.map(g => [g.id, g])).values());
    return unique.sort((a, b) => a.number - b.number);
  }, [enrollments]);

  const uniqueSubjects = useMemo(() => {
    let subjects = enrollments.map(e => ({ 
      id: e.lesson.subject.id, 
      name: e.lesson.subject.name,
      gradeId: e.lesson.subject.grade.id
    }));
    
    if (filterGrade !== 'all') {
      subjects = subjects.filter(s => s.gradeId === filterGrade);
    }
    
    return Array.from(new Map(subjects.map(s => [s.id, s])).values());
  }, [enrollments, filterGrade]);

  // ✅ Date filtering helper
  const isInDateRange = (date: string) => {
    const enrollDate = new Date(date);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return enrollDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return enrollDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return enrollDate >= monthAgo;
      case 'custom':
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return enrollDate >= start && enrollDate <= end;
      case 'all':
      default:
        return true;
    }
  };

  // ✅ Filtered and Sorted Enrollments
  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments;

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.user.name.toLowerCase().includes(query) ||
        e.user.phoneNumber.includes(query) ||
        e.user.email?.toLowerCase().includes(query) ||
        e.lesson.title.toLowerCase().includes(query) ||
        e.lesson.subject.name.toLowerCase().includes(query)
      );
    }

    // Grade filter
    if (filterGrade !== 'all') {
      filtered = filtered.filter(e => e.lesson.subject.grade.id === filterGrade);
    }

    // Subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(e => e.lesson.subject.id === filterSubject);
    }

    // Date filter
    filtered = filtered.filter(e => isInDateRange(e.enrolledAt));

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
        case 'price-desc':
          return b.lesson.price - a.lesson.price;
        case 'price-asc':
          return a.lesson.price - b.lesson.price;
        case 'student':
          return a.user.name.localeCompare(b.user.name);
        case 'lesson':
          return a.lesson.title.localeCompare(b.lesson.title);
        case 'date-desc':
        default:
          return new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime();
      }
    });

    return sorted;
  }, [enrollments, searchTerm, filterGrade, filterSubject, dateFilter, customStartDate, customEndDate, sortBy]);

  // ✅ Statistics
  const stats = useMemo(() => {
    const totalRevenue = enrollments.reduce((sum, e) => sum + e.lesson.price, 0);
    const filteredRevenue = filteredEnrollments.reduce((sum, e) => sum + e.lesson.price, 0);
    const uniqueStudents = new Set(enrollments.map(e => e.user.id)).size;
    const avgRevenue = enrollments.length > 0 ? totalRevenue / enrollments.length : 0;

    // Time-based stats
    const now = new Date();
    const today = enrollments.filter(e => 
      new Date(e.enrolledAt).toDateString() === now.toDateString()
    );
    const thisWeek = enrollments.filter(e => 
      new Date(e.enrolledAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const thisMonth = enrollments.filter(e => 
      new Date(e.enrolledAt) >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    );

    // Grade breakdown
    const gradeBreakdown = uniqueGrades.map(grade => {
      const gradeEnrollments = enrollments.filter(e => e.lesson.subject.grade.id === grade.id);
      return {
        grade: grade.number,
        count: gradeEnrollments.length,
        revenue: gradeEnrollments.reduce((sum, e) => sum + e.lesson.price, 0)
      };
    });

    // Subject breakdown
    const subjectBreakdown = uniqueSubjects.map(subject => {
      const subjectEnrollments = enrollments.filter(e => e.lesson.subject.id === subject.id);
      return {
        name: subject.name,
        count: subjectEnrollments.length,
        revenue: subjectEnrollments.reduce((sum, e) => sum + e.lesson.price, 0)
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      total: enrollments.length,
      totalRevenue,
      filteredRevenue,
      uniqueStudents,
      avgRevenue,
      today: { count: today.length, revenue: today.reduce((sum, e) => sum + e.lesson.price, 0) },
      week: { count: thisWeek.length, revenue: thisWeek.reduce((sum, e) => sum + e.lesson.price, 0) },
      month: { count: thisMonth.length, revenue: thisMonth.reduce((sum, e) => sum + e.lesson.price, 0) },
      filtered: filteredEnrollments.length,
      gradeBreakdown,
      subjectBreakdown: subjectBreakdown.slice(0, 5) // Top 5
    };
  }, [enrollments, filteredEnrollments, uniqueGrades, uniqueSubjects]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterGrade('all');
    setFilterSubject('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('date-desc');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Student Name', 'Phone', 'Email', 'Grade', 'Subject', 'Lesson', 'Price (Rs.)'];
    const rows = filteredEnrollments.map(e => [
      new Date(e.enrolledAt).toLocaleDateString(),
      new Date(e.enrolledAt).toLocaleTimeString(),
      e.user.name,
      e.user.phoneNumber,
      e.user.email || 'N/A',
      e.lesson.subject.grade.number,
      e.lesson.subject.name,
      e.lesson.title,
      e.lesson.price
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('✅ Enrollments exported to CSV!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/admin" className="flex items-center hover:opacity-80 transition">
              <Image src="/images/logo-light.png" alt="AIM Academy" width={130} height={52} className="object-contain sm:w-[150px]" priority />
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">ADMIN</span>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/admin" className="flex items-center px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition group">
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>

              <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg shadow-md hover:shadow-lg transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Enrollments Management
              </h1>
              <p className="text-gray-600">Track all lesson purchases and revenue analytics</p>
            </div>
            <button
              onClick={exportToCSV}
              disabled={filteredEnrollments.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5 group-hover:translate-y-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>

          {/* Main Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Sales</p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Revenue</p>
              <p className="text-2xl font-black text-gray-900">Rs. {Math.floor(stats.totalRevenue / 1000)}K</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Students</p>
              <p className="text-2xl font-black text-gray-900">{stats.uniqueStudents}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg Sale</p>
              <p className="text-2xl font-black text-gray-900">Rs. {Math.floor(stats.avgRevenue)}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">This Week</p>
              <p className="text-2xl font-black text-gray-900">{stats.week.count}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">This Month</p>
              <p className="text-2xl font-black text-gray-900">{stats.month.count}</p>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    dateFilter === 'all'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    dateFilter === 'today'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today ({stats.today.count})
                </button>
                <button
                  onClick={() => setDateFilter('week')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    dateFilter === 'week'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Week ({stats.week.count})
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    dateFilter === 'month'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This Month ({stats.month.count})
                </button>
                <button
                  onClick={() => setDateFilter('custom')}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    dateFilter === 'custom'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom Range
                </button>
              </div>

              {dateFilter === 'custom' && (
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="grid md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search student, lesson, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Grade Filter */}
              <div>
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value);
                    setFilterSubject('all');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Grades</option>
                  {uniqueGrades.map((grade) => (
                    <option key={grade.id} value={grade.id}>Grade {grade.number}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Highest Price</option>
                  <option value="price-asc">Lowest Price</option>
                  <option value="student">Student (A-Z)</option>
                  <option value="lesson">Lesson (A-Z)</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    viewMode === 'table' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    viewMode === 'cards' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-200">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>

              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{filteredEnrollments.length}</span> of <span className="font-bold text-gray-900">{enrollments.length}</span> enrollments
                {filteredEnrollments.length > 0 && (
                  <span className="ml-2 text-red-600 font-bold">
                    (Rs. {stats.filteredRevenue.toLocaleString()})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading enrollments...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {enrollments.length === 0 ? 'No Enrollments Yet' : 'No Matching Enrollments'}
            </h3>
            <p className="text-gray-600 mb-6">
              {enrollments.length === 0 
                ? 'Enrollments will appear here when students purchase lessons' 
                : 'Try adjusting your filters or search query'}
            </p>
            {enrollments.length > 0 && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : viewMode === 'table' ? (
          // TABLE VIEW
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 font-bold text-sm text-gray-700 uppercase tracking-wide">
                <div className="col-span-3">Student</div>
                <div className="col-span-4">Lesson Details</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Date & Time</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredEnrollments.map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    variants={scaleIn}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Student */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                            {enrollment.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">
                              {enrollment.user.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {enrollment.user.phoneNumber}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lesson Details */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap">
                            Grade {enrollment.lesson.subject.grade.number}
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full truncate">
                            {enrollment.lesson.subject.name}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {enrollment.lesson.title}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <div className="text-lg font-black text-red-600">
                          Rs. {enrollment.lesson.price.toLocaleString()}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="col-span-3 text-center">
                        <div className="text-sm font-bold text-gray-900">
                          {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-700">
                  {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? 's' : ''}
                </div>
                <div className="text-xl font-black text-red-600">
                  Total: Rs. {stats.filteredRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // CARDS VIEW
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEnrollments.map((enrollment) => (
                <motion.div
                  key={enrollment.id}
                  variants={scaleIn}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all p-5"
                >
                  {/* Student */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {enrollment.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-gray-900 truncate">
                        {enrollment.user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {enrollment.user.phoneNumber}
                      </div>
                    </div>
                  </div>

                  {/* Lesson */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                        Grade {enrollment.lesson.subject.grade.number}
                      </span>
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full truncate">
                        {enrollment.lesson.subject.name}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {enrollment.lesson.title}
                    </h4>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="text-sm text-gray-500">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xl font-black text-red-600">
                      Rs. {enrollment.lesson.price.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}