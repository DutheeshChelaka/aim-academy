import api from '../api';

export const enrollmentService = {
  // Check if user is enrolled in a lesson
  async checkEnrollment(lessonId: string) {
    const response = await api.get(`/enrollments/check/${lessonId}`);
    return response.data;
  },

  // Create enrollment (after payment)
  async createEnrollment(lessonId: string, paymentId?: string) {
    const response = await api.post('/enrollments', {
      lessonId,
      paymentId: paymentId || null,
    });
    return response.data;
  },

  // Get user's enrollments
  async getMyEnrollments() {
    const response = await api.get('/enrollments/my');
    return response.data;
  },
};