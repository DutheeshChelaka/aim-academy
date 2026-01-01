'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

interface Grade {
  id: string;
  number: number;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  gradeId: string;
  grade: Grade;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  price: number;
  order: number;
  isPublished: boolean;
  thumbnailUrl?: string;
  subjectId: string;
  subject: Subject;
  _count: {
    videos: number;
  };
}

export default function LessonsManagement() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    price: '',
    order: '',
    thumbnailUrl: '',
    isPublished: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, router]);

  const fetchData = async () => {
    try {
      const [lessonsData, subjectsData] = await Promise.all([
        adminService.getAllLessons(),
        adminService.getAllSubjects(),
      ]);
      setLessons(lessonsData);
      setSubjects(subjectsData);
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
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      subjectId: '',
      price: '',
      order: '1',
      thumbnailUrl: '',
      isPublished: true,
    });
    setShowModal(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      subjectId: lesson.subjectId,
      price: lesson.price.toString(),
      order: lesson.order.toString(),
      thumbnailUrl: lesson.thumbnailUrl || '',
      isPublished: lesson.isPublished,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLesson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const lessonData = {
        title: formData.title,
        description: formData.description,
        subjectId: formData.subjectId,
        price: parseFloat(formData.price),
        order: parseInt(formData.order),
        thumbnailUrl: formData.thumbnailUrl || undefined,
        isPublished: formData.isPublished,
      };

      if (editingLesson) {
        await adminService.updateLesson(editingLesson.id, lessonData);
        toast.success('Lesson updated successfully!');
      } else {
        await adminService.createLesson(lessonData);
        toast.success('Lesson created successfully!');
      }

      fetchData();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to delete "${lesson.title}"? This will delete all associated videos!`)) {
      return;
    }

    try {
      await adminService.deleteLesson(lesson.id);
      toast.success('Lesson deleted successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete lesson');
    }
  };

  const togglePublish = async (lesson: Lesson) => {
    try {
      await adminService.updateLesson(lesson.id, {
        title: lesson.title,
        description: lesson.description,
        subjectId: lesson.subjectId,
        price: lesson.price,
        order: lesson.order,
        thumbnailUrl: lesson.thumbnailUrl,
        isPublished: !lesson.isPublished,
      });
      toast.success(lesson.isPublished ? 'Lesson unpublished' : 'Lesson published');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update lesson');
    }
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
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Lessons Management
              </span>
            </h1>
            <p className="text-gray-600">Create and manage lessons with pricing</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Lesson
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Lessons Yet</h3>
            <p className="text-gray-600 mb-6">Create your first lesson to get started</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create First Lesson
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl border-2 border-gray-100 overflow-hidden transition-all">
                <div className="grid md:grid-cols-4 gap-0">
                  <div className="md:col-span-3 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                          {lesson.isPublished ? (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">Published</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Draft</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 font-semibold rounded-lg">
                            Grade {lesson.subject.grade.number}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 font-semibold rounded-lg">
                            {lesson.subject.name}
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-600 font-semibold rounded-lg">
                            {lesson._count.videos} Videos
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 font-semibold rounded-lg">
                            Order: {lesson.order}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex flex-col justify-between">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-black text-purple-600 mb-1">
                        Rs. {lesson.price}
                      </div>
                      <div className="text-xs text-gray-500">LKR</div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => togglePublish(lesson)}
                        className={`w-full px-4 py-2 font-bold rounded-lg transition-all ${
                          lesson.isPublished
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {lesson.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="w-full px-4 py-2 bg-purple-100 text-purple-600 font-bold rounded-lg hover:bg-purple-200 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lesson)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Introduction to Fractions"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition outline-none text-gray-900"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Lesson description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition outline-none text-gray-900"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition outline-none text-gray-900"
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        Grade {subject.grade.number} - {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition outline-none text-gray-900"
                    required
                    min="0"
                    step="0.01"
                  />
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
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition outline-none text-gray-900"
                    required
                    min="1"
                  />
                </div>

                {/* THUMBNAIL UPLOAD SECTION */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Thumbnail Image
                  </label>
                  
                  {/* Preview */}
                  {formData.thumbnailUrl && (
                    <div className="mb-3 relative">
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Upload Button & URL Input */}
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className={`flex items-center justify-center px-4 py-3 font-bold rounded-xl transition-all ${
                        uploading 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                      }`}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate size
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Image must be less than 5MB');
                            return;
                          }

                          setUploading(true);
                          try {
                            const result = await adminService.uploadThumbnail(file);
                            setFormData({ ...formData, thumbnailUrl: result.url });
                            toast.success('Image uploaded successfully!');
                          } catch (error: any) {
                            toast.error(error.response?.data?.message || 'Upload failed');
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>

                    {/* Manual URL Input */}
                    <input
                      type="url"
                      placeholder="Or paste URL"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition outline-none text-gray-900"
                      disabled={uploading}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Upload image (max 5MB) or paste URL. Supports JPEG, PNG, WebP
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      Publish lesson immediately
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                  disabled={submitting || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  disabled={submitting || uploading}
                >
                  {submitting ? 'Saving...' : editingLesson ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}