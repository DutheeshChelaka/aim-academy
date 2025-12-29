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

export const lessonService = {
  async getAll(): Promise<Lesson[]> {
    const response = await api.get('/lessons');
    return response.data;
  },

  async getById(id: string): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  async getVideos(id: string): Promise<Video[]> {
    const response = await api.get(`/lessons/${id}/videos`);
    return response.data;
  },

  async checkAccess(id: string) {
    const response = await api.get(`/lessons/${id}/access`);
    return response.data;
  },
};