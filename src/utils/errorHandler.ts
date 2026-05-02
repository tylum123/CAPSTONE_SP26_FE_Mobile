import Toast from 'react-native-toast-message';

/**
 * Handles errors globally and displays them using Toast.
 * @param error The caught error object
 * @param customMessage Optional custom message to display if the error doesn't have a specific message
 */
export const handleError = (error: any, customMessage: string = 'Đã có lỗi xảy ra. Vui lòng thử lại.') => {
  // Extract error message from API response if available
  let errorMessage = customMessage;

  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  }

  // Sometimes Axios stringsify the error directly or it's a raw string
  if (typeof error === 'string') {
    errorMessage = error;
  }

  // Display error toast
  Toast.show({
    type: 'error',
    text1: 'Lỗi',
    text2: errorMessage,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
  });

  // Optionally, you can still log to console in development, 
  // but it's cleaner to remove redundant console.errors.
  // We only log if __DEV__ is true to avoid littering production logs.
  if (__DEV__) {
    // console.error('[GlobalErrorHandler]', error);
  }
};

/**
 * Displays a global success toast (can be used for lightweight success messages).
 * For complex success messages, continue using FeedbackModal.
 * @param message The success message to display
 */
export const handleSuccess = (message: string) => {
  Toast.show({
    type: 'success',
    text1: 'Thành công',
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
  });
};
