/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */

/**
 * Safely extracts a user-friendly error message from a Backend ApiResponse or AxiosError.
 * 
 * @param error The error object caught in a try-catch block
 * @param fallbackMessage Default message to show if extraction fails
 * @returns {string} The formatted error message
 */
export const getErrorMessage = (error: any, fallbackMessage: string = "Đã có lỗi xảy ra. Vui lòng thử lại."): string => {
  // If it's an Axios error with a response
  if (error?.response?.data) {
    const apiResponse = error.response.data;

    // Prioritize the backend's explicit message
    if (apiResponse.message) {
      return apiResponse.message;
    }

    // fallback to status code analysis if message is missing
    const statusCode = apiResponse.status_code || error.response.status;
    if (statusCode === 401) return "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.";
    if (statusCode === 403) return "Bạn không có quyền thực hiện hành động này.";
    if (statusCode === 404) return "Không tìm thấy dữ liệu yêu cầu.";
    if (statusCode === 409) return "Thông tin đã tồn tại trong hệ thống.";
    if (statusCode >= 500) return "Lỗi máy chủ. Vui lòng quay lại sau.";
  }

  // Handle direct generic errors thrown by interceptors or manual rejections
  if (error?.message && typeof error.message === "string") {
    // Check if the message is the one we sent in our axios success interceptor rejection
    if (error.message.includes("Logical failure")) {
      return error.response?.data?.message || fallbackMessage;
    }
    return error.message;
  }

  return fallbackMessage;
};
