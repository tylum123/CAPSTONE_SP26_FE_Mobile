/* AI CONTEXT:
 * Action: Handles the business logic for applying to a job.
 * Inputs: Job ID, auth context, selected time slots, job detail.
 * Outputs: Submitting state, feedback state, and apply handler.
 * Dependencies: jobService, DeviceEventEmitter. */

import { useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { jobService } from "../services/export_services";
import { handleError, handleSuccess } from "../utils/errorHandler";

export function useApplyForJob(
  jobId: string | number,
  isAuthenticated: boolean,
  user: any,
  jobDetail: any,
  selectedTimeSlots: string[],
  setIsApplied: (val: boolean) => void,
  onGoBack: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleQuickApply = async () => {
    if (!isAuthenticated || user?.isDemo) {
      if (selectedTimeSlots.length === 0) { handleError("Vui lòng chọn ít nhất một khung giờ"); return; }
      handleSuccess(`Đã apply mẫu thành công cho ${selectedTimeSlots.length} khung giờ!`);
      onGoBack();
      return;
    }

    setIsSubmitting(true);
    try {
      const isDailyJob = jobDetail?.timeSlots && jobDetail.timeSlots.length > 0;
      
      if (isDailyJob && selectedTimeSlots.length === 0) {
        handleError("Vui lòng chọn ít nhất một ngày làm việc.");
        setIsSubmitting(false);
        return;
      }

      // Ensure dates are sent as UTC-compliant ISO strings to avoid Npgsql timestamp kind exceptions
      const workDates = isDailyJob 
        ? selectedTimeSlots.map(date => date.includes('T') ? date : `${date}T00:00:00Z`)
        : [];

      await jobService.applyJob({
        jobPostId: String(jobId),
        statusId: 1, // Pending
        coverLetter: "Tôi rất mong muốn được nhận công việc này.",
        appliedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
        responseMessage: null,
        workDates: workDates,
      });
      setIsApplied(true);
      DeviceEventEmitter.emit("REFRESH_DATA");
      handleSuccess("Bạn đã gửi đơn ứng tuyển thành công. Vui lòng chờ phản hồi từ chủ nông trại.");
      onGoBack();
    } catch (error: any) {
      handleError(error, "Không thể gửi đơn ứng tuyển.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleQuickApply
  };
}
