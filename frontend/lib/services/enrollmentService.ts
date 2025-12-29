import api from '../api';

export interface Enrollment {
  id: string;
  userId: string;
  lessonId: string;
  paymentId: string | null;
  enrolledAt: string;
  lesson: {
    id: string;
    title: string;
    description: string;
    price: number;
    subject: {
      name: string;
      grade: {
        number: number;
      };
    };
    _count: {
      videos: number;
    };
  };
}

export const enrollmentService = {
  async create(lessonId: string, paymentId?: string): Promise<Enrollment> {
    const response = await api.post('/enrollments', {
      lessonId,
      paymentId,
    });
    return response.data;
  },

  async getUserEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/user');
    return response.data;
  },

  async checkEnrollment(lessonId: string) {
    const response = await api.get(`/enrollments/check/${lessonId}`);
    return response.data;
  },
};