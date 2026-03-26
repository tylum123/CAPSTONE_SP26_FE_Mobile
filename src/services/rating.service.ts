import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";

export interface CreateRatingRequest {
  jobPostId: string;
  ratingValue: number;
  comment: string;
  targetUserId?: string; // Optional if backend infers from JobPost/Context
}

export const ratingService = {
  /**
   * Create a new rating for a job/farmer
   */
  createRating: async (data: CreateRatingRequest) => {
    const response = await api.post(API_ENDPOINTS.RATING.CREATE, data);
    return response.data;
  },

  /**
   * Get ratings for a specific user (farmer)
   */
  getUserRatings: async (userId: string) => {
    const response = await api.get(API_ENDPOINTS.RATING.USER_ALL(userId));
    return response.data.data || [];
  },

  /**
   * Get average rating for a user
   */
  getAverageRating: async (userId: string) => {
    const response = await api.get(API_ENDPOINTS.RATING.USER_AVERAGE(userId));
    return response.data.data || 0;
  }
};
