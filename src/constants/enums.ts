// src/constants/enums.ts

export enum JobType {
  Daily = 1,      // Theo Công nhật
  PerPlot = 2,    // Theo Khoán / Từng Lô
  PerJob = 3,     // Khoán Trọn Gói
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
  [JobType.Daily]: 'Làm theo công nhật',
  [JobType.PerPlot]: 'Làm theo lô',
  [JobType.PerJob]: 'Khoán trọn gói',
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
