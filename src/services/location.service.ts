/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import axios from "axios";

const BASE_URL = "https://provinces.open-api.vn/api";

export const locationService = {
  getProvinces: async () => {
    const response = await axios.get(`${BASE_URL}/p/`);
    return response.data;
  },
  getDistricts: async (provinceCode: number) => {
    const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
    return response.data.districts;
  },
  getWards: async (districtCode: number) => {
    const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
    return response.data.wards;
  },
};
