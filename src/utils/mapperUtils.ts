/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Core React Native utility, navigation, state, or hook logic.
 * Rule: DO NOT modify existing code logic.
 */
import { JobPostDTO, JobApplicationDTO, JobDiscoveryDTO } from "../types/define_worker_interfaces";

/**
 * Utility for mapping backend DTOs to UI-friendly objects.
 */

export const mapJobPostToUI = (job: JobPostDTO | JobDiscoveryDTO) => {
  const formatDateStr = (d: string | undefined) => (d && !d.startsWith("0001")) ? new Date(d).toLocaleDateString("vi-VN") : "N/A";
  
  // Cast to JobDiscoveryDTO if it has discovery fields
  const discovery = job as JobDiscoveryDTO;
  const distance = discovery.distanceKm !== undefined ? discovery.distanceKm.toFixed(1) : "";
  const matchScore = discovery.matchScore !== undefined ? discovery.matchScore : null;

  // Clean description if it contains redundant "Requirements" or "Privileges" labels
  let cleanDescription = job.description || "";
  const separators = ["Yêu cầu:", "Yêu cầu công việc:", "Quyền lợi:", "Quyền lợi người lao động:"];
  for (const sep of separators) {
    if (cleanDescription.includes(sep)) {
      cleanDescription = cleanDescription.split(sep)[0].trim();
    }
  }

  const timeRange = (job.startTime && job.endTime) ? `${job.startTime.substring(0, 5)} - ${job.endTime.substring(0, 5)}` : "";
  const duration = job.estimatedHours ? `${job.estimatedHours} giờ` : (timeRange || "Thỏa thuận");

  const fProfile = job.farmerProfile || job.farmer;

  return {
    ...job,
    description: cleanDescription,
    farmer: { 
      id: job.farmerProfileId,
      userId: fProfile?.userId || (job as any).farmerUserId || null,
      name: fProfile?.contactName || (job.contactName && job.contactName !== "string" ? job.contactName : "Chủ nông trại"), 
      avatar: fProfile?.avatarUrl || (job as any).farmerAvatarUrl || (job as any).farmerAvatar || (job as any).avatarUrl || null, 
      rating: fProfile?.averageRating || (discovery as any).farmerAverageRating || 0, 
      totalJobs: fProfile?.totalJobsPosted || fProfile?.totalJobsCompleted || (discovery as any).similarJobsCompleted || 0 
    },
    location: { 
      address: job.address || "Chưa cập nhật địa chỉ", 
      distance: parseFloat(distance)
    },
    matchScore: matchScore,
    wage: job.wageAmount || 0,
    wageTypeId: job.jobTypeId === 1 ? "Khoán" : "Ngày",
    wageUnit: job.jobTypeId === 1 ? "" : " /ngày",
    startDateFormatted: formatDateStr(job.startDate),
    endDateFormatted: formatDateStr(job.endDate),
    startDate: formatDateStr(job.startDate),
    endDate: formatDateStr(job.endDate),
    date: formatDateStr(job.startDate),
    time: job.jobTypeId === 1 ? "Khoán" : (timeRange || "07:00 - 17:00"),
    duration: duration,
    workload: job.workload || "Thỏa thuận",
    requiredWorkers: job.workersNeeded || 0,
    appliedWorkers: job.workersAccepted || 0,
    requiredSkills: job.jobSkillRequirements?.length > 0 ? job.jobSkillRequirements.map(s => s.name).join(", ") : "Nông nghiệp",
    genderPreference: "Không yêu cầu",
    ageRequirement: "18-50",
    paymentMethodId: "Tiền mặt",
    jobType: "Nông nghiệp",
    urgent: job.isUrgent || false,
    requiredTools: Array.isArray(job.requirements) ? job.requirements : [],
    providedTools: Array.isArray(job.privileges) ? job.privileges : [],
  };
};

export const mapApplicationToUI = (app: JobApplicationDTO, job?: JobPostDTO) => {
  const startDate = job?.startDate;
  const formattedDate = (startDate && !startDate.startsWith("0001")) 
    ? new Date(startDate).toLocaleDateString("vi-VN") 
    : "Chưa rõ";

  const fProfile = job?.farmerProfile || job?.farmer;

  return {
    ...app,
    title: job?.title || "Công việc",
    farmer: fProfile?.contactName || (job?.contactName && job.contactName !== "string" ? job.contactName : "Chủ nông trại"),
    farmerId: job?.farmerProfileId,
    farmerUserId: fProfile?.userId || (job as any)?.farmerUserId || null,
    farmerAvatar: fProfile?.avatarUrl || "https://i.pravatar.cc/150?img=1",
    date: formattedDate,
    time: job?.jobTypeId === 1 ? "Khoán" : (job?.estimatedHours ? `${job.estimatedHours} giờ` : "N/A"),
    status: app.statusId === 1 ? "pending" : app.statusId === 3 ? "rejected" : "accepted"
  };
};
