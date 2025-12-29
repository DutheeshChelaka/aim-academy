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

  async getLessons(id: string) {
    const response = await api.get(`/subjects/${id}/lessons`);
    return response.data;
  },
};