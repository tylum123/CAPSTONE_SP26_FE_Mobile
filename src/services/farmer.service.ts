import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";

export interface FarmerPublicProfile {
  id: string;
  userId: string;
  contactName: string;
  address: string;
  dateOfBirth: string;
  mainFarmId: string;
  averageRating: number;
  totalJobsPosted: number;
  totalJobsCompleted: number;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string;
  user: {
    id: string;
    email: string;
    phoneNumber: string;
    address: string;
    role: string;
    createdAt: string;
    isActive: boolean;
    isVerified: boolean;
  };
}

export const farmerService = {
  // Get farmer profile by user id
  getProfileByUserId: async (userId: string): Promise<FarmerPublicProfile> => {
    // Note: Adjust the endpoint path if it's different in the backend
    const response = await api.get<{ data: FarmerPublicProfile }>(API_ENDPOINTS.FARMER.PROFILE_BY_USER(userId));
    return response.data.data;
  },
};
