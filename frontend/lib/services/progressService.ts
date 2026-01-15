import api from '../api';

export const progressService = {
  /**
   * Get video progress (view count, remaining views)
   */
  async getVideoProgress(videoId: string) {
    const response = await api.get(`/progress/${videoId}`);
    return response.data;
  },

  /**
   * Track video view (increment view count)
   */
  async trackVideoView(videoId: string) {
    const response = await api.post(`/progress/${videoId}/track`);
    return response.data;
  },

  /**
   * Check if user can watch video
   */
  async canWatchVideo(videoId: string) {
    const response = await api.get(`/progress/${videoId}/can-watch`);
    return response.data;
  },

  /**
   * Get all user progress
   */
  async getUserProgress() {
    const response = await api.get('/progress');
    return response.data;
  },
};