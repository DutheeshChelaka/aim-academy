'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { lessonService, Lesson, Video } from '@/lib/services/lessonService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { paymentService } from '@/lib/services/paymentService';
import { progressService } from '@/lib/services/progressService';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { motion, Variants } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  const { isAuthenticated, hasHydrated } = useAuthStore();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [videoProgress, setVideoProgress] = useState<Record<string, { viewCount: number }>>({});

  // ✅ REMOVED AUTH PROTECTION - Allow guest browsing
  useEffect(() => {
    if (!hasHydrated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [lessonData, videosData] = await Promise.all([
          lessonService.getById(lessonId),
          lessonService.getVideos(lessonId),
        ]);
        
        setLesson(lessonData);
        setVideos(videosData);

        // ✅ Only check enrollment if user is logged in
        if (isAuthenticated) {
          try {
            const result = await enrollmentService.checkEnrollment(lessonId);
            setIsPurchased(result.isEnrolled);

            // If purchased, fetch progress for all videos
            if (result.isEnrolled && videosData.length > 0) {
              const progressPromises = videosData.map(async (video: Video) => {
                try {
                  const progress = await progressService.getVideoProgress(video.id);
                  return { videoId: video.id, viewCount: progress.viewCount };
                } catch (error) {
                  return { videoId: video.id, viewCount: 0 };
                }
              });

              const progressResults = await Promise.all(progressPromises);
              const progressMap: Record<string, { viewCount: number }> = {};
              
              progressResults.forEach(result => {
                progressMap[result.videoId] = { viewCount: result.viewCount };
              });
              
              setVideoProgress(progressMap);
            }
          } catch (error) {
            setIsPurchased(false);
          }
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, hasHydrated, isAuthenticated]);

  // ✅ Handle Purchase - Different for guests vs logged-in users
  const handleBuyLesson = async () => {
    if (!lesson) return;

    // ✅ If guest, redirect to login with return URL
    if (!isAuthenticated) {
      router.push(`/login?redirect=/payment/${lesson.id}`);
      return;
    }

    // ✅ If logged in, proceed to payment
    setProcessingPayment(true);
    try {
      const { sessionUrl } = await paymentService.createCheckoutSession(lesson.id);
      window.location.href = sessionUrl;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  // ✅ Only show loader while hydrating
  if (!hasHydrated) {
    return <PageLoader />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);
  const totalMinutes = Math.floor(totalDuration / 60);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Border */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
      <Header currentPage="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-12 sm:py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            {/* Back Button */}
            <Link 
              href={`/subject/${lesson.subjectId}`} 
              className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/20 text-white font-semibold rounded-xl transition-all mb-6 group shadow-xl"
            >
              <svg 
                className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Subject
            </Link>

            {/* Subject Badge */}
            <div className="flex items-center mb-5">
              <span className="px-4 py-2 bg-red-600/90 backdrop-blur-xl border-2 border-red-400/60 rounded-full text-sm font-bold shadow-xl">
                Grade {lesson.subject?.grade.number} • {lesson.subject?.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 drop-shadow-2xl leading-tight">
              {lesson.title}
            </h1>

            {/* Description */}
            {lesson.description && (
              <p className="text-base sm:text-lg text-white/90 max-w-3xl mb-8 font-medium drop-shadow-lg leading-relaxed">
                {lesson.description}
              </p>
            )}

            {/* Info Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2.5 border-2 border-white/20 shadow-xl">
                <VideoIcon className="w-5 h-5" />
                <span className="font-bold text-white text-sm">{videos.length} Videos</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2.5 border-2 border-white/20 shadow-xl">
                <ClockIcon className="w-5 h-5" />
                <span className="font-bold text-white text-sm">{totalMinutes} minutes total</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2.5 border-2 border-white/20 shadow-xl">
                <InfinityIcon className="w-5 h-5" />
                <span className="font-bold text-white text-sm">Unlimited Views</span>
              </div>
              <div className="flex items-center space-x-2 bg-red-600/90 backdrop-blur-xl rounded-xl px-4 py-2.5 border-2 border-red-400/60 shadow-xl">
                <CreditCardIcon className="w-5 h-5" />
                <span className="font-bold text-white text-sm">Rs. {lesson.price.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!isPurchased ? (
          <LockedContent 
            lesson={lesson} 
            videos={videos} 
            onBuyLesson={handleBuyLesson}
            processingPayment={processingPayment}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <UnlockedContent lesson={lesson} videos={videos} videoProgress={videoProgress} />
        )}
      </main>

      <Footer />
    </div>
  );
}

// ✅ Locked Content Component (Updated for guests)
function LockedContent({ 
  lesson, 
  videos, 
  onBuyLesson,
  processingPayment,
  isAuthenticated
}: { 
  lesson: Lesson; 
  videos: Video[];
  onBuyLesson: () => void;
  processingPayment: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <>
      {/* Purchase Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 sm:p-8 mb-10 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
            <LockIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-red-900 mb-2">🔒 Lesson Locked</h3>
            <p className="text-red-800 text-sm sm:text-base mb-4 leading-relaxed">
              {isAuthenticated ? (
                <>
                  Purchase this lesson to unlock all <span className="font-bold">{videos.length} videos</span> with <span className="font-bold">unlimited lifetime access</span>!
                </>
              ) : (
                <>
                  <span className="font-bold">Login or Sign up</span> to purchase this lesson and unlock all <span className="font-bold">{videos.length} videos</span> with <span className="font-bold">unlimited lifetime access</span>!
                </>
              )}
            </p>
            <button 
              onClick={onBuyLesson}
              disabled={processingPayment}
              className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>
                  <LoadingSpinner className="h-5 w-5 mr-2" />
                  Processing Payment...
                </>
              ) : isAuthenticated ? (
                <>
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Buy This Lesson - Rs. {lesson.price.toLocaleString()}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login to Purchase - Rs. {lesson.price.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Locked Videos Preview - ✅ VISIBLE TO EVERYONE */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          Videos in This Lesson
        </h2>
        <span className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-full text-sm">
          {videos.length} Videos
        </span>
      </div>

      <motion.div 
        className="grid gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {videos.map((video) => (
          <motion.div 
            key={video.id}
            variants={staggerItem}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg border-2 border-gray-200 p-5 sm:p-6 transition-all group relative overflow-hidden"
          >
            {/* Locked Overlay */}
            <div className="absolute top-4 right-4 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <LockIcon className="w-6 h-6 text-red-600" />
            </div>

            <div className="flex items-start gap-4 pr-16">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-black text-gray-600">#{video.order}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                    Video {video.order}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                    Locked
                  </span>
                </div>
                {/* ✅ SHOW VIDEO TITLE TO EVERYONE */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2 line-clamp-2">{video.title}</h3>
                {/* ✅ SHOW VIDEO DESCRIPTION TO EVERYONE */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{Math.floor(video.duration / 60)} min</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// Unlocked Content Component (No changes needed)
function UnlockedContent({ 
  lesson, 
  videos, 
  videoProgress 
}: { 
  lesson: Lesson; 
  videos: Video[];
  videoProgress: Record<string, { viewCount: number }>;
}) {
  const totalVideos = videos.length;
  const watchedCount = Object.keys(videoProgress).filter(
    videoId => videoProgress[videoId]?.viewCount > 0
  ).length;

  return (
    <>
      {/* Success Notice */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 sm:p-8 mb-10 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black text-green-900 mb-2">✓ Lesson Purchased!</h3>
            <p className="text-green-800 text-sm sm:text-base leading-relaxed">
              You have <span className="font-bold">unlimited lifetime access</span> to all <span className="font-bold">{totalVideos} videos</span>. Watch as many times as you want!
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-md">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Videos</p>
          <p className="text-2xl font-black text-gray-900">{totalVideos}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md">
          <p className="text-xs font-semibold text-blue-500 uppercase mb-1">Videos Watched</p>
          <p className="text-2xl font-black text-blue-600">{watchedCount}</p>
        </div>
      </div>

      {/* Available Videos */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
          Your Videos
        </h2>
        <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm flex items-center gap-2">
          <InfinityIcon className="w-4 h-4" />
          {totalVideos} Unlocked
        </span>
      </div>

      <motion.div 
        className="grid gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {videos.map((video) => {
          const progress = videoProgress[video.id];
          const viewsUsed = progress?.viewCount ?? 0;

          return (
            <motion.div key={video.id} variants={staggerItem}>
              <Link 
                href={`/video/${video.id}?lesson=${lesson.id}&v=${video.id}`}
                className="block bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-green-500 p-5 sm:p-6 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 group-hover:scale-110 transition-transform">
                    <PlayIcon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                        Video {video.order}
                      </span>
                      {viewsUsed > 0 && (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600">
                          Watched {viewsUsed} {viewsUsed === 1 ? 'time' : 'times'}
                        </span>
                      )}
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                        <InfinityIcon className="w-3 h-3" />
                        Unlimited
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{Math.floor(video.duration / 60)} min</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRightIcon className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all flex-shrink-0 hidden sm:block" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

// Icon Components
function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function InfinityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}