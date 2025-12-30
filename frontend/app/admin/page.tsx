'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      title: 'Grades',
      icon: '📚',
      description: 'Manage grade levels',
      href: '/admin/grades',
      color: 'from-blue-500 to-cyan-500',
      count: stats?.totalGrades || 0,
    },
    {
      title: 'Subjects',
      icon: '📖',
      description: 'Manage subjects',
      href: '/admin/subjects',
      color: 'from-green-500 to-emerald-500',
      count: stats?.totalSubjects || 0,
    },
    {
      title: 'Lessons',
      icon: '🎓',
      description: 'Manage lessons',
      href: '/admin/lessons',
      color: 'from-purple-500 to-pink-500',
      count: stats?.totalLessons || 0,
    },
    {
      title: 'Videos',
      icon: '🎥',
      description: 'Manage video content',
      href: '/admin/videos',
      color: 'from-orange-500 to-red-500',
      count: stats?.totalVideos || 0,
    },
    {
      title: 'Students',
      icon: '👥',
      description: 'View students',
      href: '/admin/students',
      color: 'from-indigo-500 to-purple-500',
      count: stats?.totalStudents || 0,
    },
    {
      title: 'Enrollments',
      icon: '💰',
      description: 'View purchases',
      href: '/admin/enrollments',
      color: 'from-pink-500 to-rose-500',
      count: stats?.totalEnrollments || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Accent Border */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500"></div>

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
              />
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                ADMIN
              </span>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            <span className="bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your academy content and monitor student activity
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-12">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {item.count}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Management Cards */}
            <div className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                Content Management
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                    <div className="p-6">
                      <div className="text-5xl mb-4">{item.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {item.description}
                      </p>
                      <div className="flex items-center text-red-600 font-semibold text-sm group-hover:underline">
                        <span>Manage</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Enrollments */}
            {stats?.recentEnrollments && stats.recentEnrollments.length > 0 && (
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Recent Enrollments
                </h2>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Lesson
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.recentEnrollments.slice(0, 5).map((enrollment: any) => (
                          <tr key={enrollment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {enrollment.user.name || 'Student'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {enrollment.user.phoneNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {enrollment.lesson.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                Grade {enrollment.lesson.subject.grade.number} • {enrollment.lesson.subject.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <Link
                      href="/admin/enrollments"
                      className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      View all enrollments →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}