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

export default function StudentsManagement() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

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
      console.log('Students data received:', data);
      console.log('First student enrollments:', data[0]?.enrollments);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}? This will delete all their enrollment data!`)) {
      return;
    }

    try {
      await adminService.deleteStudent(student.id);
      toast.success('Student deleted successfully!');
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const toggleStudent = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phoneNumber.includes(searchTerm) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total revenue (safely)
  const totalRevenue = students.reduce((sum, student) => {
    if (!student.enrollments || !Array.isArray(student.enrollments)) return sum;
    return sum + student.enrollments.reduce((enrollSum, enrollment) => {
      return enrollSum + (enrollment?.lesson?.price || 0);
    }, 0);
  }, 0);

  // Calculate total enrollments (safely)
  const totalEnrollments = students.reduce((sum, student) => {
    return sum + (student.enrollments?.length || 0);
  }, 0);

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
              Students Management
            </h1>
            <p className="text-gray-600">View registered students and their lesson purchases</p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{students.length}</div>
              <div className="text-sm font-semibold text-gray-600">Total Students</div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-300">
                  <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{totalEnrollments}</div>
              <div className="text-sm font-semibold text-gray-600">Total Enrollments</div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                Rs. {totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm font-semibold text-gray-600">Total Revenue</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-4 pl-12 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition outline-none text-gray-900 font-semibold"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'No Students Found' : 'No Students Yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Students will appear here once they register'}
            </p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                variants={scaleIn}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all"
              >
                {/* Student Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1 cursor-pointer" onClick={() => toggleStudent(student.id)}>
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="font-semibold">{student.phoneNumber}</span>
                          </span>
                          {student.email && (
                            <span className="flex items-center text-gray-600">
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
                            <span className="font-semibold">
                              Joined {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right cursor-pointer" onClick={() => toggleStudent(student.id)}>
                        <div className="text-2xl font-black text-red-600">
                          {student.enrollments?.length || 0}
                        </div>
                        <div className="text-xs font-semibold text-gray-600">
                          Purchases
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(student)}
                        className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 border-2 border-red-300 transition-all"
                      >
                        Delete
                      </button>
                      <svg
                        className={`w-6 h-6 text-gray-400 transition-transform cursor-pointer ${
                          expandedStudent === student.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={() => toggleStudent(student.id)}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Enrollments (Expandable) */}
                {expandedStudent === student.id && (
                  <div className="border-t-2 border-gray-200 bg-gray-50 p-6">
                    {student.enrollments && student.enrollments.length > 0 ? (
                      <>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                          Purchased Lessons ({student.enrollments.length})
                        </h4>
                        <div className="space-y-3">
                          {student.enrollments.map((enrollment) => (
                            <div
                              key={enrollment.id}
                              className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-red-300 transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap">
                                      Grade {enrollment.lesson.subject.grade.number}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full truncate">
                                      {enrollment.lesson.subject.name}
                                    </span>
                                  </div>
                                  <h5 className="text-base font-bold text-gray-900 mb-1">
                                    {enrollment.lesson.title}
                                  </h5>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                  <div className="text-lg font-black text-red-600">
                                    Rs. {enrollment.lesson.price.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500 font-semibold">LKR</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total Spent */}
                        <div className="mt-4 pt-4 border-t-2 border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Total Spent</span>
                            <span className="text-2xl font-black text-red-600">
                              Rs. {student.enrollments.reduce((sum, e) => sum + (e?.lesson?.price || 0), 0).toLocaleString()}
                            </span>
                          </div>
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
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}