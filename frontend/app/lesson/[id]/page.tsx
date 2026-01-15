'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { lessonService, Lesson, Video } from '@/lib/services/lessonService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { paymentService } from '@/lib/services/paymentService';
import { progressService } from '@/lib/services/progressService';
import Link from 'next/link';
import Image from 'next/image';
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
      staggerChildren: 0.05
    }
  }
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Constants
const MAX_VIDEO_VIEWS = 5;

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

  // Auth Protection
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, hasHydrated, router]);

  // Fetch Lesson Data
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [lessonData, videosData] = await Promise.all([
          lessonService.getById(lessonId),
          lessonService.getVideos(lessonId),
        ]);
        
        setLesson(lessonData);
        setVideos(videosData);

        // Check enrollment status
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
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId, hasHydrated, isAuthenticated]);

  // Handle Purchase
  const handleBuyLesson = async () => {
    if (!lesson) return;

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

  // Loading States
  if (!hasHydrated || !isAuthenticated) {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h2>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Border */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
      <Header currentPage="home" />

      {/* Hero Section */}
      <HeroSection lesson={lesson} videos={videos} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {!isPurchased ? (
          <LockedContent 
            lesson={lesson} 
            videos={videos} 
            onBuyLesson={handleBuyLesson}
            processingPayment={processingPayment}
          />
        ) : (
          <UnlockedContent lesson={lesson} videos={videos} videoProgress={videoProgress} />
        )}
      </main>

      <Footer />
    </div>
  );
}

// Hero Section Component
function HeroSection({ lesson, videos }: { lesson: Lesson; videos: Video[] }) {
  return (
    <section className="relative overflow-hidden text-white py-16 sm:py-20">
      {/* Background */}
      {lesson.thumbnailUrl ? (
        <div className="absolute inset-0">
          <Image
            src={lesson.thumbnailUrl}
            alt={lesson.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          {/* Back Button */}
          <Link 
            href={`/subject/${lesson.subjectId}`} 
            className="inline-flex items-center px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/40 text-white font-semibold rounded-xl transition-all mb-6 group shadow-xl"
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
            <span className="px-5 py-2.5 bg-red-600/40 backdrop-blur-xl border border-red-400/60 rounded-full text-sm font-bold shadow-xl">
              Grade {lesson.subject?.grade.number} • {lesson.subject?.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 drop-shadow-2xl">
            {lesson.title}
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-white/95 max-w-3xl mb-8 font-medium drop-shadow-lg">
            {lesson.description}
          </p>

          {/* Info Badges */}
          <div className="flex flex-wrap gap-4">
            <InfoBadge icon={VideoIcon} label={`${videos.length} Videos`} />
            <InfoBadge icon={ClockIcon} label={`${MAX_VIDEO_VIEWS} views per video`} />
            <InfoBadge 
              icon={CreditCardIcon} 
              label={`Rs. ${lesson.price.toLocaleString()}`}
              variant="price"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Info Badge Component
function InfoBadge({ 
  icon: Icon, 
  label, 
  variant = 'default' 
}: { 
  icon: React.FC<{ className?: string }>; 
  label: string;
  variant?: 'default' | 'price';
}) {
  const baseClasses = "flex items-center space-x-2 backdrop-blur-xl rounded-xl px-5 py-3 border shadow-xl";
  const variantClasses = variant === 'price' 
    ? "bg-red-600/40 border-red-400/60" 
    : "bg-white/20 border-white/40";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <Icon className="w-5 h-5" />
      <span className="font-bold text-white">{label}</span>
    </div>
  );
}

// Locked Content Component
function LockedContent({ 
  lesson, 
  videos, 
  onBuyLesson,
  processingPayment 
}: { 
  lesson: Lesson; 
  videos: Video[];
  onBuyLesson: () => void;
  processingPayment: boolean;
}) {
  return (
    <>
      {/* Purchase Notice */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-red-50 border-l-4 border-red-600 rounded-xl p-6 mb-10"
      >
        <div className="flex items-start">
          <LockIcon className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">🔒 Lesson Locked</h3>
            <p className="text-red-800 text-sm mb-4">
              Purchase this lesson to unlock all {videos.length} videos and start learning!
            </p>
            <button 
              onClick={onBuyLesson}
              disabled={processingPayment}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>
                  <LoadingSpinner className="h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Buy This Lesson - Rs. {lesson.price.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Locked Videos Preview */}
      <h2 className="text-2xl font-black text-gray-900 mb-6">
        Videos in This Lesson ({videos.length})
      </h2>
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
            className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <LockIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded">
                    Video {video.order}
                  </span>
                  <LockIcon className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">{video.title}</h3>
                <p className="text-sm text-gray-500">{video.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}

// Unlocked Content Component
function UnlockedContent({ 
  lesson, 
  videos, 
  videoProgress 
}: { 
  lesson: Lesson; 
  videos: Video[];
  videoProgress: Record<string, { viewCount: number }>;
}) {
  return (
    <>
      {/* Success Notice */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="bg-green-50 border-l-4 border-green-600 rounded-xl p-6 mb-10"
      >
        <div className="flex items-start">
          <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-1">✓ Lesson Purchased!</h3>
            <p className="text-green-800 text-sm">
              You have access to all {videos.length} videos. Click any video below to watch.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Available Videos */}
      <h2 className="text-2xl font-black text-gray-900 mb-6">
        Available Videos ({videos.length})
      </h2>
      <motion.div 
        className="grid gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {videos.map((video) => {
          const progress = videoProgress[video.id] || { viewCount: 0 };
          const viewsUsed = progress.viewCount;
          const viewsRemaining = Math.max(0, MAX_VIDEO_VIEWS - viewsUsed);
          const isViewable = viewsRemaining > 0;

          return (
            <motion.div key={video.id} variants={staggerItem}>
              <Link 
                href={`/video/${video.id}?lesson=${lesson.id}&v=${video.id}`} 
                className={`block bg-white rounded-xl shadow-md hover:shadow-xl border-2 p-6 transition-all group ${
                  isViewable 
                    ? 'border-gray-200 hover:border-green-500' 
                    : 'border-red-200 opacity-75'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                    isViewable ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isViewable ? (
                      <PlayIcon className="w-8 h-8 text-green-600" />
                    ) : (
                      <LockIcon className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        isViewable 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        Video {video.order}
                      </span>
                      <span className={`text-xs font-semibold ${
                        isViewable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {viewsUsed}/{MAX_VIDEO_VIEWS} views used
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold mb-1 transition-colors ${
                      isViewable 
                        ? 'text-gray-900 group-hover:text-green-600' 
                        : 'text-gray-600'
                    }`}>
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600">{video.description}</p>
                  </div>
                  {isViewable ? (
                    <ChevronRightIcon className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all flex-shrink-0" />
                  ) : (
                    <span className="text-xs font-semibold text-red-600 flex-shrink-0">Limit reached</span>
                  )}
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

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}