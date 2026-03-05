export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
  status_code?: number;
  success?: boolean;
}
