import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse, WeatherDTO } from "../types";

export const weatherService = {
  getWeather: async (): Promise<WeatherDTO> => {
    const response = await api.get<ApiResponse<WeatherDTO>>(
      API_ENDPOINTS.WEATHER.ME
    );
    return response.data.data;
  },
};
