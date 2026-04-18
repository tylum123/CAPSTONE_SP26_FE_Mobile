/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
// src/constants/enums.ts

export enum JobType {
  PerJob = 1,     // Khoán Trọn Gói
  Daily = 2,      // Theo Công nhật
}

export enum JobStatus {
  InProgress = 1, // Đang tiến hành
  Reported = 2,   // Đã báo cáo
  Completed = 3,  // Đã hoàn thành
}

export enum JobPostStatus {
  Draft = 1,
  Published = 2,
  Closed = 3,
  InProgress = 4,
  Completed = 5,
  Cancelled = 6,
}

export enum ApplicationStatus {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
  Cancelled = 4,
}

export enum DisputeStatus {
  Pending = 1,
  UnderReview = 2,
  Resolved = 3,
  Rejected = 4,
}

export enum DisputeType {
  JobQuality = 1,
  Payment = 2,
  Other = 3,
}

export enum WalletTransactionType {
  Deposit = 1,
  Withdraw = 2,
  JobPayment = 3,
  Refund = 4,
  JobLock = 5,
}

export enum ExperienceLevel {
  Beginner = 1,     // Mới Định Hướng
  Intermediate = 2, // Đã Có Kinh Nghiệm
  Experienced = 3,  // Thợ Lành Nghề
}

export enum NotificationType {
  JobAcceptance = 1,
  Reminder = 2,
  PaymentConfirmation = 3,
  NearbyJobOpening = 4,
}

export const JobTypeLabels: Record<JobType, string> = {
  [JobType.PerJob]: 'Khoán trọn gói',
  [JobType.Daily]: 'Làm theo công nhật',
};

export const JobStatusLabels: Record<JobStatus, string> = {
  [JobStatus.InProgress]: 'Đang tiến hành',
  [JobStatus.Reported]: 'Đã báo cáo',
  [JobStatus.Completed]: 'Đã hoàn thành',
};

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: 'Chờ duyệt',
  [ApplicationStatus.Accepted]: 'Được nhận',
  [ApplicationStatus.Rejected]: 'Bị từ chối',
  [ApplicationStatus.Cancelled]: 'Đã hủy',
};

export const ExperienceLevelLabels: Record<ExperienceLevel, string> = {
  [ExperienceLevel.Beginner]: 'Mới làm quen',
  [ExperienceLevel.Intermediate]: 'Có kinh nghiệm',
  [ExperienceLevel.Experienced]: 'Thợ lành nghề',
};

export const DisputeStatusLabels: Record<DisputeStatus, string> = {
  [DisputeStatus.Pending]: 'Đang chờ xử lý',
  [DisputeStatus.UnderReview]: 'Đang xem xét',
  [DisputeStatus.Resolved]: 'Giải quyết thành công',
  [DisputeStatus.Rejected]: 'Đã bị từ chối/bác bỏ',
};

export const DisputeTypeLabels: Record<DisputeType, string> = {
  [DisputeType.JobQuality]: 'Chất lượng công việc',
  [DisputeType.Payment]: 'Vấn đề thanh toán',
  [DisputeType.Other]: 'Lý do khác',
};

export const WalletTransactionTypeLabels: Record<WalletTransactionType, string> = {
  [WalletTransactionType.Deposit]: 'Nạp tiền',
  [WalletTransactionType.Withdraw]: 'Rút tiền',
  [WalletTransactionType.JobPayment]: 'Thanh toán thù lao',
  [WalletTransactionType.Refund]: 'Hoàn tiền',
  [WalletTransactionType.JobLock]: 'Tạm khóa',
};
