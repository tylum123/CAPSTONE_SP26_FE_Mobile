import api from "../config/axios";
import { API_ENDPOINTS } from "../constants/api";

// Job interface
export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  company: string;
  createdAt: string;
  deadline: string;
  requirements?: string[];
  benefits?: string[];
  status?: string;
  isSaved?: boolean;
}

// Job list params
export interface JobListParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  status?: string;
}

// Job list response
export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}

// Apply job data
export interface ApplyJobData {
  coverLetter?: string;
  resumeUrl?: string;
}

// Job Service
export const jobService = {
  // Get job list
  getJobs: async (params?: JobListParams): Promise<JobListResponse> => {
    const response = await api.get<JobListResponse>(API_ENDPOINTS.JOBS.LIST, {
      params,
    });
    return response.data;
  },

  // Get job detail
  getJobDetail: async (id: string): Promise<Job> => {
    const response = await api.get<Job>(API_ENDPOINTS.JOBS.DETAIL(id));
    return response.data;
  },

  // Apply for job
  applyJob: async (id: string, data?: ApplyJobData): Promise<void> => {
    await api.post(API_ENDPOINTS.JOBS.APPLY(id), data);
  },

  // Get saved jobs
  getSavedJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>(API_ENDPOINTS.JOBS.SAVED);
    return response.data;
  },

  // Save job
  saveJob: async (id: string): Promise<void> => {
    await api.post(API_ENDPOINTS.JOBS.SAVE(id));
  },

  // Unsave job
  unsaveJob: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.JOBS.UNSAVE(id));
  },

  // Get application history
  getApplicationHistory: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>(API_ENDPOINTS.JOBS.HISTORY);
    return response.data;
  },
};
