import api from '../api';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  price: number;
  thumbnailUrl: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  _count: {
    videos: number;
  };
  subject?: {
    id: string;
    name: string;
    grade: {
      id: string;
      number: number;
      name: string;
    };
  };
}

export interface Video {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  createdAt: string;
}

export interface EnrolledLesson extends Lesson {
  enrolledAt: string;
  expiresAt: string | null;
}

export const lessonService = {
  /**
   * Get all published lessons (public)
   */
  async getAll(): Promise<Lesson[]> {
    const response = await api.get('/lessons');
    return response.data;
  },

  /**
   * Get single lesson by ID
   * ✅ Auto-checks if user is enrolled for unpublished lessons
   */
  async getById(id: string): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  /**
   * Get videos for a lesson (requires authentication)
   */
  async getVideos(id: string): Promise<Video[]> {
    const response = await api.get(`/lessons/${id}/videos`);
    return response.data;
  },

  /**
   * Check user access to a lesson
   */
  async checkAccess(id: string) {
    const response = await api.get(`/lessons/${id}/access`);
    return response.data;
  },

  /**
   * Get user's enrolled lessons (My Courses)
   * ✅ NEW: Returns all purchased lessons (published + unpublished)
   */
  async getMyEnrolledLessons(): Promise<EnrolledLesson[]> {
    const response = await api.get('/lessons/my/enrolled');
    return response.data;
  },
};