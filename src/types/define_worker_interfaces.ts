/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
// Matches backend WorkerProfileDTO.cs
export interface WorkerProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;       // Replaced age/ageRange
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
  dateOfBirth: string;       // Replaced ageRange
  primaryLocation: string;
  travelRadiusKmPreference?: number | null;
  experienceLevelId: number; // Required, range 1-3
  availabilitySchedule: string;
  avatarUrl: string;         // Required by BE (send empty string "" if no avatar)
}

export interface JobCategoryDTO {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface JobSkillRequirementSummaryDTO {
  id: string;
  name: string;
}

export interface JobPostDTO {
  id: string;
  farmerProfileId: string;
  contactName: string;
  jobSkillRequirements: JobSkillRequirementSummaryDTO[];
  farmId: string;
  jobCategoryId: string;
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  selectedDays: string[];
  startTime: string;
  endTime: string;
  workersNeeded: number;
  workersAccepted: number;
  jobTypeId: number;
  wageAmount: number;
  requirements: string[];
  privileges: string[];
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isUrgent: boolean;
  statusId: number;
  estimatedHours?: number; // Optional calculated field for FE
  workload?: string;       // Optional custom field for FE/Demo
}

export interface JobDiscoveryDTO extends JobPostDTO {
  jobTypeName: string;
  distanceKm: number;
  farmerAverageRating: number;
  locationName: string;
  skillsMatchCount: number;
  allSkillsMatched: boolean;
  availablePositions: number;
  durationDays: number;
  isUpcoming: boolean;
  matchScore: number;
  similarJobsCompleted: number;
}

export interface JobDetailDTO {
  id: string;
  jobApplicationId: string;
  jobPostId: string;
  workerId: string;
  statusId: number; 
  workDate: string;
  workerDescription: string;
  farmerFeedback?: string;
  farmerApprovedPercent?: number;
  jobPrice: number;
  workerPaymentAmount?: number;
  refundAmount?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  evidenceUrl?: string; // Added to support report images
  jobPost?: Partial<JobPostDTO>; 
}

export interface CreateDailyReportRequest {
  jobApplicationId: string;
  workerDescription: string;
  evidenceUrl?: string; // Added to support image uploads
}

export interface ApproveJobDetailRequest {
  farmerApprovedPercent: number;
  farmerFeedback?: string;
}

export interface DisputeReportDTO {
  id: string;
  farmerId: string | null;
  workerId: string | null;
  jobPostId: string;
  disputeTypeId: number;
  reason: string;
  description: string | null;
  evidenceUrl: string | null;
  statusId: number;
  adminNote: string | null;
  resolvedById: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateDisputeReportRequest {
  jobPostId: string;
  disputeTypeId: number;
  reason: string;
  description?: string;
  evidenceUrl?: string;
}

export interface JobApplicationDTO {
  id: string;
  jobPostId: string;
  statusId: number;
  workerId?: string;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
  locationName: string | null;
  jobPost?: Partial<JobPostDTO>; // Embedded for UI Card display
  worker?: WorkerProfileDTO;
  workDates?: string[]; // Added for Daily jobs
}

export interface CreateJobApplicationRequest {
  jobPostId: string;
  statusId: number;
  coverLetter: string | null;
  appliedAt: string;
  respondedAt: string;
  responseMessage: string | null;
  workDates?: string[]; // Renamed from availableDates to match spec
}

export interface JobSearchFilterRequest {
  workerLatitude?: number;
  workerLongitude?: number;
  maxDistanceKm?: number;
  minWageAmount?: number;
  maxWageAmount?: number;
  jobTypeId?: number;
  jobCategoryId?: string;
  searchKeyword?: string;
  requiredSkills?: string[];
  dateFilter?: string; // today | tomorrow | weekend | upcoming
  startDateFrom?: string;
  startDateTo?: string;
  durationType?: string; // Daily | PerJob | LongTerm
  paymentMethod?: string;
  onlyUrgent?: boolean;
  minWorkerRating?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string; // distance | wage | date
}

export interface PaginatedJobDiscoveryResponse {
  jobs: JobDiscoveryDTO[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  message: string;
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

export interface WalletDTO {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  isActive: boolean;
}

export interface WalletTransactionDTO {
  id: string;
  walletId: string;
  amount: number;
  type: number;
  description: string;
  createdAt: string;
}

export interface WithdrawalResponse {
  id: string;
  payoutId?: string;
  amount: number;
  status: string;
  approvalState?: string;
  bankName?: string;
  accountHolderName?: string;
  bankAccountNumber?: string;
  referenceCode?: string;
  description?: string;
  createdAt?: string;
  processedAt?: string;
}

export interface WithdrawalAccountBalanceResponse {
  balance: number;
  availableBalance: number;
  currency: string;
}

export interface SkillResponse {
  id: string;
  name: string;
  description: string;
  categoryId: number;
  isActive: boolean;
}

export interface WeatherDTO {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  iconUrl: string;
  sunrise: string;
  sunset: string;
  fetchedAt: string;
}
