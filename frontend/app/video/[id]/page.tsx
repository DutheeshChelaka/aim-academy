'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { lessonService, Lesson } from '@/lib/services/lessonService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import api from '@/lib/api';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  lessonId: string;
}

export default function VideoWatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v');
  const lessonId = searchParams.get('lesson');
  
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, hasHydrated, router]);

  // ✅ Fetch Data
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !videoId || !lessonId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch lesson and all its videos
        const [lessonData, videosData] = await Promise.all([
          lessonService.getById(lessonId),
          lessonService.getVideos(lessonId),
        ]);
        
        setLesson(lessonData);
        setVideos(videosData);

        // Find current video
        const video = videosData.find((v: Video) => v.id === videoId);
        if (!video) {
          toast.error('Video not found');
          router.push(`/lesson/${lessonId}`);
          return;
        }
        setCurrentVideo(video);

        // Check if purchased
        try {
          const enrollmentResult = await enrollmentService.checkEnrollment(lessonId);
          setIsPurchased(enrollmentResult.isEnrolled);

          if (enrollmentResult.isEnrolled) {
            // TODO: Get view count from backend when progress API is ready
            // For now, simulate unlimited views (change to 0 to test lock)
            setViewCount(0); // 0 = can watch, 2 = locked
          }
        } catch {
          setIsPurchased(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId, lessonId, hasHydrated, isAuthenticated, router]);

  // ✅ Track Video View
  const trackView = async () => {
    if (!currentVideo || !isPurchased) return;

    // TODO: Track view in backend when progress API is ready
    console.log('Video view tracked (simulated):', videoId);
    // setViewCount((prev) => prev + 1); // Uncomment when backend is ready
  };

  // ✅ Auto-track view when video loads
  useEffect(() => {
    if (currentVideo && isPurchased && viewCount < 2) {
      const timer = setTimeout(() => {
        trackView();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentVideo, isPurchased]);

  if (!hasHydrated || !isAuthenticated) return <PageLoader />;

  if (!videoId || !lessonId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Video Link</h2>
          <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!currentVideo || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h2>
          <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canWatch = isPurchased && viewCount < 2;
  const viewsRemaining = Math.max(0, 2 - viewCount);

  // Find previous and next videos
  const currentIndex = videos.findIndex(v => v.id === videoId);
  const previousVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      <Header currentPage="home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            
            {/* Back Button */}
            <Link
              href={`/lesson/${lessonId}`}
              className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 font-semibold rounded-lg transition-all mb-6 group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lesson
            </Link>

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
              ) : !isPurchased ? (
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">🔒 Lesson Not Purchased</h3>
                    <p className="text-gray-300 mb-4">Purchase the lesson to watch this video.</p>
                    <Link
                      href={`/payment/${lessonId}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Purchase Lesson Now
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">⚠️ View Limit Reached</h3>
                    <p className="text-gray-300 mb-4">You have used all 2 views for this video.</p>
                    <p className="text-sm text-gray-400">Contact support if you need additional access.</p>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                    Video {currentVideo.order}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    {lesson.subject?.name}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {currentVideo.title}
                </h1>
                <p className="text-gray-600 mb-4">{currentVideo.description}</p>

                <div className="flex flex-wrap gap-4 items-center pb-4 border-b border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{formatDuration(currentVideo.duration)}</span>
                  </div>

                  {isPurchased && (
                    <div className={`flex items-center text-sm font-bold ${viewsRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>{viewsRemaining}/2 views remaining</span>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-4">
                  {previousVideo ? (
                    <Link
                      href={`/video/${previousVideo.id}?lesson=${lessonId}&v=${previousVideo.id}`}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Link>
                  ) : (
                    <div className="flex-1"></div>
                  )}

                  {nextVideo ? (
                    <Link
                      href={`/video/${nextVideo.id}?lesson=${lessonId}&v=${nextVideo.id}`}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Next
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Info Card */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
              <p className="text-white/90 text-sm">
                {lesson.description || `Part of the ${lesson.subject?.name} course`}
              </p>
            </div>
          </div>

          {/* Video Playlist */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Lesson Videos ({videos.length})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {videos.map((v) => (
                  <Link
                    key={v.id}
                    href={`/video/${v.id}?lesson=${lessonId}&v=${v.id}`}
                    className={`block w-full text-left p-4 rounded-xl transition-all ${
                      v.id === videoId
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        v.id === videoId ? 'bg-white/20' : 'bg-red-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          v.id === videoId ? 'text-white' : 'text-red-600'
                        }`}>
                          {v.order}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold mb-1 line-clamp-2 ${
                          v.id === videoId ? 'text-white' : 'text-gray-900'
                        }`}>
                          {v.title}
                        </h4>

                        <span className={`text-xs ${
                          v.id === videoId ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {formatDuration(v.duration)}
                        </span>
                      </div>

                      {v.id === videoId && (
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {isPurchased && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Current Video</span>
                    <span className={`font-bold ${viewsRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {viewsRemaining}/2 views left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all"
                      style={{ width: `${((2 - viewsRemaining) / 2) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}