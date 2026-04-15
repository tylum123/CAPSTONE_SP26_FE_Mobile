/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import {
  CreateRatingRequest,
  UpdateRatingRequest,
  RatingDTO,
  ApiResponse,
} from "../types/export_type_definitions";

export const ratingService = {
  /**
   * Create a new rating for a job/farmer or worker
   */
  createRating: async (data: CreateRatingRequest): Promise<RatingDTO> => {
    const response = await api.post<ApiResponse<RatingDTO>>(
      API_ENDPOINTS.RATING.CREATE,
      data
    );
    return response.data.data!;
  },

  /**
   * Update an existing rating
   */
  updateRating: async (
    id: string,
    data: UpdateRatingRequest
  ): Promise<RatingDTO> => {
    const response = await api.put<ApiResponse<RatingDTO>>(
      API_ENDPOINTS.RATING.DETAIL(id),
      data
    );
    return response.data.data!;
  },

  /**
   * Get ratings for a specific user (farmer or worker)
   */
  getUserRatings: async (userId: string): Promise<RatingDTO[]> => {
    const response = await api.get<ApiResponse<RatingDTO[]>>(
      API_ENDPOINTS.RATING.USER_ALL(userId)
    );
    return response.data.data || [];
  },

  /**
   * Get specific rating by user ID
   */
  getSpecificRatingByUserId: async (userId: string): Promise<RatingDTO> => {
    const response = await api.get<ApiResponse<RatingDTO>>(
      API_ENDPOINTS.RATING.USER_SPECIFIC(userId)
    );
    return response.data.data!;
  },

  /**
   * Get all ratings given by the current user
   */
  getGivenRatingsByUser: async (): Promise<RatingDTO[]> => {
    try {
      const response = await api.get<ApiResponse<RatingDTO[]>>(
        API_ENDPOINTS.RATING.USER_GIVEN
      );
      return response.data.data || [];
    } catch (error) {
      // Silence errors if no ratings are found (or any other issue)
      console.log("RatingService: Handled expected error for given ratings (likely none found)");
      return [];
    }
  },

  /**
   * Get average rating for a user
   */
  getAverageRating: async (userId: string): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(
      API_ENDPOINTS.RATING.USER_AVERAGE(userId)
    );
    return response.data.data || 0;
  },
};
