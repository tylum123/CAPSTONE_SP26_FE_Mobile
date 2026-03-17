export interface WorkerProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  ageRange: string;
  primaryLocation: string;
  travelRadiusKmPreference: number;
  experienceLevelId: number;
  experienceLevel: string;
  averageRating: number;
  availabilitySchedule: string;
  totalJobsCompleted: number;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWorkerProfileRequest {
  fullName: string;
  ageRange: string;
  primaryLocation: string;
  travelRadiusKmPreference?: number;
  experienceLevelId: number;
  availabilitySchedule: string;
  avatarUrl: string;
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
  jobPostTitle?: string;
  farmName?: string;
  wageAmount?: number;
  wageTypeId?: number;
  workerId: string;
  statusId: number;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
}

export interface CreateJobApplicationRequest {
  jobPostId: string;
  workerId: string;
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
