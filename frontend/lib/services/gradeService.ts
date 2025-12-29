import api from '../api';

export interface Grade {
  id: string;
  number: number;
  name: string;
  createdAt: string;
  _count: {
    subjects: number;
  };
}

export const gradeService = {
  async getAll(): Promise<Grade[]> {
    const response = await api.get('/grades');
    return response.data;
  },

  async getById(id: string): Promise<Grade> {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  },

  async getSubjects(id: string) {
    const response = await api.get(`/grades/${id}/subjects`);
    return response.data;
  },
};