'use client';

import { useEffect, useState } from 'react';
import { lessonService, Lesson } from '@/lib/services/lessonService';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeaturedLessonsCarousel() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await lessonService.getAll();
        // Get only published lessons and limit to 10
        const featured = data.filter((l: Lesson) => l.isPublished).slice(0, 10);
        setLessons(featured);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // ✨ AUTO-PLAY SLIDESHOW
  useEffect(() => {
    if (lessons.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % lessons.length);
      setDirection(1); // Always move forward on auto-play
    }, 2000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [lessons.length]);

  // 🛑 PAUSE AUTO-PLAY ON USER INTERACTION
  const handleUserInteraction = () => {
    setCurrentIndex((prev) => (prev + 1) % lessons.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    handleUserInteraction();
  };

  const handleNext = () => {
    setDirection(1);
    handleUserInteraction();
  };
  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % lessons.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + lessons.length) % lessons.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading featured lessons...</p>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
        <p className="text-gray-600 font-semibold">No lessons available yet</p>
      </div>
    );
  }

  const currentLesson = lessons[currentIndex];

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100">
      {/* Gradient overlay top */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-20"></div>

      <div className="grid lg:grid-cols-2 gap-8 p-8 sm:p-12">
        
        {/* LEFT: CAROUSEL SLIDE */}
        <div className="relative h-96 sm:h-full min-h-96 rounded-2xl overflow-hidden bg-gray-100 group">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              {currentLesson.thumbnailUrl ? (
                <>
                  <Image
                    src={currentLesson.thumbnailUrl}
                    alt={currentLesson.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <p className="font-bold text-sm">{currentLesson.title}</p>
                  </div>
                </div>
              )}

              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full shadow-lg">
                  Featured
                </span>
              </div>

              {/* Video count */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 w-fit">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span className="text-white text-sm font-bold">{currentLesson._count.videos} Videos</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all group/btn"
          >
            <svg className="w-6 h-6 text-gray-900 group-hover/btn:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all group/btn"
          >
            <svg className="w-6 h-6 text-gray-900 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* RIGHT: CONTENT */}
        <div className="flex flex-col justify-between py-4">
          <div className="space-y-6">
            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                  {currentLesson.title}
                </h3>

                <p className="text-lg text-gray-600 leading-relaxed">
                  {currentLesson.description || 'Comprehensive video lessons covering all essential topics with expert instruction.'}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{currentLesson._count.videos}</p>
                      <p className="text-xs text-gray-500 font-semibold">Videos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{currentLesson._count.videos * 20}+</p>
                      <p className="text-xs text-gray-500 font-semibold">Minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">Rs {currentLesson.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 font-semibold">One-time</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="pt-8">
            <Link
              href={`/lesson/${currentLesson.id}`}
              className="block w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-center group"
            >
              <span className="flex items-center justify-center gap-2">
                View Full Lesson
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* BOTTOM: DOTS INDICATOR */}
      <div className="flex items-center justify-center gap-3 pb-8 px-8">
        {lessons.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-8 bg-red-600' 
                : 'w-3 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to lesson ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}