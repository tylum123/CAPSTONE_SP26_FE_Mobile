/* AI CONTEXT:
 * Action: Handles the business logic for applying to a job.
 * Inputs: Job ID, auth context, selected time slots, job detail.
 * Outputs: Submitting state, feedback state, and apply handler.
 * Dependencies: jobService, DeviceEventEmitter. */

import { useState } from "react";
import { Alert, DeviceEventEmitter } from "react-native";
import { jobService } from "../services/export_services";

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
  const [feedback, setFeedback] = useState<{ visible: boolean; title: string; message: string; variant: "success" | "error" | "info"; onConfirm?: () => void }>({ visible: false, title: "", message: "", variant: "info" });

  const showFeedback = (params: { title: string; message: string; variant?: "success" | "error" | "info"; onConfirm?: () => void }) =>
    setFeedback({ visible: true, title: params.title, message: params.message, variant: params.variant || "info", onConfirm: params.onConfirm });
  const closeFeedback = () => { const cb = feedback.onConfirm; setFeedback((p) => ({ ...p, visible: false })); cb?.(); };

  const handleQuickApply = async () => {
    if (!isAuthenticated || user?.isDemo) {
      if (selectedTimeSlots.length === 0) { Alert.alert("Lỗi", "Vui lòng chọn ít nhất một khung giờ"); return; }
      Alert.alert("Thành công", `Đã apply mẫu thành công cho ${selectedTimeSlots.length} khung giờ!`);
      onGoBack();
      return;
    }

    setIsSubmitting(true);
    try {
      const isDailyJob = jobDetail?.timeSlots && jobDetail.timeSlots.length > 0;
      
      if (isDailyJob && selectedTimeSlots.length === 0) {
        Alert.alert("Thông báo", "Vui lòng chọn ít nhất một ngày làm việc.");
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
      Alert.alert("Thành công", "Đã gửi đơn ứng tuyển!");
      showFeedback({ 
        title: "Thành công", 
        message: "Bạn đã gửi đơn ứng tuyển thành công. Vui lòng chờ phản hồi từ farmer.", 
        variant: "success", 
        onConfirm: () => onGoBack() 
      });
    } catch (error: any) {
      console.error("Apply error:", error);
      const apiErrorMessage = error.response?.data?.message || "";
      Alert.alert("Lỗi", `Không thể gửi đơn ứng tuyển. ${apiErrorMessage}`.trim() || "Vui lòng thử lại.");
      showFeedback({ 
        title: "Lỗi ứng tuyển", 
        message: error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.", 
        variant: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    feedback,
    showFeedback,
    closeFeedback,
    handleQuickApply
  };
}
