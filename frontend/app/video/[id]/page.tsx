'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { lessonService, Lesson } from '@/lib/services/lessonService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { progressService } from '@/lib/services/progressService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import YouTubePlayer, { YouTubePlayerHandle } from '@/app/components/YouTubePlayer';
import VideoChatbot from '@/app/components/VideoChatbot';
import { motion } from 'framer-motion';
interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  lessonId: string;
}

// Separate component that uses useSearchParams
function VideoWatchContent() {
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
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Controls the YouTube player so the chatbot can jump to a timestamp
  const playerRef = useRef<YouTubePlayerHandle>(null);

  // Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, hasHydrated, router]);

  // Fetch Data
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !videoId || !lessonId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [lessonData, videosData] = await Promise.all([
          lessonService.getById(lessonId),
          lessonService.getVideos(lessonId),
        ]);

        setLesson(lessonData);
        setVideos(videosData);

        const video = videosData.find((v: Video) => v.id === videoId);
        if (!video) {
          toast.error('Video not found');
          router.push(`/lesson/${lessonId}`);
          return;
        }
        setCurrentVideo(video);

        try {
          const enrollmentResult = await enrollmentService.checkEnrollment(lessonId);
          setIsPurchased(enrollmentResult.isEnrolled);

          if (enrollmentResult.isEnrolled) {
            try {
              const progressData = await progressService.getVideoProgress(videoId);
              setViewCount(progressData.viewCount || 0);
            } catch (error: any) {
              console.error('Failed to load progress:', error);
              setViewCount(0);
            }
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
    setHasTrackedView(false);
  }, [videoId, lessonId, hasHydrated, isAuthenticated, router]);

  // Track Video View
  const trackView = async () => {
    if (!currentVideo || !isPurchased || !videoId || hasTrackedView) return;

    try {
      const result = await progressService.trackVideoView(videoId);
      setViewCount(result.viewCount);
      setHasTrackedView(true);

      toast.success(`✓ View tracked! Watched ${result.viewCount} time${result.viewCount > 1 ? 's' : ''}.`, {
        duration: 3000,
        icon: '👁️',
      });
    } catch (error: any) {
      console.error('Failed to track view:', error);
    }
  };

  // Auto-track view after 5 seconds
  useEffect(() => {
    if (currentVideo && isPurchased && !hasTrackedView) {
      const timer = setTimeout(() => {
        trackView();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentVideo, isPurchased, hasTrackedView]);

  if (!hasHydrated || !isAuthenticated) return <PageLoader />;

  if (!videoId || !lessonId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Video Link</h2>
          <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
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
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h2>
          <Link href="/dashboard" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = videos.findIndex(v => v.id === videoId);
  const previousVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      <Header currentPage="home" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Back Button */}
            <Link
              href={`/lesson/${lessonId}`}
              className="inline-flex items-center px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-red-500 text-gray-700 hover:text-red-600 font-semibold rounded-xl transition-all group shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lesson
            </Link>

            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200"
            >
              {isPurchased ? (
                <div className="relative aspect-video bg-black">
                  <YouTubePlayer ref={playerRef} videoUrl={currentVideo.videoUrl} />
                </div>
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">🔒 Lesson Not Purchased</h3>
                    <p className="text-white/80 mb-6 max-w-md mx-auto">Purchase the lesson to unlock unlimited access to this video and all course content.</p>
                    <Link
                      href={`/payment/${lessonId}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Purchase Lesson Now
                    </Link>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                    Video {currentVideo.order}
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    {lesson.subject?.name}
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                    Grade {lesson.subject?.grade.number}
                  </span>
                  {isPurchased && viewCount > 0 && (
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Watched {viewCount} {viewCount === 1 ? 'time' : 'times'}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
                  {currentVideo.title}
                </h1>
                <p className="text-gray-600 mb-4 leading-relaxed">{currentVideo.description}</p>

                <div className="flex flex-wrap gap-4 items-center pb-5 border-b-2 border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-1.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">{formatDuration(currentVideo.duration)}</span>
                  </div>

                  {isPurchased && (
                    <div className="flex items-center text-sm font-bold text-green-600">
                      <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Unlimited Access</span>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-5">
                  {previousVideo ? (
                    <Link
                      href={`/video/${previousVideo.id}?lesson=${lessonId}&v=${previousVideo.id}`}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
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
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
            </motion.div>

            {/* AI Chatbot — only for purchased videos */}
            {isPurchased && (
              <VideoChatbot
                videoId={currentVideo.id}
                onSeek={(seconds) => playerRef.current?.seekTo(seconds)}
              />
            )}

            {/* Lesson Info Card */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white border-2 border-red-500">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-black mb-2">{lesson.title}</h2>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {lesson.description || `Complete ${lesson.subject?.name} course for Grade ${lesson.subject?.grade.number} with unlimited lifetime access`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Playlist */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
                <svg className="w-6 h-6 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Playlist ({videos.length})
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {videos.map((v) => (
                  <Link
                    key={v.id}
                    href={`/video/${v.id}?lesson=${lessonId}&v=${v.id}`}
                    className={`block w-full text-left p-4 rounded-xl transition-all group ${
                      v.id === videoId
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
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

                        <div className="flex items-center gap-2">
                          <svg className={`w-3.5 h-3.5 ${v.id === videoId ? 'text-white/70' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className={`text-xs font-medium ${
                            v.id === videoId ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {formatDuration(v.duration)}
                          </span>
                        </div>
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
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Unlimited Lifetime Access</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
}

// Main component with Suspense boundary
export default function VideoWatchPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VideoWatchContent />
    </Suspense>
  );
}