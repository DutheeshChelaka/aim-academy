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
  // Check if user is enrolled in a lesson
  async checkEnrollment(lessonId: string) {
    const response = await api.get(`/enrollments/check/${lessonId}`);
    return response.data;
  },

  // Create enrollment (after payment)
  async createEnrollment(lessonId: string, paymentId: string) {
    const response = await api.post('/enrollments', {
      lessonId,
      paymentId,
    });
    return response.data;
  },

  // Get user's enrollments
  async getMyEnrollments() {
    const response = await api.get('/enrollments/my');
    return response.data;
  },
};
