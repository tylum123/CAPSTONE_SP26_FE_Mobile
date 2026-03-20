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

export interface WorkerAttendanceDTO {
  id: string;
  jobApplicationId: string;
  workDate: string;
  checkInTime: string;
  checkInNotes: string | null;
  checkOutTime: string | null;
  checkOutNotes: string | null;
  totalHoursWorked: number | null;
  completedAmount: number | null;
  isApproved: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CheckInRequest {
  jobApplicationId: string;
  checkInTime: string;
  checkInNotes?: string | null;
}

export interface CheckOutRequest {
  attendanceId: string;
  checkOutTime: string;
  checkOutNotes?: string | null;
  completedAmount?: number;
}

export interface ApproveAttendanceRequest {
  attendanceId: string;
  approvedBy: string;
  adjustedHours?: number;
  adjustedAmount?: number;
}

export interface JobApplicationDTO {
  id: string;
  jobPostId: string;
  jobPostTitle?: string; // Metadata added by FE or future BE join
  farmName?: string;     // Metadata added by FE or future BE join
  wageAmount?: number;   // Metadata added by FE or future BE join
  wageTypeId?: number;   // Metadata added by FE or future BE join
  worker?: WorkerProfileDTO; // Backend returns the full worker object
  statusId: number;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
}

export interface CreateJobApplicationRequest {
  jobPostId: string;
  // workerId: string; // BE extracts this from token, keeping it commented or removing if not in BE DTO
  statusId: number;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
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
