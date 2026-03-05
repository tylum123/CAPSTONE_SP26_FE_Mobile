import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";
import { ApiResponse } from "../types";
import { authTokenService } from "./auth-token.service";

export interface CheckInRequest {
  jobApplicationId: string;
  checkInTime: string;
  checkInNotes?: string;
}

export interface CheckOutRequest {
  attendanceId: string;
  checkOutTime: string;
  checkOutNotes?: string;
}

export interface WorkerAttendanceDTO {
  id: string;
  jobApplicationId: string;
  workDate: string;
  checkInTime: string;
  checkInNotes?: string | null;
  checkOutTime?: string | null;
  checkOutNotes?: string | null;
  totalHoursWorked?: number | null;
  isApproved: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface WorkerAttendanceQuery {
  startDate?: string;
  endDate?: string;
}

export interface ApproveAttendanceRequest {
  attendanceId: string;
  approvedBy: string;
  adjustedHours?: number;
}

export interface FarmerAttendanceQuery {
  jobPostId?: string;
  startDate?: string;
  endDate?: string;
}

export const attendanceService = {
  checkIn: async (data: CheckInRequest): Promise<WorkerAttendanceDTO> => {
    const response = await api.post<ApiResponse<WorkerAttendanceDTO>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_IN,
      data,
    );
    return response.data.data;
  },

  checkOut: async (data: CheckOutRequest): Promise<WorkerAttendanceDTO> => {
    const response = await api.put<ApiResponse<WorkerAttendanceDTO>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_OUT,
      data,
    );
    return response.data.data;
  },

  getAttendance: async (id: string): Promise<WorkerAttendanceDTO> => {
    const response = await api.get<ApiResponse<WorkerAttendanceDTO>>(
      API_ENDPOINTS.ATTENDANCE.DETAIL(id),
    );
    return response.data.data;
  },

  getWorkerAttendance: async (
    workerProfileId: string,
    query?: WorkerAttendanceQuery,
  ): Promise<WorkerAttendanceDTO[]> => {
    const response = await api.get<ApiResponse<WorkerAttendanceDTO[]>>(
      API_ENDPOINTS.ATTENDANCE.WORKER(workerProfileId),
      { params: query },
    );
    return response.data.data;
  },

  getMyWorkerAttendance: async (
    query?: WorkerAttendanceQuery,
  ): Promise<WorkerAttendanceDTO[]> => {
    const workerProfileId = await authTokenService.getCurrentWorkerProfileId();
    if (!workerProfileId) {
      throw new Error(
        "WorkerProfileId was not found in token claims. Please sign in again.",
      );
    }

    return attendanceService.getWorkerAttendance(workerProfileId, query);
  },

  approveAttendance: async (
    data: ApproveAttendanceRequest,
  ): Promise<WorkerAttendanceDTO> => {
    const response = await api.put<ApiResponse<WorkerAttendanceDTO>>(
      API_ENDPOINTS.ATTENDANCE.APPROVE,
      data,
    );
    return response.data.data;
  },

  getFarmAttendance: async (
    farmerProfileId: string,
    query?: FarmerAttendanceQuery,
  ): Promise<WorkerAttendanceDTO[]> => {
    const response = await api.get<ApiResponse<WorkerAttendanceDTO[]>>(
      API_ENDPOINTS.ATTENDANCE.FARM(farmerProfileId),
      { params: query },
    );
    return response.data.data;
  },

  getFarmWorkerAttendance: async (
    farmerProfileId: string,
    workerProfileId: string,
    query?: WorkerAttendanceQuery,
  ): Promise<WorkerAttendanceDTO[]> => {
    const response = await api.get<ApiResponse<WorkerAttendanceDTO[]>>(
      API_ENDPOINTS.ATTENDANCE.FARM_WORKER(farmerProfileId, workerProfileId),
      { params: query },
    );
    return response.data.data;
  },
};
