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
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

interface Enrollment {
  id: string;
  enrolledAt: string;
  lesson: {
    id: string;
    title: string;
    price: number;
    subject: {
      name: string;
      grade: {
        number: number;
      };
    };
  };
}

interface Student {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
  enrollments?: Enrollment[];
}

type SortOption = 'name' | 'newest' | 'oldest' | 'purchases' | 'revenue';
type FilterOption = 'all' | 'has-purchases' | 'no-purchases';

export default function StudentsManagement() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  
  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

    fetchStudents();
  }, [hasHydrated, isAuthenticated, user]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get unique grades
  const uniqueGrades = useMemo(() => {
    const grades = new Set<number>();
    students.forEach(student => {
      student.enrollments?.forEach(enrollment => {
        grades.add(enrollment.lesson.subject.grade.number);
      });
    });
    return Array.from(grades).sort((a, b) => a - b);
  }, [students]);

  // ✅ Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.phoneNumber.includes(query) ||
        s.email?.toLowerCase().includes(query)
      );
    }

    // Purchase filter
    if (filterBy === 'has-purchases') {
      filtered = filtered.filter(s => s.enrollments && s.enrollments.length > 0);
    } else if (filterBy === 'no-purchases') {
      filtered = filtered.filter(s => !s.enrollments || s.enrollments.length === 0);
    }

    // Grade filter
    if (selectedGrade !== 'all') {
      const gradeNum = parseInt(selectedGrade);
      filtered = filtered.filter(s => 
        s.enrollments?.some(e => e.lesson.subject.grade.number === gradeNum)
      );
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'purchases':
          return (b.enrollments?.length || 0) - (a.enrollments?.length || 0);
        case 'revenue':
          const revenueA = a.enrollments?.reduce((sum, e) => sum + (e?.lesson?.price || 0), 0) || 0;
          const revenueB = b.enrollments?.reduce((sum, e) => sum + (e?.lesson?.price || 0), 0) || 0;
          return revenueB - revenueA;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [students, searchTerm, filterBy, selectedGrade, sortBy]);

  // ✅ Statistics
  const stats = useMemo(() => {
    const totalRevenue = students.reduce((sum, student) => {
      if (!student.enrollments || !Array.isArray(student.enrollments)) return sum;
      return sum + student.enrollments.reduce((enrollSum, enrollment) => {
        return enrollSum + (enrollment?.lesson?.price || 0);
      }, 0);
    }, 0);

    const totalEnrollments = students.reduce((sum, student) => {
      return sum + (student.enrollments?.length || 0);
    }, 0);

    const withPurchases = students.filter(s => s.enrollments && s.enrollments.length > 0).length;
    const withoutPurchases = students.length - withPurchases;

    const avgRevenue = students.length > 0 ? totalRevenue / students.length : 0;
    const avgPurchases = students.length > 0 ? totalEnrollments / students.length : 0;

    return {
      total: students.length,
      totalRevenue,
      totalEnrollments,
      withPurchases,
      withoutPurchases,
      avgRevenue,
      avgPurchases,
      filtered: filteredStudents.length
    };
  }, [students, filteredStudents]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`⚠️ Are you sure you want to delete ${student.name}?\n\nThis will permanently delete all their enrollment data!\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteStudent(student.id);
      toast.success('🗑️ Student deleted successfully!');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const toggleStudent = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  const openDetailsModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedStudent(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterBy('all');
    setSelectedGrade('all');
    setSortBy('newest');
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Joined Date', 'Total Purchases', 'Total Spent (Rs.)'];
    const rows = filteredStudents.map(student => [
      student.name,
      student.phoneNumber,
      student.email || 'N/A',
      new Date(student.createdAt).toLocaleDateString(),
      student.enrollments?.length || 0,
      student.enrollments?.reduce((sum, e) => sum + (e?.lesson?.price || 0), 0) || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('✅ Students exported to CSV!');
  };

  const getStudentRevenue = (student: Student) => {
    return student.enrollments?.reduce((sum, e) => sum + (e?.lesson?.price || 0), 0) || 0;
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
                Students Management
              </h1>
              <p className="text-gray-600">Manage registered students and track their purchases</p>
            </div>
            <button
              onClick={exportToCSV}
              disabled={filteredStudents.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <svg className="w-5 h-5 group-hover:translate-y-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>

          {/* Enhanced Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Students</p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">With Purchases</p>
              <p className="text-2xl font-black text-gray-900">{stats.withPurchases}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Purchases</p>
              <p className="text-2xl font-black text-gray-900">{stats.totalEnrollments}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg Purchases</p>
              <p className="text-2xl font-black text-gray-900">{stats.avgPurchases.toFixed(1)}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Revenue</p>
              <p className="text-2xl font-black text-gray-900">Rs. {Math.floor(stats.totalRevenue / 1000)}K</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Avg Revenue</p>
              <p className="text-2xl font-black text-gray-900">Rs. {Math.floor(stats.avgRevenue)}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="grid md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
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

              {/* Purchase Filter */}
              <div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Students</option>
                  <option value="has-purchases">With Purchases</option>
                  <option value="no-purchases">No Purchases</option>
                </select>
              </div>

              {/* Grade Filter */}
              <div>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Grades</option>
                  {uniqueGrades.map((grade) => (
                    <option key={grade} value={grade}>Grade {grade}</option>
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
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="purchases">Most Purchases</option>
                  <option value="revenue">Highest Revenue</option>
                </select>
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
                Showing <span className="font-bold text-gray-900">{filteredStudents.length}</span> of <span className="font-bold text-gray-900">{students.length}</span> students
              </p>
            </div>
          </div>
        </motion.div>

        {/* Students List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {students.length === 0 ? 'No Students Yet' : 'No Matching Students'}
            </h3>
            <p className="text-gray-600 mb-6">
              {students.length === 0 
                ? 'Students will appear here once they register' 
                : 'Try adjusting your filters or search query'}
            </p>
            {students.length > 0 && (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  variants={scaleIn}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all group"
                >
                  {/* Student Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div 
                          className="w-14 h-14 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 cursor-pointer hover:scale-110 transition"
                          onClick={() => toggleStudent(student.id)}
                        >
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-red-600 transition"
                            onClick={() => toggleStudent(student.id)}
                          >
                            {student.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="font-semibold">{student.phoneNumber}</span>
                            </span>
                            {student.email && (
                              <span className="flex items-center text-gray-600 min-w-0">
                                <svg className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="font-semibold truncate">{student.email}</span>
                              </span>
                            )}
                            <span className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-semibold whitespace-nowrap">
                                {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Stats */}
                        <div className="hidden sm:flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                          <div className="text-2xl font-black text-red-600">
                            {student.enrollments?.length || 0}
                          </div>
                          <div className="text-xs font-semibold text-gray-600">
                            Purchases
                          </div>
                        </div>

                        <div className="hidden md:flex flex-col items-center px-4 py-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                          <div className="text-xl font-black text-gray-900">
                            Rs. {Math.floor(getStudentRevenue(student) / 1000)}K
                          </div>
                          <div className="text-xs font-semibold text-gray-600">
                            Revenue
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={() => openDetailsModal(student)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 font-bold rounded-lg hover:bg-blue-200 border-2 border-blue-300 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden lg:inline">View</span>
                        </button>

                        <button
                          onClick={() => handleDelete(student)}
                          className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 border-2 border-red-300 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <button
                          onClick={() => toggleStudent(student.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <svg
                            className={`w-6 h-6 text-gray-400 transition-transform ${
                              expandedStudent === student.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enrollments (Expandable) */}
                  <AnimatePresence>
                    {expandedStudent === student.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t-2 border-gray-200 bg-gray-50 overflow-hidden"
                      >
                        <div className="p-6">
                          {student.enrollments && student.enrollments.length > 0 ? (
                            <>
                              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                                Purchased Lessons ({student.enrollments.length})
                              </h4>
                              <div className="grid md:grid-cols-2 gap-3">
                                {student.enrollments.map((enrollment) => (
                                  <div
                                    key={enrollment.id}
                                    className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-red-300 transition-all"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                          <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap">
                                            Grade {enrollment.lesson.subject.grade.number}
                                          </span>
                                          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full truncate">
                                            {enrollment.lesson.subject.name}
                                          </span>
                                        </div>
                                        <h5 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                                          {enrollment.lesson.title}
                                        </h5>
                                        <div className="flex items-center text-xs text-gray-500">
                                          <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <div className="text-lg font-black text-red-600">
                                          Rs. {enrollment.lesson.price.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Total Spent */}
                              <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Total Spent</span>
                                <span className="text-2xl font-black text-red-600">
                                  Rs. {getStudentRevenue(student).toLocaleString()}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <p className="text-gray-600 text-sm font-semibold">No lesson purchases yet</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Student Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h2>
                    <p className="text-sm text-gray-600">Student Details</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Phone Number</p>
                        <p className="text-sm font-bold text-gray-900">{selectedStudent.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Email Address</p>
                        <p className="text-sm font-bold text-gray-900">{selectedStudent.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Joined Date</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(selectedStudent.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Member Since</p>
                        <p className="text-sm font-bold text-gray-900">
                          {Math.floor((Date.now() - new Date(selectedStudent.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purchase Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                    <div className="text-3xl font-black text-red-600 mb-1">
                      {selectedStudent.enrollments?.length || 0}
                    </div>
                    <div className="text-xs font-semibold text-red-800 uppercase">Total Purchases</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="text-3xl font-black text-green-600 mb-1">
                      Rs. {Math.floor(getStudentRevenue(selectedStudent) / 1000)}K
                    </div>
                    <div className="text-xs font-semibold text-green-800 uppercase">Total Spent</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="text-3xl font-black text-blue-600 mb-1">
                      {selectedStudent.enrollments?.length ? 
                        `Rs. ${Math.floor(getStudentRevenue(selectedStudent) / selectedStudent.enrollments.length)}` : 
                        'Rs. 0'
                      }
                    </div>
                    <div className="text-xs font-semibold text-blue-800 uppercase">Avg per Purchase</div>
                  </div>
                </div>

                {/* Purchase History */}
                {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Purchase History</h3>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {selectedStudent.enrollments
                        .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                        .map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                                  Grade {enrollment.lesson.subject.grade.number}
                                </span>
                                <span className="px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                                  {enrollment.lesson.subject.name}
                                </span>
                              </div>
                              <h5 className="text-base font-bold text-gray-900 mb-2">
                                {enrollment.lesson.title}
                              </h5>
                              <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Purchased on {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black text-red-600">
                                Rs. {enrollment.lesson.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 font-semibold">LKR</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
                <button
                  onClick={closeDetailsModal}
                  className="px-6 py-2.5 bg-white text-gray-700 font-bold rounded-lg hover:bg-gray-100 border-2 border-gray-300 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeDetailsModal();
                    handleDelete(selectedStudent);
                  }}
                  className="px-6 py-2.5 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 border-2 border-red-300 transition-all"
                >
                  Delete Student
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}