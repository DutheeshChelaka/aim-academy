'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

interface Lesson {
  id: string;
  title: string;
  subject: {
    name: string;
    grade: {
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

export default function VideosManagement() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [videos, setVideos] = useState<Video[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    lessonId: '',
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    order: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router]);

  const fetchData = async () => {
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormData({
      lessonId: '',
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

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const videoData = {
        lessonId: formData.lessonId,
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        duration: parseInt(formData.duration),
        order: parseInt(formData.order),
      };

      if (editingVideo) {
        await adminService.updateVideo(editingVideo.id, videoData);
        toast.success('Video updated successfully!');
      } else {
        await adminService.createVideo(videoData);
        toast.success('Video created successfully!');
      }

      fetchData();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (video: Video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return;
    }

    try {
      await adminService.deleteVideo(video.id);
      toast.success('Video deleted successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete video');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="h-1 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500"></div>
      
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/admin" className="flex items-center hover:opacity-80 transition">
              <Image src="/images/logo-light.png" alt="AIM Academy" width={130} height={52} className="object-contain sm:w-[150px]" />
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
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>

              <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-lg shadow-md hover:shadow-lg transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Videos Management
              </span>
            </h1>
            <p className="text-gray-600">Upload and manage video content for lessons</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Video
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Videos Yet</h3>
            <p className="text-gray-600 mb-6">Add your first video to get started</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Add First Video
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-gray-100 overflow-hidden transition-all">
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-6">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      <div className="text-sm font-bold">{formatDuration(video.duration)}</div>
                    </div>
                  </div>

                  <div className="md:col-span-3 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                        Order {video.order}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                        Grade {video.lesson.subject.grade.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-semibold">{video.lesson.subject.name}</span>
                      <span>•</span>
                      <span>{video.lesson.title}</span>
                    </div>
                    <div className="mt-3">
  <Link
    href={video.videoUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-blue-600 hover:underline flex items-center"
  >
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
    View Video URL
  </Link>
</div>
                  </div>

                  <div className="md:col-span-1 bg-gradient-to-br from-orange-50 to-red-50 p-6 flex flex-col justify-center">
                    <div className="space-y-2">
                      <button
                        onClick={() => openEditModal(video)}
                        className="w-full px-4 py-2 bg-orange-100 text-orange-600 font-bold rounded-lg hover:bg-orange-200 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video)}
                        className="w-full px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Lesson *
                </label>
                <select
                  value={formData.lessonId}
                  onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition outline-none text-gray-900"
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
                  Video Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Topic"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Video description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition outline-none text-gray-900"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Video URL * (YouTube embed format)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition outline-none text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Duration (seconds) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 300 for 5 minutes"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition outline-none text-gray-900"
                    required
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: 300 = 5 minutes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Order *
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition outline-none text-gray-900"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}