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
      userId: job.farmerUserId || fProfile?.userId || null,
      name: fProfile?.contactName || (job.contactName && job.contactName !== "string" ? job.contactName : "Chủ nông trại"), 
      avatar: fProfile?.avatarUrl || (job as any).farmerAvatarUrl || (job as any).farmerAvatar || (job as any).avatarUrl || null, 
      rating: fProfile?.averageRating || (discovery as any).farmerAverageRating || 0, 
      totalJobs: fProfile?.totalJobsPosted || fProfile?.totalJobsCompleted || (discovery as any).similarJobsCompleted || 0,
      totalJobsPosted: fProfile?.totalJobsPosted || 0,
      totalJobsCompleted: fProfile?.totalJobsCompleted || (discovery as any).similarJobsCompleted || 0
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
    thumbnailUrl: getCategoryThumbnail(job.jobCategoryId, job.title),
    time: job.jobTypeId === 1 ? "Khoán" : (timeRange || "07:00 - 17:00"),
    duration: duration,
    workload: job.workload || "Thỏa thuận",
    requiredWorkers: job.workersNeeded || 0,
    requiredWorkersRange: (job as any).workerCountPerDays?.length > 0 
      ? (() => {
          const counts = (job as any).workerCountPerDays.map((c: any) => c.neededWorkerCount).filter((n: any) => n !== undefined);
          if (counts.length === 0) return null;
          const min = Math.min(...counts);
          const max = Math.max(...counts);
          return min === max ? null : `${min} - ${max}`;
        })()
      : null,
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

export const getCategoryThumbnail = (categoryId?: string, title?: string): string => {
  const IMG_FARMING = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=600&auto=format&fit=crop"; // Lush agricultural farm
  const IMG_LIVESTOCK = "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600&auto=format&fit=crop"; // Farm animals
  const IMG_AQUACULTURE = "https://thiennhienmoitruong.vn/upload/images/btv/btv/btv/khanh-hoa.jpg"; // Aquaculture/fishing
  const IMG_DEFAULT = "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600&auto=format&fit=crop"; // Worker in field

  const t = title?.toLowerCase() || "";
  
  if (t.includes("nuôi") || t.includes("bò") || t.includes("heo") || t.includes("lợn") || t.includes("gà") || t.includes("vịt")) {
    return IMG_LIVESTOCK;
  }
  if (t.includes("thủy sản") || t.includes("cá") || t.includes("tôm") || t.includes("ao") || t.includes("lưới")) {
    return IMG_AQUACULTURE;
  }
  if (categoryId === 'cat-1' || categoryId === 'cat-2' || t.includes("trồng") || t.includes("thu hoạch") || t.includes("lúa") || t.includes("vườn") || t.includes("cây")) {
    return IMG_FARMING;
  }
  
  return IMG_DEFAULT;
};


export const mapApplicationToUI = (app: JobApplicationDTO, job?: JobPostDTO) => {
  const startDate = job?.startDate;
  const formattedDate = (startDate && !startDate.startsWith("0001")) 
    ? new Date(startDate).toLocaleDateString("vi-VN") 
    : "Chưa rõ";

  const fProfile = job?.farmerProfile || job?.farmer;
  
  const timeRange = (job?.startTime && job?.endTime) ? `${job.startTime.substring(0, 5)} - ${job.endTime.substring(0, 5)}` : "";
  const timeString = job?.jobTypeId === 1 ? "Khoán" : (job?.estimatedHours ? `${job.estimatedHours} giờ` : timeRange);

  return {
    ...app,
    title: job?.title || "Công việc",
    farmer: fProfile?.contactName || (job?.contactName && job.contactName !== "string" ? job.contactName : "Chủ nông trại"),
    farmerId: job?.farmerProfileId,
    farmerUserId: fProfile?.userId || (job as any)?.farmerUserId || null,
    farmerAvatar: fProfile?.avatarUrl || null,
    date: formattedDate,
    time: timeString,
    status: app.statusId === 1 ? "pending" : app.statusId === 3 ? "rejected" : "accepted",
    wage: job?.wageAmount?.toLocaleString('vi-VN') || 0,
    wageUnit: job?.jobTypeId === 1 ? "" : "/ngày",
    location: job?.address || "Chưa cập nhật địa chỉ",
    urgent: job?.isUrgent || false,
    thumbnailUrl: getCategoryThumbnail(job?.jobCategoryId, job?.title),
  };
};
