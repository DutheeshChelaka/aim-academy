import api from '../api';

export const adminService = {
  // Stats
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Grades
  async getAllGrades() {
    const response = await api.get('/admin/grades');
    return response.data;
  },

  async createGrade(number: number, name: string) {
    const response = await api.post('/admin/grades', { number, name });
    return response.data;
  },

  async updateGrade(id: string, number: number, name: string) {
    const response = await api.put(`/admin/grades/${id}`, { number, name });
    return response.data;
  },

  async deleteGrade(id: string) {
    const response = await api.delete(`/admin/grades/${id}`);
    return response.data;
  },

  // Subjects
  async getAllSubjects() {
    const response = await api.get('/admin/subjects');
    return response.data;
  },

  async createSubject(name: string, gradeId: string) {
    const response = await api.post('/admin/subjects', { name, gradeId });
    return response.data;
  },

  async updateSubject(id: string, name: string, gradeId: string) {
    const response = await api.put(`/admin/subjects/${id}`, { name, gradeId });
    return response.data;
  },

  async deleteSubject(id: string) {
    const response = await api.delete(`/admin/subjects/${id}`);
    return response.data;
  },

  // Lessons
  async getAllLessons() {
    const response = await api.get('/admin/lessons');
    return response.data;
  },

  async createLesson(data: {
    title: string;
    description: string;
    subjectId: string;
    price: number;
    order: number;
    thumbnailUrl?: string;
  }) {
    const response = await api.post('/admin/lessons', data);
    return response.data;
  },

  async updateLesson(
    id: string,
    data: {
      title: string;
      description: string;
      subjectId: string;
      price: number;
      order: number;
      thumbnailUrl?: string;
      isPublished?: boolean;
    },
  ) {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return response.data;
  },

  async deleteLesson(id: string) {
    const response = await api.delete(`/admin/lessons/${id}`);
    return response.data;
  },

  // Videos
  async getAllVideos() {
    const response = await api.get('/admin/videos');
    return response.data;
  },

  async getVideosByLesson(lessonId: string) {
    const response = await api.get(`/admin/videos/lesson/${lessonId}`);
    return response.data;
  },

  async createVideo(data: {
    lessonId: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
  }) {
    const response = await api.post('/admin/videos', data);
    return response.data;
  },

  async updateVideo(
    id: string,
    data: {
      title: string;
      description: string;
      videoUrl: string;
      duration: number;
      order: number;
    },
  ) {
    const response = await api.put(`/admin/videos/${id}`, data);
    return response.data;
  },

  async deleteVideo(id: string) {
    const response = await api.delete(`/admin/videos/${id}`);
    return response.data;
  },

  // Students
  async getAllStudents() {
    const response = await api.get('/admin/students');
    return response.data;
  },

  // Enrollments
  async getAllEnrollments() {
    const response = await api.get('/admin/enrollments');
    return response.data;
  },
};