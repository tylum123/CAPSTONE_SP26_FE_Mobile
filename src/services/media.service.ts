import api from "../config/axios";
import { API_ENDPOINTS, REQUEST_HEADERS } from "../constants/api";
import { ApiResponse } from "../types";

export type ImageUploadFile =
  | Blob
  | {
      uri: string;
      name: string;
      type: string;
    };

export const mediaService = {
  uploadImage: async (image: ImageUploadFile): Promise<string> => {
    const formData = new FormData();
    formData.append("image", image as any);

    const response = await api.post<ApiResponse<string>>(
      API_ENDPOINTS.MEDIA.UPLOAD_IMAGE,
      formData,
      {
        headers: {
          "Content-Type": REQUEST_HEADERS.CONTENT_TYPE_FORM_DATA,
        },
      },
    );

    return response.data.data;
  },
};
