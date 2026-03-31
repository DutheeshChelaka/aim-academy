import api from '../api';

export interface Subject {
  id: string;
  name: string;
  gradeId: string;
  createdAt: string;
  grade: {
    id: string;
    number: number;
    name: string;
  };
  _count: {
    lessons: number;
  };
}

export const subjectService = {
  async getAll(): Promise<Subject[]> {
    const response = await api.get('/subjects');
    return response.data;
  },

  async getById(id: string): Promise<Subject> {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  /**
   * Get published lessons for a subject
   * ✅ Uses the new filtered endpoint that only returns published lessons
   */
  async getLessons(id: string) {
    const response = await api.get(`/lessons/subject/${id}`); // ✅ CHANGED
    return response.data;
  },
};