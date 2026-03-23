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
