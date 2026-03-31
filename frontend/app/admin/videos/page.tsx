'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import { motion, Variants, AnimatePresence } from 'framer-motion';

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

interface Lesson {
  id: string;
  title: string;
  subject: {
    id: string;
    name: string;
    grade: {
      id: string;
      number: number;
    };
  };
}

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  lessonId: string;
  lesson: Lesson;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'order' | 'title' | 'duration' | 'newest';

export default function VideosManagement() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  
  // Data states
  const [videos, setVideos] = useState<Video[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('order');
  
  // Form state
  const [formData, setFormData] = useState({
    lessonId: '',
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    order: '',
  });

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

    const fetchData = async () => {
      setLoading(true);
      try {
        const [videosData, lessonsData] = await Promise.all([
          adminService.getAllVideos(),
          adminService.getAllLessons(),
        ]);
        setVideos(videosData);
        setLessons(lessonsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasHydrated, isAuthenticated, user]);

  // ✅ Get unique grades and subjects for filters
  const uniqueGrades = useMemo(() => {
    const grades = lessons.map(l => ({ 
      id: l.subject.grade.id, 
      number: l.subject.grade.number 
    }));
    const unique = Array.from(new Map(grades.map(g => [g.id, g])).values());
    return unique.sort((a, b) => a.number - b.number);
  }, [lessons]);

  const availableSubjects = useMemo(() => {
    if (selectedGrade === 'all') {
      const subjects = lessons.map(l => ({ 
        id: l.subject.id, 
        name: l.subject.name 
      }));
      return Array.from(new Map(subjects.map(s => [s.id, s])).values());
    }
    
    const filtered = lessons
      .filter(l => l.subject.grade.id === selectedGrade)
      .map(l => ({ id: l.subject.id, name: l.subject.name }));
    return Array.from(new Map(filtered.map(s => [s.id, s])).values());
  }, [lessons, selectedGrade]);

  const availableLessons = useMemo(() => {
    let filtered = lessons;
    
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(l => l.subject.grade.id === selectedGrade);
    }
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(l => l.subject.id === selectedSubject);
    }
    
    return filtered;
  }, [lessons, selectedGrade, selectedSubject]);

  // ✅ Filtered and Sorted Videos
  const filteredVideos = useMemo(() => {
    let filtered = videos;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        v.lesson.title.toLowerCase().includes(query) ||
        v.lesson.subject.name.toLowerCase().includes(query)
      );
    }

    // Grade filter
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(v => v.lesson.subject.grade.id === selectedGrade);
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(v => v.lesson.subject.id === selectedSubject);
    }

    // Lesson filter
    if (selectedLesson !== 'all') {
      filtered = filtered.filter(v => v.lessonId === selectedLesson);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return b.duration - a.duration;
        case 'newest':
          return b.id.localeCompare(a.id); // Assuming IDs are chronological
        case 'order':
        default:
          return a.order - b.order;
      }
    });

    return sorted;
  }, [videos, searchQuery, selectedGrade, selectedSubject, selectedLesson, sortBy]);

  // ✅ Statistics
  const stats = useMemo(() => {
    const totalDuration = videos.reduce((acc, v) => acc + v.duration, 0);
    const avgDuration = videos.length > 0 ? totalDuration / videos.length : 0;
    
    return {
      total: videos.length,
      totalDuration: Math.floor(totalDuration / 60), // in minutes
      avgDuration: Math.floor(avgDuration / 60), // in minutes
      filtered: filteredVideos.length
    };
  }, [videos, filteredVideos]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormData({
      lessonId: selectedLesson !== 'all' ? selectedLesson : '',
      title: '',
      description: '',
      videoUrl: '',
      duration: '',
      order: '1',
    });
    setShowModal(true);
  };

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      lessonId: video.lessonId,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      duration: video.duration.toString(),
      order: video.order.toString(),
    });
    setShowModal(true);
  };

  const openPreviewModal = (video: Video) => {
    setPreviewVideo(video);
    setShowPreviewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewVideo(null);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('🚀 Form submitted!');
  console.log('📋 Form data:', formData);
  
  // ✅ AUTO-CONVERT YouTube URL to embed format
  let embedUrl = formData.videoUrl.trim();
  
  // Convert youtu.be/VIDEO_ID to youtube.com/embed/VIDEO_ID
  if (embedUrl.includes('youtu.be/')) {
    const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('🔄 Converted short URL to embed:', embedUrl);
  }
  
  // Convert youtube.com/watch?v=VIDEO_ID to youtube.com/embed/VIDEO_ID
  if (embedUrl.includes('youtube.com/watch?v=')) {
    const videoId = embedUrl.split('v=')[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('🔄 Converted watch URL to embed:', embedUrl);
  }
  
  // Validate final URL
  if (!embedUrl.includes('youtube.com/embed/')) {
    console.log('❌ Invalid YouTube URL after conversion:', embedUrl);
    toast.error('Please use a valid YouTube URL');
    return;
  }
  
  console.log('✅ YouTube URL is valid:', embedUrl);
  
  setSubmitting(true);

  try {
    const videoData = {
      lessonId: formData.lessonId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      videoUrl: embedUrl, // ✅ Use converted URL
      duration: parseInt(formData.duration),
      order: parseInt(formData.order),
    };

    console.log('📦 Video data to send:', videoData);

    if (editingVideo) {
      console.log('✏️ Updating video:', editingVideo.id);
      await adminService.updateVideo(editingVideo.id, videoData);
      toast.success('✅ Video updated successfully!');
    } else {
      console.log('➕ Creating new video');
      await adminService.createVideo(videoData);
      toast.success('✅ Video created successfully!');
    }

    console.log('🔄 Fetching updated videos list...');
    const videosData = await adminService.getAllVideos();
    setVideos(videosData);
    
    console.log('🚪 Closing modal');
    closeModal();
  } catch (error: any) {
    console.error('❌ Error:', error);
    toast.error(error.response?.data?.message || 'Operation failed');
  } finally {
    setSubmitting(false);
  }
};

  const handleDelete = async (video: Video) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${video.title}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteVideo(video.id);
      toast.success('🗑️ Video deleted successfully!');
      const videosData = await adminService.getAllVideos();
      setVideos(videosData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete video');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('all');
    setSelectedSubject('all');
    setSelectedLesson('all');
    setSortBy('order');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoThumbnail = (url: string) => {
    const videoId = url.split('/').pop()?.split('?')[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
      {/* Header */}
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
        {/* Header Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Videos Management
              </h1>
              <p className="text-gray-600">Upload and manage video content for lessons</p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Video
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Videos</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Duration</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalDuration}m</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Avg Duration</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats.avgDuration}m</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Filtered</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{stats.filtered}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
            <div className="grid md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Grade Filter */}
              <div>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedSubject('all');
                    setSelectedLesson('all');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Grades</option>
                  {uniqueGrades.map((grade) => (
                    <option key={grade.id} value={grade.id}>Grade {grade.number}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedLesson('all');
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Subjects</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>

              {/* Lesson Filter */}
              <div>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="all">All Lessons</option>
                  {availableLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                >
                  <option value="order">Order</option>
                  <option value="title">Title</option>
                  <option value="duration">Duration</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-red-600 font-semibold flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition ${
                      viewMode === 'list' 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition ${
                      viewMode === 'grid' 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{filteredVideos.length}</span> of <span className="font-bold text-gray-900">{videos.length}</span> videos
              </p>
            </div>
          </div>
        </motion.div>

        {/* Videos List/Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {videos.length === 0 ? 'No Videos Yet' : 'No Matching Videos'}
            </h3>
            <p className="text-gray-600 mb-6">
              {videos.length === 0 
                ? 'Add your first video to get started' 
                : 'Try adjusting your filters or search query'}
            </p>
            {videos.length === 0 ? (
              <button
                onClick={openCreateModal}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Add First Video
              </button>
            ) : (
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : viewMode === 'list' ? (
          // LIST VIEW
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  variants={scaleIn}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all group"
                >
                  <div className="grid md:grid-cols-6 gap-0">
                    {/* Thumbnail */}
                    <div className="md:col-span-2 relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video md:aspect-auto">
                      {getVideoThumbnail(video.videoUrl) ? (
                        <img
                          src={getVideoThumbnail(video.videoUrl)!}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-20 h-20 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 text-white text-sm font-bold rounded-lg backdrop-blur-sm">
                        {formatDuration(video.duration)}
                      </div>

                      {/* Preview Button */}
                      <button
                        onClick={() => openPreviewModal(video)}
                        className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 text-xs font-bold rounded-lg backdrop-blur-sm transition opacity-0 group-hover:opacity-100 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        Preview
                      </button>
                    </div>

                    {/* Video Info */}
                    <div className="md:col-span-3 p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                          Video {video.order}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                          Grade {video.lesson.subject.grade.number}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                          {video.lesson.subject.name}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition">
                        {video.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                        {video.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-gray-600 font-semibold">{video.lesson.title}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex flex-col justify-center border-l-2 border-gray-200">
                      <div className="space-y-2">
                        <button
                          onClick={() => openEditModal(video)}
                          className="w-full px-4 py-2.5 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 border-2 border-red-300 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          <svg className="w-4 h-4 group-hover/btn:rotate-12 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
                          className="w-full px-4 py-2.5 bg-white text-gray-700 font-bold rounded-lg hover:bg-gray-100 border-2 border-gray-300 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          <svg className="w-4 h-4 group-hover/btn:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // GRID VIEW
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  variants={scaleIn}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                    {getVideoThumbnail(video.videoUrl) ? (
                      <img
                        src={getVideoThumbnail(video.videoUrl)!}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 text-white text-sm font-bold rounded-lg backdrop-blur-sm">
                      {formatDuration(video.duration)}
                    </div>

                    <button
                      onClick={() => openPreviewModal(video)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
                    >
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </button>

                    <span className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                      #{video.order}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                        Grade {video.lesson.subject.grade.number}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                        {video.lesson.subject.name}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition">
                      {video.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {video.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="line-clamp-1">{video.lesson.title}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(video)}
                        className="flex-1 px-3 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 border-2 border-red-300 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video)}
                        className="flex-1 px-3 py-2 bg-white text-gray-700 font-bold rounded-lg hover:bg-gray-100 border-2 border-gray-300 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingVideo ? '✏️ Edit Video' : '➕ Add New Video'}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                  disabled={submitting}
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Lesson <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.lessonId}
                    onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                    required
                  >
                    <option value="">Select lesson</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        Grade {lesson.subject.grade.number} - {lesson.subject.name} - {lesson.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Video Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Introduction to Algebra"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                    required
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    placeholder="Describe what students will learn in this video..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900 resize-none"
                    rows={3}
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Video URL (YouTube Embed) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                    required
                  />
                  <div className="mt-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 font-semibold mb-1">💡 How to get YouTube embed URL:</p>
                    <ol className="text-xs text-blue-700 space-y-0.5 ml-4 list-decimal">
                      <li>Go to your YouTube video</li>
                      <li>Click "Share" → "Embed"</li>
                      <li>Copy the URL from src="..."</li>
                      <li>Format: https://www.youtube.com/embed/VIDEO_ID</li>
                    </ol>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Duration (seconds) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 300"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                      required
                      min="1"
                      max="36000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.duration && `≈ ${Math.floor(parseInt(formData.duration) / 60)} minutes`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Order <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                      required
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Video sequence number
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 border-2 border-gray-300 transition-all"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingVideo ? '💾 Update Video' : '➕ Add Video'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewVideo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{previewVideo.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Grade {previewVideo.lesson.subject.grade.number} • {previewVideo.lesson.subject.name} • {previewVideo.lesson.title}
                  </p>
                </div>
                <button
                  onClick={closePreviewModal}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="aspect-video bg-black">
                <iframe
                  src={previewVideo.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="p-6 bg-gray-50">
                <p className="text-gray-700 leading-relaxed">{previewVideo.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-bold text-gray-900">{formatDuration(previewVideo.duration)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Order:</span>
                      <span className="ml-2 font-bold text-gray-900">#{previewVideo.order}</span>
                    </div>
                  </div>
                  <Link
                    href={previewVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in YouTube
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}