'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';

export default function SubjectPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
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

  // Mock subject data - will come from API later
  const subject = {
    id: subjectId,
    name: 'Mathematics',
    grade: 6,
    description: 'Master mathematical concepts with comprehensive video lessons covering all topics in the Grade 6 syllabus.',
    color: 'from-blue-500 to-cyan-500',
    teacher: 'Mr. Samantha Perera',
  };

  // Mock lessons data - LESSONS that students can BUY
  const lessons = [
    {
      id: 1,
      title: 'Introduction to Fractions',
      description: 'Master the basics of fractions with step-by-step video tutorials',
      videoCount: 5,
      totalDuration: '2h 15m',
      price: 500,
      isPurchased: false,
      thumbnail: '/images/lesson-thumb.jpg',
      topics: ['Understanding Fractions', 'Numerators & Denominators', 'Equivalent Fractions', 'Simplifying Fractions', 'Practice Problems'],
    },
    {
      id: 2,
      title: 'Operations with Fractions',
      description: 'Learn to add, subtract, multiply, and divide fractions with confidence',
      videoCount: 8,
      totalDuration: '3h 40m',
      price: 750,
      isPurchased: true,
      thumbnail: '/images/lesson-thumb.jpg',
      topics: ['Adding Fractions', 'Subtracting Fractions', 'Multiplying Fractions', 'Dividing Fractions', 'Mixed Operations', 'Word Problems', 'Advanced Techniques', 'Final Assessment'],
    },
    {
      id: 3,
      title: 'Decimal Numbers',
      description: 'Complete guide to decimal numbers and their applications',
      videoCount: 6,
      totalDuration: '2h 50m',
      price: 600,
      isPurchased: false,
      thumbnail: '/images/lesson-thumb.jpg',
      topics: ['Introduction to Decimals', 'Place Values', 'Converting Decimals', 'Operations with Decimals', 'Rounding Decimals', 'Real-world Applications'],
    },
    {
      id: 4,
      title: 'Percentages',
      description: 'Understanding percentages and their practical uses in everyday life',
      videoCount: 7,
      totalDuration: '3h 10m',
      price: 650,
      isPurchased: false,
      thumbnail: '/images/lesson-thumb.jpg',
      topics: ['What are Percentages?', 'Converting to Percentages', 'Percentage Calculations', 'Discounts & Sales', 'Interest Rates', 'Statistical Uses', 'Practice Problems'],
    },
    {
      id: 5,
      title: 'Algebra Basics',
      description: 'Introduction to algebraic thinking and basic equations',
      videoCount: 9,
      totalDuration: '4h 20m',
      price: 800,
      isPurchased: false,
      thumbnail: '/images/lesson-thumb.jpg',
      topics: ['Variables & Constants', 'Simple Equations', 'Solving for X', 'Linear Equations', 'Word Problems', 'Graphs', 'Functions', 'Advanced Equations', 'Practice & Review'],
    },
    {
      id: 6,
      title: 'Geometry Fundamentals',
      description: 'Explore shapes, angles, and geometric properties',
      videoCount: 10,
      totalDuration: '4h 45m',
      price: 850,
      isPurchased: false,
      thumbnail: '/images/lesson-thumb.jpg',
      topics: ['Points & Lines', 'Angles', 'Triangles', 'Quadrilaterals', 'Circles', 'Area Calculations', 'Perimeter', 'Volume', '3D Shapes', 'Geometric Proofs'],
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
                href={`/grade/${subject.grade}`}
                className="flex items-center px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Grade {subject.grade}</span>
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
        {/* Subject Header */}
        <div className={`bg-gradient-to-r ${subject.color} rounded-3xl shadow-2xl p-8 sm:p-12 mb-10 text-white overflow-hidden relative`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                Grade {subject.grade}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
              {subject.name}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mb-6">
              {subject.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span className="font-bold">Taught by {subject.teacher}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <span className="font-bold">{lessons.length} Lessons Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-6 mb-10">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">How it works</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Purchase any lesson to access all videos inside that lesson</li>
                <li>• Each video can be watched 2 times</li>
                <li>• Secure payment via PayHere</li>
                <li>• Instant access after payment confirmation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Available Lessons
            </h2>
            <span className="text-sm text-gray-500 font-semibold">
              {lessons.filter(l => l.isPurchased).length} of {lessons.length} purchased
            </span>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300"
              >
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Thumbnail */}
                  <div className="relative h-48 md:h-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg mx-auto mb-3">
                          <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{lesson.videoCount} Videos</span>
                      </div>
                    </div>

                    {lesson.isPurchased && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Purchased
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="md:col-span-2 p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                          Lesson {lesson.id}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-blue-600">
                          Rs. {lesson.price}
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">LKR</div>
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                      {lesson.title}
                    </h3>

                    <p className="text-gray-600 mb-4">
                      {lesson.description}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mb-5">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <span className="font-semibold">{lesson.videoCount} Videos</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{lesson.totalDuration}</span>
                      </div>
                    </div>

                    {/* Topics Preview */}
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-2">Topics Covered:</p>
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.slice(0, 4).map((topic, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                            {topic}
                          </span>
                        ))}
                        {lesson.topics.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                            +{lesson.topics.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {lesson.isPurchased ? (
                      <Link
                        href={`/lesson/${lesson.id}`}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Watch Videos
                      </Link>
                    ) : (
                      <Link
  href={`/payment/${lesson.id}`}
  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
>
  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
  </svg>
  Buy Now - Rs. {lesson.price}
</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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