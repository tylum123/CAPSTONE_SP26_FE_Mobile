/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import api from "../config/configure_axios_client";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, WeatherDTO } from "../types/export_type_definitions";

export const weatherService = {
  getWeather: async (): Promise<WeatherDTO> => {
    const response = await api.get<ApiResponse<WeatherDTO>>(
      API_ENDPOINTS.WEATHER.ME
    );
    return response.data.data;
  },
};
