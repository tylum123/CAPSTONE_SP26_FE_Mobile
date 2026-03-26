import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, SkillResponse } from "../types";

export const skillService = {
  getSkills: async (): Promise<SkillResponse[]> => {
    const response = await api.get<ApiResponse<SkillResponse[]>>(
      API_ENDPOINTS.SKILLS.LIST
    );
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};
