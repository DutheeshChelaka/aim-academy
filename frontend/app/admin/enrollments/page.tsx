'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import { motion, Variants } from 'framer-motion';

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
      name: string;
      grade: {
        number: number;
      };
    };
  };
}

export default function EnrollmentsManagement() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

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

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Filter and sort enrollments
  let filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user.phoneNumber.includes(searchTerm) ||
      enrollment.lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.lesson.subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || 
      enrollment.lesson.subject.grade.number.toString() === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

  // Sort
  if (sortBy === 'date') {
    filteredEnrollments.sort((a, b) => 
      new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
    );
  } else {
    filteredEnrollments.sort((a, b) => b.lesson.price - a.lesson.price);
  }

  // Calculate stats
  const totalRevenue = enrollments.reduce((sum, e) => sum + e.lesson.price, 0);
  const uniqueStudents = new Set(enrollments.map(e => e.user.id)).size;
  const uniqueGrades = [...new Set(enrollments.map(e => e.lesson.subject.grade.number))].sort((a, b) => a - b);

  // Group by date for recent activity
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayEnrollments = enrollments.filter(e => 
    new Date(e.enrolledAt).toDateString() === today.toDateString()
  ).length;

  const weekEnrollments = enrollments.filter(e => 
    new Date(e.enrolledAt) >= lastWeek
  ).length;

  const monthEnrollments = enrollments.filter(e => 
    new Date(e.enrolledAt) >= lastMonth
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
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
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2 text-gray-900">
              Enrollments Management
            </h1>
            <p className="text-gray-600">Track all lesson purchases and revenue</p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{enrollments.length}</div>
              <div className="text-sm font-semibold text-gray-600">Total Enrollments</div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300">
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                Rs. {totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-gray-600">Total Revenue</div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{uniqueStudents}</div>
              <div className="text-sm font-semibold text-gray-600">Unique Students</div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300">
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{monthEnrollments}</div>
              <div className="text-sm font-semibold text-gray-600">Last 30 Days</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6 mb-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Search */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Student name, phone, lesson, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none text-gray-900"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Grade</label>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none text-gray-900 font-semibold"
                >
                  <option value="all">All Grades</option>
                  {uniqueGrades.map(grade => (
                    <option key={grade} value={grade.toString()}>Grade {grade}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    sortBy === 'date'
                      ? 'bg-red-600 text-white border-2 border-red-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-300'
                  }`}
                >
                  Date (Newest First)
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    sortBy === 'price'
                      ? 'bg-red-600 text-white border-2 border-red-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-300'
                  }`}
                >
                  Price (High to Low)
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
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
              {searchTerm || filterGrade !== 'all' ? 'No Enrollments Found' : 'No Enrollments Yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterGrade !== 'all' ? 'Try adjusting your filters' : 'Enrollments will appear here when students purchase lessons'}
            </p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 font-bold text-sm text-gray-700 uppercase tracking-wide">
                <div className="col-span-3">Student</div>
                <div className="col-span-4">Lesson Details</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Date</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <motion.div
                  key={enrollment.id}
                  variants={scaleIn}
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap">
                          Grade {enrollment.lesson.subject.grade.number}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full truncate">
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
                      <div className="text-xs text-gray-500 font-semibold">LKR</div>
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
            </div>

            {/* Footer Summary */}
            <div className="bg-gray-50 border-t-2 border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-700">
                  Showing {filteredEnrollments.length} of {enrollments.length} enrollments
                </div>
                <div className="text-lg font-black text-red-600">
                  Total: Rs. {filteredEnrollments.reduce((sum, e) => sum + e.lesson.price, 0).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}