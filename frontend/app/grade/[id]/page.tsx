'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';

export default function GradePage() {
  const router = useRouter();
  const params = useParams();
  const gradeId = params.id as string;
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Mock subjects data - will come from API later
  const subjects = [
    { 
      id: 1, 
      name: 'Mathematics', 
      lessons: 24, 
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500'
    },
    { 
      id: 2, 
      name: 'Science', 
      lessons: 18, 
      color: 'from-green-500 to-emerald-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-500'
    },
    { 
      id: 3, 
      name: 'Sinhala', 
      lessons: 20, 
      color: 'from-red-500 to-pink-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-500'
    },
    { 
      id: 4, 
      name: 'English', 
      lessons: 22, 
      color: 'from-purple-500 to-indigo-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500'
    },
    { 
      id: 5, 
      name: 'History', 
      lessons: 15, 
      color: 'from-amber-500 to-orange-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-500'
    },
    { 
      id: 6, 
      name: 'Geography', 
      lessons: 16, 
      color: 'from-teal-500 to-cyan-500',
      lightColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-500'
    },
    { 
      id: 7, 
      name: 'Buddhism', 
      lessons: 12, 
      color: 'from-yellow-500 to-amber-500',
      lightColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500'
    },
    { 
      id: 8, 
      name: 'ICT', 
      lessons: 14, 
      color: 'from-violet-500 to-purple-500',
      lightColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-500'
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
            <Link href="/dashboard" className="flex items-center hover:opacity-80 transition">
              <Image
                src="/images/logo-light.png"
                alt="AIM Academy"
                width={130}
                height={52}
                className="object-contain sm:w-[150px]"
              />
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* Back Button */}
              <Link
                href="/dashboard"
                className="flex items-center px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden sm:block px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Grade Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white hover:scale-110 transition-transform">
              <span className="text-5xl sm:text-6xl font-black">{gradeId}</span>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-3">
                <span className="bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Grade {gradeId}
                </span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl">
                Select a subject to explore lessons and start learning
              </p>
              <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  {subjects.length} Subjects
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {subjects.reduce((sum, s) => sum + s.lessons, 0)} Total Lessons
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subject/${subject.id}`}
              className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 active:scale-95"
            >
              {/* Color Strip */}
              <div className={`h-2 bg-gradient-to-r ${subject.color}`}></div>

              <div className="p-6 sm:p-8">
                {/* Subject Icon/Initial */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 ${subject.lightColor} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`}>
                  <span className={`text-3xl sm:text-4xl font-black ${subject.textColor}`}>
                    {subject.name.charAt(0)}
                  </span>
                </div>

                {/* Subject Name */}
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${subject.textColor} group-hover:scale-105 transition-transform`}>
                  {subject.name}
                </h3>

                {/* Lesson Count */}
                <p className="text-gray-500 text-sm mb-6 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  {subject.lessons} Lessons Available
                </p>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                  <span className={`text-sm font-bold ${subject.textColor} group-hover:underline`}>
                    View Lessons
                  </span>
                  <div className={`w-10 h-10 ${subject.lightColor} group-hover:bg-gradient-to-r ${subject.color} rounded-full flex items-center justify-center transition-all shadow-md`}>
                    <svg className={`w-5 h-5 ${subject.textColor} group-hover:text-white transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Gradient Overlay on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`}></div>
            </Link>
          ))}
        </div>

        {/* Empty State if no subjects */}
        {subjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Available</h3>
            <p className="text-gray-600">Subjects will be added soon for this grade.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-16 sm:mt-24">
        <div className="h-1 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="text-center">
            <Image
              src="/images/logo-dark.png"
              alt="AIM Academy"
              width={130}
              height={52}
              className="object-contain mx-auto mb-4"
            />
            <p className="text-gray-400 text-sm">&copy; 2025 AIM Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}