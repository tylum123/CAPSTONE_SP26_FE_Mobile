/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
import { JobPostDTO, JobApplicationDTO, WorkerProfileDTO, JobDetailDTO, JobCategoryDTO, SkillResponse } from "../types/define_worker_interfaces";

export const DEMO_WORKER_PROFILE: WorkerProfileDTO = {
  id: "demo-worker-123",
  userId: "demo-user-123",
  fullName: "Nguyễn Văn Demo",
  date_of_birth: "1998-01-01T00:00:00Z",
  primaryLocation: "Thốt Nốt, Cần Thơ",
  travelRadiusKmPreference: 15,
  experienceLevelId: 2,
  experienceLevel: "Có kinh nghiệm",
  averageRating: 4.8,
  availabilitySchedule: "Thứ 2 - Thứ 7",
  totalJobsCompleted: 12,
  avatarUrl: "https://i.pravatar.cc/150?img=12",
  phoneNumber: "0987654321",
  email: "demo@agrotemp.vn",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
  genderId: 1,
  gender: "Nam",
  isActive: true,
  warningCount: 0,
  skills: [],
  lastWarnedAt: undefined
};

export const DEMO_CATEGORIES: JobCategoryDTO[] = [
  { id: "cat-1", name: "Thu hoạch", description: "Các công việc thu hoạch nông sản", isActive: true },
  { id: "cat-2", name: "Chăm sóc", description: "Tưới nước, bón phân, tỉa cành", isActive: true },
  { id: "cat-3", name: "Lao động phổ thông", description: "Các công việc chân tay khác", isActive: true },
  { id: "cat-4", name: "Khác", description: "Các công việc khác", isActive: true },
];

export const DEMO_SKILLS: SkillResponse[] = [
  { id: "s1", name: "Gặt lúa", description: "Gặt lúa bằng liềm hoặc máy", categoryId: 1, isActive: true },
  { id: "s2", name: "Vác lúa", description: "Vác bao lúa từ ruộng lên xe", categoryId: 1, isActive: true },
  { id: "s3", name: "Lái máy gặt", description: "Vận hành máy gặt đập liên hợp", categoryId: 1, isActive: true },
  { id: "s4", name: "Tưới nước", description: "Sử dụng hệ thống tưới hoặc vòi phun", categoryId: 2, isActive: true },
  { id: "s5", name: "Tỉa cành", description: "Sử dụng kéo tỉa cành chuyên dụng", categoryId: 2, isActive: true },
  { id: "s6", name: "Bón phân", description: "Bón phân đúng liều lượng và kỹ thuật", categoryId: 2, isActive: true },
  { id: "s7", name: "Dọn dẹp", description: "Làm cỏ, vệ sinh vườn tược", categoryId: 3, isActive: true },
];

export const DEMO_JOB_POSTS: JobPostDTO[] = [
  {
    id: "101",
    farmerProfileId: "farmer-1",
    contactName: "Nguyễn Văn A",
    jobSkillRequirements: [{ id: "s1", name: "Gặt lúa" }, { id: "s2", name: "Vác lúa" }],
    farmId: "farm-1",
    jobCategoryId: "cat-1",
    title: "Thu hoạch lúa",
    description: "Cần tuyển người thu hoạch lúa mùa. Công việc gặt, phơi và vác lúa.",
    address: "Ấp Tân Thạnh, Thốt Nốt, Cần Thơ",
    startDate: "2026-03-23T07:00:00Z",
    endDate: "2026-03-24T17:00:00Z",
    selectedDays: ["2026-03-23", "2026-03-24"],
    startTime: "07:00",
    endTime: "17:00",
    workersNeeded: 5,
    workersAccepted: 2,
    jobTypeId: 2, // Daily
    wageAmount: 250000,
    requirements: ["Sức khỏe tốt", "Có kinh nghiệm gặt lúa"],
    privileges: ["Bao cơm trưa", "Nước uống miễn phí"],
    publishedAt: "2026-03-20T08:00:00Z",
    createdAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-03-20T08:00:00Z",
    isUrgent: true,
    statusId: 2, // Published
    estimatedHours: 10,
    workload: "1 mẫu/ngày",
    farmer: {
      avatarUrl: "https://i.pravatar.cc/150?u=farmer1",
      contactName: "Nguyễn Văn A",
      averageRating: 4.5,
      totalJobsPosted: 10,
      totalJobsCompleted: 8,
    } as any,
  },
  {
    id: "501",
    farmerProfileId: "farmer-2",
    contactName: "Trần Văn C",
    jobSkillRequirements: [{ id: "s3", name: "Lái máy gặt" }],
    farmId: "farm-2",
    jobCategoryId: "cat-1",
    title: "Gặt lúa khoán mẫu lớn",
    description: "Khoán gặt lúa cho 10 mẫu ruộng. Yêu cầu nhóm thợ có máy gặt.",
    address: "Xã Vị Thắng, Vị Thủy, Hậu Giang",
    startDate: "2026-03-25T07:00:00Z",
    endDate: "2026-03-30T17:00:00Z",
    selectedDays: [],
    startTime: "07:00",
    endTime: "17:00",
    workersNeeded: 1,
    workersAccepted: 1,
    jobTypeId: 1, // PerJob (Khoán)
    wageAmount: 5000000,
    requirements: ["Có máy gặt đập liên hợp", "Am hiểu địa hình"],
    privileges: ["Hỗ trợ vận chuyển máy"],
    publishedAt: "2026-03-22T09:00:00Z",
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-03-22T09:00:00Z",
    isUrgent: false,
    statusId: 4, // InProgress
    estimatedHours: 40,
    workload: "10 mẫu",
    farmer: {
      avatarUrl: "https://i.pravatar.cc/150?u=farmer2",
      contactName: "Trần Văn C",
      averageRating: 4.2,
      totalJobsPosted: 5,
      totalJobsCompleted: 4,
    } as any,
  },
  {
    id: "301",
    farmerProfileId: "farmer-3",
    contactName: "Lê Thị C",
    jobSkillRequirements: [{ id: "s4", name: "Tưới nước" }],
    farmId: "farm-3",
    jobCategoryId: "cat-2",
    title: "Tưới nước vườn cam",
    description: "Tưới nước cho vườn cam sành 2 năm tuổi.",
    address: "Trà Ôn, Vĩnh Long",
    startDate: "2026-03-23T06:00:00Z",
    endDate: "2026-03-23T10:00:00Z",
    selectedDays: ["2026-03-23"],
    startTime: "06:00",
    endTime: "10:00",
    workersNeeded: 2,
    workersAccepted: 2,
    jobTypeId: 2, // Daily
    wageAmount: 150000,
    requirements: ["Cẩn thận", "Biết sử dụng hệ thống tưới"],
    privileges: [],
    publishedAt: "2026-03-21T10:00:00Z",
    createdAt: "2026-03-21T10:00:00Z",
    updatedAt: "2026-03-21T10:00:00Z",
    isUrgent: false,
    statusId: 4, // InProgress
    estimatedHours: 4,
    workload: "2 héc-ta",
    farmer: {
      avatarUrl: "https://i.pravatar.cc/150?u=farmer3",
      contactName: "Lê Thị C",
      averageRating: 4.8,
      totalJobsPosted: 15,
      totalJobsCompleted: 14,
    } as any,
  },
  {
    id: "701",
    farmerProfileId: "farmer-4",
    contactName: "Phạm Văn D",
    jobSkillRequirements: [{ id: "s5", name: "Tỉa cành" }],
    farmId: "farm-4",
    jobCategoryId: "cat-3",
    title: "Chăm sóc sầu riêng",
    description: "Tỉa cành, bón phân cho vườn sầu riêng đang ra hoa.",
    address: "Quận 9, TP. Hồ Chí Minh",
    startDate: "2026-03-27T08:00:00Z",
    endDate: "2026-03-27T17:00:00Z",
    selectedDays: ["2026-03-27"],
    startTime: "08:00",
    endTime: "17:00",
    workersNeeded: 3,
    workersAccepted: 0,
    jobTypeId: 2, // Daily
    wageAmount: 350000,
    requirements: ["Biết tỉa cành sầu riêng", "Sức khỏe tốt"],
    privileges: ["Hỗ trợ cơm trưa"],
    publishedAt: "2026-03-25T08:00:00Z",
    createdAt: "2026-03-25T08:00:00Z",
    updatedAt: "2026-03-25T08:00:00Z",
    isUrgent: true,
    statusId: 2, // Published
    estimatedHours: 8,
    workload: "50 cây/ngày",
    farmer: {
      avatarUrl: "https://i.pravatar.cc/150?u=farmer4",
      contactName: "Phạm Văn D",
      averageRating: 4.0,
      totalJobsPosted: 8,
      totalJobsCompleted: 5,
    } as any,
  },
  {
    id: "801",
    farmerProfileId: "farmer-5",
    contactName: "Hoàng Thị E",
    jobSkillRequirements: [{ id: "s6", name: "Bón phân" }],
    farmId: "farm-5",
    jobCategoryId: "cat-2",
    title: "Bón phân vườn bưởi",
    description: "Bón phân hữu cơ cho vườn bưởi da xanh.",
    address: "Phong Điền, Cần Thơ",
    startDate: "2026-03-28T07:30:00Z",
    endDate: "2026-03-28T11:30:00Z",
    selectedDays: ["2026-03-28"],
    startTime: "07:30",
    endTime: "11:30",
    workersNeeded: 4,
    workersAccepted: 1,
    jobTypeId: 2, // Daily
    wageAmount: 180000,
    requirements: ["Nhanh nhẹn", "Cẩn thận"],
    privileges: [],
    publishedAt: "2026-03-25T09:00:00Z",
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-03-25T09:00:00Z",
    isUrgent: false,
    statusId: 2, // Published
    estimatedHours: 4,
    workload: "100 gốc",
    farmer: {
      avatarUrl: "https://i.pravatar.cc/150?u=farmer5",
      contactName: "Hoàng Thị E",
      averageRating: 4.7,
      totalJobsPosted: 12,
      totalJobsCompleted: 10,
    } as any,
  },
  {
    id: "901",
    farmerProfileId: "farmer-6",
    contactName: "Bùi Văn F",
    jobSkillRequirements: [{ id: "s7", name: "Dọn dẹp" }],
    farmId: "farm-6",
    jobCategoryId: "cat-4",
    title: "Dọn dẹp vườn kiểng",
    description: "Dọn cỏ và lá khô cho vườn kiểng tại gia.",
    address: "Quận 1, TP. Hồ Chí Minh",
    startDate: "2026-03-26T08:00:00Z",
    endDate: "2026-03-26T12:00:00Z",
    selectedDays: ["2026-03-26"],
    startTime: "08:00",
    endTime: "12:00",
    workersNeeded: 1,
    workersAccepted: 0,
    jobTypeId: 2, // Daily
    wageAmount: 200000,
    requirements: ["Cẩn thận với cây cảnh"],
    privileges: [],
    publishedAt: "2026-03-25T10:00:00Z",
    createdAt: "2026-03-25T10:00:00Z",
    updatedAt: "2026-03-25T10:00:00Z",
    isUrgent: false,
    statusId: 2, // Published
    estimatedHours: 4,
    workload: "Vườn 50m2",
    farmer: {
      avatarUrl: "https://i.pravatar.cc/150?u=farmer6",
      contactName: "Bùi Văn F",
      averageRating: 4.9,
      totalJobsPosted: 3,
      totalJobsCompleted: 3,
    } as any,
  },
  {
    id: "completed-job-1",
    farmerProfileId: "farmer-1",
    contactName: "Nguyễn Văn A",
    jobSkillRequirements: [{ id: "s1", name: "Thu hoạch" }],
    farmId: "farm-1",
    jobCategoryId: "cat-1",
    title: "Hái cà phê hoàn thành",
    description: "Công việc đã hoàn thành và nhận thù lao.",
    address: "Bảo Lộc, Lâm Đồng",
    startDate: "2026-03-20T08:00:00Z",
    endDate: "2026-03-20T17:00:00Z",
    selectedDays: ["2026-03-20"],
    startTime: "08:00",
    endTime: "17:00",
    workersNeeded: 5,
    workersAccepted: 5,
    jobTypeId: 2,
    wageAmount: 350000,
    requirements: [],
    privileges: [],
    publishedAt: "2026-03-19T10:00:00Z",
    createdAt: "2026-03-19T10:00:00Z",
    updatedAt: "2026-03-21T09:00:00Z",
    isUrgent: false,
    statusId: 5, // COMPLETED
    estimatedHours: 8,
    workload: "50kg",
  }
];

export const DEMO_APPLICATIONS: JobApplicationDTO[] = [
  {
    id: "app-1001",
    jobPostId: "101",
    worker: DEMO_WORKER_PROFILE,
    workerId: "demo-worker-123",
    statusId: 1, // Pending
    coverLetter: "Tôi muốn ứng tuyển công việc này.",
    appliedAt: "2026-03-21T15:00:00Z",
    respondedAt: "0001-01-01T00:00:00Z",
    responseMessage: null,
    locationName: null
  },
  {
    id: "app-301",
    jobPostId: "301",
    worker: DEMO_WORKER_PROFILE,
    workerId: "demo-worker-123",
    statusId: 2, // Accepted
    coverLetter: "Tôi có kinh nghiệm tưới vườn cam.",
    appliedAt: "2026-03-22T07:00:00Z",
    respondedAt: "2026-03-22T08:00:00Z",
    responseMessage: "Hoan nghênh bạn!",
    locationName: null
  },
  {
    id: "app-501",
    jobPostId: "501",
    worker: DEMO_WORKER_PROFILE,
    workerId: "demo-worker-123",
    statusId: 2, // Accepted
    coverLetter: "Nhóm tôi có sẵn máy gặt.",
    appliedAt: "2026-03-23T08:00:00Z",
    respondedAt: "2026-03-23T09:00:00Z",
    responseMessage: "Chốt nhé!",
    locationName: null
  },
  {
    id: "app-completed-1",
    jobPostId: "completed-job-1",
    worker: DEMO_WORKER_PROFILE,
    workerId: "demo-worker-123",
    statusId: 2, // Accepted
    coverLetter: "Tôi có thể làm tốt việc này.",
    appliedAt: "2026-03-19T08:00:00Z",
    respondedAt: "2026-03-19T09:00:00Z",
    responseMessage: "Cảm ơn bạn đã làm việc!",
    locationName: null
  },
  {
    id: "app-rejected-1",
    jobPostId: "101",
    worker: DEMO_WORKER_PROFILE,
    statusId: 3, // Rejected
    coverLetter: "Tôi muốn thử sức.",
    appliedAt: "2026-03-18T10:00:00Z",
    respondedAt: "2026-03-18T11:00:00Z",
    responseMessage: "Rất tiếc, đã đủ người.",
    locationName: null
  }
];

export const DEMO_JOB_DETAILS: JobDetailDTO[] = [
  {
    id: "detail-1",
    jobApplicationId: "app-301",
    jobPostId: "301",
    workerId: "demo-worker-123",
    statusId: 2, // Reported
    workDate: "2026-03-23T00:00:00Z",
    workerDescription: "Đã tưới xong vườn cam khu A.",
    jobPrice: 150000,
    createdAt: "2026-03-23T10:30:00Z",
  },
  {
    id: "detail-completed-1",
    jobApplicationId: "app-completed-1",
    jobPostId: "completed-job-1",
    workerId: "demo-worker-123",
    statusId: 3, // Confirmed (by farmer)
    workDate: "2026-03-20T00:00:00Z",
    workerDescription: "Đã hái xong 50kg cà phê.",
    jobPrice: 350000,
    createdAt: "2026-03-20T17:30:00Z",
  }
];

export const DEMO_WALLET = {
  id: "wallet-123",
  workerProfileId: "demo-worker-123",
  balance: 1250000,
  escrowBalance: 450000,
  currency: "VND",
  updatedAt: "2026-03-26T10:00:00Z"
};

export const DEMO_TRANSACTIONS = [
  { id: 1, walletId: "wallet-123", type: 3, amount: 250000, description: "Thu hoạch lúa", date: "2026-01-20T08:00:00Z", status: "completed", jobTitle: "Thu hoạch lúa - Nguyễn Văn A" },
  { id: 2, walletId: "wallet-123", type: 5, amount: 200000, description: "Chăm sóc vườn cam", date: "2026-01-19T09:00:00Z", status: "pending", jobTitle: "Chăm sóc vườn cam - Trần Thị B" },
  { id: 3, walletId: "wallet-123", type: 2, amount: 500000, description: "Rút tiền về VNPay", date: "2026-01-18T10:00:00Z", status: "completed" },
  { id: 4, walletId: "wallet-123", type: 3, amount: 180000, description: "Làm đất trồng rau", date: "2026-01-17T08:00:00Z", status: "completed", jobTitle: "Làm đất trồng rau - Phạm Thị D" },
  { id: 5, walletId: "wallet-123", type: 5, amount: 250000, description: "Phun thuốc sâu", date: "2026-01-16T14:00:00Z", status: "processing", jobTitle: "Phun thuốc sâu - Lê Văn C" },
];
