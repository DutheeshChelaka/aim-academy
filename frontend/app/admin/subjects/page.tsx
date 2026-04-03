'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { adminService } from '@/lib/services/adminService';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import PageLoader from '@/app/components/PageLoader';
import { motion, Variants } from 'framer-motion';

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

interface Grade {
  id: string;
  number: number;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  gradeId: string;
  thumbnailUrl?: string;
  grade: Grade;
  _count: {
    lessons: number;
  };
}

export default function SubjectsManagement() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gradeId: '',
    thumbnailUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [subjectsData, gradesData] = await Promise.all([
          adminService.getAllSubjects(),
          adminService.getAllGrades(),
        ]);
        setSubjects(subjectsData);
        setGrades(gradesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasHydrated, isAuthenticated, user]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <PageLoader />;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormData({ name: '', gradeId: '', thumbnailUrl: '' });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ 
      name: subject.name, 
      gradeId: subject.gradeId,
      thumbnailUrl: subject.thumbnailUrl || ''
    });
    setImagePreview(subject.thumbnailUrl || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({ name: '', gradeId: '', thumbnailUrl: '' });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('📤 Submitting form with data:', formData); // DEBUG

      if (editingSubject) {
        await adminService.updateSubject(
          editingSubject.id, 
          formData.name, 
          formData.gradeId,
          formData.thumbnailUrl || undefined
        );
        toast.success('Subject updated successfully!');
      } else {
        await adminService.createSubject(
          formData.name, 
          formData.gradeId,
          formData.thumbnailUrl || undefined
        );
        toast.success('Subject created successfully!');
      }

      const [subjectsData, gradesData] = await Promise.all([
        adminService.getAllSubjects(),
        adminService.getAllGrades(),
      ]);
      console.log('✅ Subjects fetched:', subjectsData); // DEBUG
      setSubjects(subjectsData);
      setGrades(gradesData);
      closeModal();
    } catch (error: any) {
      console.error('❌ Submit error:', error); // DEBUG
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete ${subject.name}? This will delete all associated lessons and videos!`)) {
      return;
    }

    try {
      await adminService.deleteSubject(subject.id);
      toast.success('Subject deleted successfully!');
      const subjectsData = await adminService.getAllSubjects();
      setSubjects(subjectsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, thumbnailUrl: url });
    setImagePreview(url || null);
  };

  const subjectColors = [
    { color: 'from-red-500 to-red-600', lightBg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    { color: 'from-gray-700 to-gray-800', lightBg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    { color: 'from-red-600 to-red-700', lightBg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    { color: 'from-gray-600 to-gray-700', lightBg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    { color: 'from-red-500 to-red-600', lightBg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    { color: 'from-gray-700 to-gray-800', lightBg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      
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
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 text-gray-900">
              Subjects Management
            </h1>
            <p className="text-gray-600">Create and manage subjects for each grade level</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Subject
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
          </div>
        ) : subjects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Yet</h3>
            <p className="text-gray-600 mb-6">Create your first subject to get started</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create First Subject
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((subject, index) => {
              const colorScheme = subjectColors[index % subjectColors.length];
              return (
                <motion.div
                  key={subject.id}
                  variants={scaleIn}
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-red-500 overflow-hidden transition-all"
                >
                  {subject.thumbnailUrl ? (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={subject.thumbnailUrl} 
                        alt={subject.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full border-2 border-white/30">
                        Grade {subject.grade.number}
                      </div>
                    </div>
                  ) : (
                    <div className={`h-40 bg-gradient-to-br ${colorScheme.color} flex items-center justify-center relative`}>
                      <svg className="w-16 h-16 text-white/30" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border-2 border-white/30">
                        Grade {subject.grade.number}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{subject.name}</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{subject._count.lessons} Lessons</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(subject)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 border-2 border-red-300 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject)}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 font-bold rounded-lg hover:bg-gray-100 border-2 border-gray-300 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, Science"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Grade *
                </label>
                <select
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                  required
                >
                  <option value="">Select a grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      Grade {grade.number} - {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Thumbnail Image
                </label>

                {imagePreview && (
                  <div className="mb-3 relative">
                    <img
                      src={imagePreview}
                      alt="Thumbnail preview"
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-300"
                      onError={(e) => {
                        console.error('❌ Image load error:', imagePreview);
                        setImagePreview(null);
                        toast.error('Failed to load image preview');
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, thumbnailUrl: '' });
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className={`flex items-center justify-center px-4 py-3 font-bold rounded-xl transition-all ${
                      uploading 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-300'
                    }`}>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Image must be less than 5MB');
                          return;
                        }

                        setUploading(true);
                        try {
                          console.log('📤 Uploading file:', file.name, file.size);
                          const result = await adminService.uploadThumbnail(file);
                          console.log('✅ Upload result:', result);
                          
                          const imageUrl = result.url;
                          setFormData({ ...formData, thumbnailUrl: imageUrl });
                          setImagePreview(imageUrl);
                          toast.success('Image uploaded successfully!');
                        } catch (error: any) {
                          console.error('❌ Upload error:', error);
                          toast.error(error.response?.data?.message || 'Upload failed');
                        } finally {
                          setUploading(false);
                        }
                      }}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste URL"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition outline-none text-gray-900"
                    disabled={uploading}
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Upload (max 5MB) or paste URL. JPEG, PNG, WebP
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 border-2 border-gray-300 transition-all"
                  disabled={submitting || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  disabled={submitting || uploading}
                >
                  {submitting ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}