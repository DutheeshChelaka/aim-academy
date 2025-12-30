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
  _count: {
    subjects: number;
  };
}

export default function GradesManagement() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    name: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    fetchGrades();
  }, [isAuthenticated, user, router]);

  const fetchGrades = async () => {
    try {
      const data = await adminService.getAllGrades();
      setGrades(data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const openCreateModal = () => {
    setEditingGrade(null);
    setFormData({ number: '', name: '' });
    setShowModal(true);
  };

  const openEditModal = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({ number: grade.number.toString(), name: grade.name });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGrade(null);
    setFormData({ number: '', name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const gradeNumber = parseInt(formData.number);
      
      if (editingGrade) {
        await adminService.updateGrade(editingGrade.id, gradeNumber, formData.name);
        toast.success('Grade updated successfully!');
      } else {
        await adminService.createGrade(gradeNumber, formData.name);
        toast.success('Grade created successfully!');
      }

      fetchGrades();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (grade: Grade) => {
    if (!confirm(`Are you sure you want to delete Grade ${grade.number}? This will delete all associated subjects, lessons, and videos!`)) {
      return;
    }

    try {
      await adminService.deleteGrade(grade.id);
      toast.success('Grade deleted successfully!');
      fetchGrades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete grade');
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Grades Management
              </span>
            </h1>
            <p className="text-gray-600">Create and manage grade levels</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Grade
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : grades.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Grades Yet</h3>
            <p className="text-gray-600 mb-6">Create your first grade to get started</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create First Grade
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {grades.map((grade) => (
              <div key={grade.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <div className="p-6">
                  <div className="text-6xl font-black text-blue-600 mb-3">{grade.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{grade.name}</h3>
                  <p className="text-gray-500 text-sm mb-6">{grade._count.subjects} Subjects</p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(grade)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 font-bold rounded-lg hover:bg-blue-200 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(grade)}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingGrade ? 'Edit Grade' : 'Create New Grade'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Grade Number
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1, 6, 10"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition outline-none text-gray-900"
                  required
                  min="1"
                  max="13"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Grade Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Grade 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition outline-none text-gray-900"
                  required
                />
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingGrade ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}