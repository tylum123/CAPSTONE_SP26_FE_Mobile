// Matches backend WorkerProfileDTO.cs
export interface WorkerProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  age: string;               // BE field name is 'Age' (not ageRange)
  ageRange?: string;         // Alias kept for backward compat with some FE components
  primaryLocation: string;
  travelRadiusKmPreference?: number | null;
  experienceLevelId: number;
  experienceLevel: string;
  averageRating: number;
  availabilitySchedule: string;
  totalJobsCompleted: number;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  email?: string;            // Returned by BE along with profile
  phoneNumber?: string;      // Returned by BE along with profile
}

// Matches backend UpdateWorkerProfileRequest.cs
export interface UpdateWorkerProfileRequest {
  fullName: string;
  ageRange: string;          // BE request field name is AgeRange
  primaryLocation: string;
  travelRadiusKmPreference?: number | null;
  experienceLevelId: number; // Required, range 1-3
  availabilitySchedule: string;
  avatarUrl: string;         // Required by BE (send empty string "" if no avatar)
}

import { JobPostDTO } from "../services/job.service";

export interface JobDailyReportDTO {
  id: string;
  jobApplicationId: string;
  reportDate: string;
  description: string;
  imageUrls: string[];
  statusId: number; // 1: Pending, 2: Approved, 3: Appealed
  evaluationPercentage?: number;
  farmerFeedback?: string;
  evaluatedAt?: string;
  createdAt: string;
  jobPost?: Partial<JobPostDTO>; // Embedded for UI Card display
}

export interface CreateDailyReportRequest {
  jobApplicationId: string;
  reportDate: string;
  description: string;
  imageUrls?: string[];
}

export interface EvaluateReportRequest {
  reportId: string;
  evaluationPercentage: number;
  farmerFeedback?: string;
}

export interface JobApplicationDTO {
  id: string;
  jobPostId: string;
  statusId: number;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
  jobPost?: Partial<JobPostDTO>; // Embedded for UI Card display
  worker?: WorkerProfileDTO;
}

export interface CreateJobApplicationRequest {
  jobPostId: string;
  statusId: number;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
  availableDates?: string[]; // Added for Daily jobs
}

export interface NotificationDTO {
  id: string;
  userId: string;
  relatedEntityId: string | null;
  type: number;
  typeName: string;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt: string | null;
}
