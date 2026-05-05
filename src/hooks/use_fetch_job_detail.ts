/* AI CONTEXT:
 * Action: Manages states and fetches details for a specific farming job.
 * Inputs: Job ID, auth status, user data.
 * Outputs: Loading states, job detail, application status, selected time slots, and refresh functions.
 * Dependencies: jobService, workerProfileService, reportService, Demo Data. */

import { useState, useCallback, useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { jobService, workerProfileService, dailyReportService, messageService } from "../services/export_services";
import { DEMO_JOB_POSTS, DEMO_APPLICATIONS, DEMO_WORKER_PROFILE, DEMO_CATEGORIES } from "../constants/demoData";
import { mapJobPostToUI } from "../utils/mapperUtils";
import { handleError } from "../utils/errorHandler";

export function useFetchJobDetail(jobId: string | number, isAuthenticated: boolean, user: any) {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationInfo, setApplicationInfo] = useState<{ 
    id?: string; 
    statusId?: number; 
    responseMessage?: string | null;
    workDates?: string[];
  }>({});
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [jobDetail, setJobDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobData = useCallback(async () => {
    setIsLoading(true);
    let sourceJob: any = null;
    let sourceApps: any[] = [];
    let sourceProfile: any = null;

    if (!isAuthenticated || user?.isDemo) {
      sourceJob = DEMO_JOB_POSTS.find((j: any) => String(j.id) === String(jobId));
      sourceApps = DEMO_APPLICATIONS;
      sourceProfile = DEMO_WORKER_PROFILE;
    } else {
      try {
        const [data, apps, profile, categories] = await Promise.all([
          jobService.getJobPostDetail(String(jobId)),
          jobService.getApplications(),
          workerProfileService.getProfile(),
          jobService.getCategories()
        ]);
        sourceJob = data;
        sourceApps = apps;
        sourceProfile = profile;
        
        if (sourceJob?.jobCategoryId && categories) {
          const cat = categories.find((c: any) => String(c.id) === String(sourceJob.jobCategoryId));
          if (cat) sourceJob.jobCategoryName = cat.name;
        }

        // NOTE: chat partner resolution is deferred until after reports are fetched,
        // because JobPostDTO does not include farmer.userId — only reports (JobDetailResponseDTO) do.
      } catch (error) {
        handleError(error, "Không thể tải thông tin công việc.");
        setJobDetail(null);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }
    }

    if (sourceJob) {
      // Resolve category name for demo mode too
      if (user?.isDemo || !isAuthenticated) {
        const cat = DEMO_CATEGORIES.find(c => String(c.id) === String(sourceJob.jobCategoryId));
        if (cat) sourceJob.jobCategoryName = cat.name;
      }

      const existing = sourceApps.find((a: any) => 
        String(a.jobPostId) === String(jobId) && 
        (a.worker?.id === sourceProfile?.id || (a as any).workerId === sourceProfile?.id)
      );

      if (existing && existing.statusId !== 3 && existing.statusId !== 4) {
        setIsApplied(true);
        setApplicationInfo({ 
          id: existing.id, 
          statusId: existing.statusId, 
          responseMessage: existing.responseMessage,
          workDates: existing.workDates
        });
        // Pre-populate selected slots from existing application
        if (existing.workDates && existing.workDates.length > 0) {
          // Normalize to YYYY-MM-DD for consistent internal state
          setSelectedTimeSlots(existing.workDates.map((d: string) => d.substring(0, 10)));
        }
      } else {
        setIsApplied(false);
        setApplicationInfo({});
        setSelectedTimeSlots([]);
      }

      // Fetch Reports for this job (JobDetailResponseDTO includes farmer with avatarUrl, userId)
      let reports: any[] = [];
      let reportFarmer: any = null;
      try {
        if (isAuthenticated && !user?.isDemo && sourceProfile?.id) {
          const allWorkerReports = await dailyReportService.getWorkerReports(sourceProfile.id);
          reports = (allWorkerReports || []).filter(r => 
            String(r.jobPostId).toLowerCase() === String(jobId).toLowerCase()
          );
          // Extract farmer data from the first report that has it
          const reportWithFarmer = reports.find(r => r.farmer);
          if (reportWithFarmer?.farmer) {
            reportFarmer = reportWithFarmer.farmer;
          }
        } else if (user?.isDemo || !isAuthenticated) {
          // Mock some reports for demo
          reports = [
            { id: "r1", workDate: "2026-03-22T08:00:00Z", farmerApprovedPercent: 100, workerPaymentAmount: 250000, farmerFeedback: "Làm tốt lắm!" },
            { id: "r2", workDate: "2026-03-23T08:00:00Z", farmerApprovedPercent: 80, workerPaymentAmount: 200000, farmerFeedback: "Cần chú ý hơn phần làm cỏ." }
          ];
        }
      } catch (err) {
        // Silently ignore report fetch errors
      }

      // Fallback: if worker has no reports with farmer data, try fetching ANY report for this job post
      // GET /job/detail/post/{jobPostId} returns reports from all workers — farmer info is the same
      if (!reportFarmer && isAuthenticated && !user?.isDemo) {
        try {
          const jobPostReports = await dailyReportService.getReportsByJobPostId(String(jobId), 1, 1);
          const anyReport = (jobPostReports || []).find(r => r.farmer);
          if (anyReport?.farmer) {
            reportFarmer = anyReport.farmer;
          }
        } catch (err) {
          // Silently ignore — farmer avatar will just show fallback letter
        }
      }

      // Fetch latest message from farmer
      const farmerUserId = reportFarmer?.userId || sourceJob?.farmerProfile?.userId || sourceJob?.farmer?.userId || null;
      if (farmerUserId && isAuthenticated && !user?.isDemo) {
        try {
          const messages = await messageService.getMessages(farmerUserId, 1, 1);
          const msgList = Array.isArray(messages) ? messages : (messages?.data || messages?.items || []);
          if (msgList.length > 0) {
            setLastMessage(msgList[0]);
          }
        } catch (mErr) {
          // Silently ignore message fetch errors
        }
      }

      // Fetch enrollment counts per day
      let dayCounts: any[] = [];
      if (isAuthenticated && !user?.isDemo) {
        try {
          dayCounts = await jobService.getCountWorkerPerDay(String(jobId));
        } catch (err) {
          // Silently ignore day counts error
        }
      } else if (user?.isDemo || !isAuthenticated) {
        // Mock counts for demo
        dayCounts = (sourceJob.selectedDays || []).map((d: string, i: number) => ({
          date: d,
          acceptedWorkerCount: i % 3 === 0 ? sourceJob.workersNeeded : (i % 3 === 1 ? 1 : 0),
          neededWorkerCount: i % 2 === 0 ? sourceJob.workersNeeded : Math.max(1, sourceJob.workersNeeded - 2)
        }));
      }

      const mappedData = mapJobPostToUI(sourceJob);
      
      // Use jobPostDays if available (new response structure), otherwise fallback to manual construction
      let timeSlots = [];
      if (sourceJob.jobPostDays && sourceJob.jobPostDays.length > 0) {
        timeSlots = sourceJob.jobPostDays.map((day: any, index: number) => {
          const dateStr = day.workDate;
          const formattedSlotDate = new Date(dateStr).toLocaleDateString("vi-VN");
          const acceptedCount = day.workersAccepted || 0;
          const neededCount = day.workersNeeded || 0;
          const isFull = acceptedCount >= neededCount;

          return {
            id: index + 1,
            date: formattedSlotDate,
            rawDate: dateStr.substring(0, 10),
            available: !isFull,
            reportedAt: reports.find(r => r.workDate.includes(dateStr.substring(0, 10)))?.workDate,
            acceptedCount,
            neededCount
          };
        });
      } else if (sourceJob.jobTypeId !== 1) {
        // Fallback to legacy logic: use selectedDays + dayCounts
        timeSlots = (sourceJob.selectedDays || []).map((dateStr: string, index: number) => {
          const formattedSlotDate = new Date(dateStr).toLocaleDateString("vi-VN");
          const countData = dayCounts.find(c => c.date?.substring(0, 10) === dateStr.substring(0, 10));
          const acceptedCount = countData?.acceptedWorkerCount || 0;
          const neededCount = countData?.neededWorkerCount ?? sourceJob.workersNeeded ?? 0;
          const isFull = acceptedCount >= neededCount;

          return {
            id: index + 1,
            date: formattedSlotDate,
            rawDate: dateStr.substring(0, 10),
            available: !isFull,
            reportedAt: reports.find(r => r.workDate.includes(dateStr.substring(0, 10)))?.workDate,
            acceptedCount,
            neededCount
          };
        });
      }

      // Calculate worker range for Daily jobs
      if (sourceJob.jobTypeId !== 1) {
        let neededCounts: number[] = [];
        if (sourceJob.jobPostDays && sourceJob.jobPostDays.length > 0) {
          neededCounts = sourceJob.jobPostDays.map((d: any) => d.workersNeeded).filter((n: any) => n !== undefined);
        } else if (dayCounts.length > 0) {
          neededCounts = dayCounts.map(c => c.neededWorkerCount ?? sourceJob.workersNeeded).filter(n => n !== undefined);
        }

        if (neededCounts.length > 0) {
          const min = Math.min(...neededCounts);
          const max = Math.max(...neededCounts);
          if (min !== max) {
            mappedData.requiredWorkersRange = `${min} - ${max}`;
          }
        }
      }

      // Special case for backward compatibility or if selectedDays is empty for Daily jobs
      if (sourceJob.jobTypeId !== 1 && timeSlots.length === 0) {
        const firstDayCount = dayCounts.find(c => c.date?.substring(0, 10) === sourceJob.startDate?.substring(0, 10));
        const accepted = firstDayCount?.acceptedWorkerCount || 0;
        const needed = firstDayCount?.neededWorkerCount ?? sourceJob.workersNeeded ?? 0;

        timeSlots.push({
          id: 1,
          date: mappedData.startDateFormatted,
          rawDate: sourceJob.startDate,
          available: accepted < needed,
          reportedAt: reports.find(r => r.workDate.includes(sourceJob.startDate?.substring(0, 10)))?.workDate,
          acceptedCount: accepted,
          neededCount: needed
        });
      }

      // Enrich farmer info from report data (has avatarUrl, userId from JobDetailResponseDTO)
      const enrichedFarmer = reportFarmer ? {
        ...mappedData.farmer,
        userId: reportFarmer.userId || mappedData.farmer?.userId,
        name: reportFarmer.contactName || mappedData.farmer?.name,
        avatar: reportFarmer.avatarUrl || mappedData.farmer?.avatar,
        rating: reportFarmer.averageRating ?? mappedData.farmer?.rating,
        totalJobs: reportFarmer.totalJobsPosted ?? reportFarmer.totalJobsCompleted ?? mappedData.farmer?.totalJobs,
        totalJobsPosted: reportFarmer.totalJobsPosted ?? mappedData.farmer?.totalJobsPosted,
        totalJobsCompleted: reportFarmer.totalJobsCompleted ?? mappedData.farmer?.totalJobsCompleted,
      } : mappedData.farmer;

      const mapped = {
        ...mappedData,
        jobType: sourceJob.jobCategoryName || mappedData.jobType,
        farmer: enrichedFarmer,
        reports: reports.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()),
        timeSlots
      };
      setJobDetail(mapped as any);
    } else {
      setJobDetail(null);
    }
    
    setIsLoading(false);
    setRefreshing(false);
  }, [isAuthenticated, user?.isDemo, jobId]);

  useEffect(() => {
    loadJobData();
    
    // Auto-refresh when push notification is received in foreground
    const subscription = DeviceEventEmitter.addListener("REFRESH_DATA", () => {
      loadJobData();
    });
    return () => subscription.remove();
  }, [loadJobData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadJobData();
  };

  const toggleTimeSlot = (slotId: number) => {
    if (isApplied) return; // Cannot change selection after applying
    const slot = jobDetail?.timeSlots?.find((s: any) => s.id === slotId);
    if (!slot?.available) return;
    const key = String(slot.rawDate || slot.date).substring(0, 10);
    setSelectedTimeSlots((p: string[]) => p.some((s: string) => s.substring(0, 10) === key) 
      ? p.filter((s: string) => s.substring(0, 10) !== key) 
      : [...p, key]);
  };

  return {
    jobDetail,
    isLoading,
    refreshing,
    isApplied,
    setIsApplied,
    applicationInfo,
    selectedTimeSlots,
    setSelectedTimeSlots,
    lastMessage,
    loadJobData,
    onRefresh,
    toggleTimeSlot
  };
}
