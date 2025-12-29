'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Image from 'next/image';
import Link from 'next/link';

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { user, isAuthenticated, logout } = useAuthStore();
  const [selectedVideo, setSelectedVideo] = useState<number>(1);

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

  // Mock lesson data
  const lesson = {
    id: lessonId,
    title: 'Operations with Fractions',
    subject: 'Mathematics',
    grade: 6,
    subjectId: 1,
    teacher: 'Mr. Samantha Perera',
    description: 'Master adding, subtracting, multiplying, and dividing fractions through comprehensive video tutorials.',
    isPurchased: true,
  };

  // Mock videos data - Multiple videos per lesson
  const videos = [
    {
      id: 1,
      title: 'Introduction to Fraction Operations',
      description: 'Overview of all operations we will cover and why they are important',
      duration: '12:45',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 0,
      maxViews: 2,
      order: 1,
    },
    {
      id: 2,
      title: 'Adding Fractions with Same Denominators',
      description: 'Learn the simple technique of adding fractions when denominators match',
      duration: '18:30',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 1,
      maxViews: 2,
      order: 2,
    },
    {
      id: 3,
      title: 'Adding Fractions with Different Denominators',
      description: 'Master the technique of finding common denominators before adding',
      duration: '25:15',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 0,
      maxViews: 2,
      order: 3,
    },
    {
      id: 4,
      title: 'Subtracting Fractions',
      description: 'Apply addition concepts to subtraction of fractions',
      duration: '22:40',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 0,
      maxViews: 2,
      order: 4,
    },
    {
      id: 5,
      title: 'Multiplying Fractions',
      description: 'Learn the straightforward method of multiplying numerators and denominators',
      duration: '20:10',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 2,
      maxViews: 2,
      order: 5,
    },
    {
      id: 6,
      title: 'Dividing Fractions',
      description: 'Master the flip and multiply technique for dividing fractions',
      duration: '23:55',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 0,
      maxViews: 2,
      order: 6,
    },
    {
      id: 7,
      title: 'Mixed Operations Practice',
      description: 'Combine all operations in complex problems',
      duration: '28:30',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 0,
      maxViews: 2,
      order: 7,
    },
    {
      id: 8,
      title: 'Real World Word Problems',
      description: 'Apply fraction operations to solve everyday problems',
      duration: '30:20',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      views: 0,
      maxViews: 2,
      order: 8,
    },
  ];

  const currentVideo = videos.find(v => v.id === selectedVideo) || videos[0];
  const canWatch = currentVideo.views < currentVideo.maxViews;

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
                href={`/subject/${lesson.subjectId}`}
                className="flex items-center px-3 sm:px-4 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Lessons</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Video Player Section - Left/Main */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              {canWatch ? (
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={currentVideo.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">View Limit Reached</h3>
                    <p className="text-gray-300 mb-4">You have used all {currentVideo.maxViews} views for this video.</p>
                    <p className="text-sm text-gray-400">Contact support if you need additional access.</p>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {currentVideo.title}
                    </h1>
                    <p className="text-gray-600">
                      {currentVideo.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{currentVideo.duration}</span>
                  </div>

                  <div className={`flex items-center text-sm font-bold ${currentVideo.views >= currentVideo.maxViews ? 'text-red-600' : 'text-green-600'}`}>
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{currentVideo.views}/{currentVideo.maxViews} views used</span>
                  </div>

                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                    Video {currentVideo.order} of {videos.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson Info Card */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
                  Grade {lesson.grade} • {lesson.subject}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">{lesson.title}</h2>
              <p className="text-white/90 mb-4">{lesson.description}</p>
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span className="font-semibold">Taught by {lesson.teacher}</span>
              </div>
            </div>
          </div>

          {/* Video Playlist - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Course Videos ({videos.length})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedVideo === video.id
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedVideo === video.id ? 'bg-white/20' : 'bg-blue-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          selectedVideo === video.id ? 'text-white' : 'text-blue-600'
                        }`}>
                          {video.order}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold mb-1 line-clamp-2 ${
                          selectedVideo === video.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </h4>

                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${
                            selectedVideo === video.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {video.duration}
                          </span>

                          <span className={`text-xs font-semibold ${
                            video.views >= video.maxViews
                              ? selectedVideo === video.id ? 'text-white/80' : 'text-red-600'
                              : selectedVideo === video.id ? 'text-white/80' : 'text-green-600'
                          }`}>
                            {video.views}/{video.maxViews} views
                          </span>
                        </div>
                      </div>

                      {selectedVideo === video.id && (
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Your Progress</span>
                  <span className="font-bold text-blue-600">
                    {videos.filter(v => v.views > 0).length}/{videos.length} started
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all"
                    style={{ width: `${(videos.filter(v => v.views > 0).length / videos.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}