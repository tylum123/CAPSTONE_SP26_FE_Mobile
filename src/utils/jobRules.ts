import { isPastDate, isFutureDate, isPastEndDateWithGrace, isTodayInList } from "./provide_formatting_helpers";

export type ReportButtonStatus = {
  enabled: boolean;
  label: string;
  variant: "default" | "disabled" | "reported" | "future";
};

/**
 * Unified logic for determining the status of the "Submit Report" button.
 * Used by WorkerJobsScreen, RenderJobActionBar, and SubmitReportScreen (validation).
 */
export function getReportButtonStatus(
  startDate: string,
  endDate: string,
  statusId: number,
  isReportedToday: boolean,
  workDates?: string[]
): ReportButtonStatus {
  // If already reported today
  if (isReportedToday) {
    return {
      enabled: false,
      label: "Đã báo cáo",
      variant: "reported"
    };
  }

  // 1. If worker applied for specific dates (Daily Job), check if today is one of them
  if (workDates && workDates.length > 0) {
    const isWorkDayToday = isTodayInList(workDates);
    if (!isWorkDayToday) {
      // Check if it's a future work day
      const hasFutureWorkDays = workDates.some(d => isFutureDate(d));
      return {
        enabled: false,
        label: hasFutureWorkDays ? "Chưa tới ngày" : "Ngoài lịch làm",
        variant: "disabled"
      };
    }
  } else {
    // 2. Fallback to range logic (Khoán Job or missing slot info)
    if (isFutureDate(startDate)) {
      return {
        enabled: false,
        label: "Chưa tới ngày",
        variant: "future"
      };
    }

    const isExpired = isPastEndDateWithGrace(endDate || startDate, 1);
    if (isExpired) {
      return {
        enabled: false,
        label: "Hết hạn báo cáo",
        variant: "disabled"
      };
    }
  }

  // Status checked: 2=Published, 4=InProgress, 5=Completed
  if (statusId === 5) {
    return {
      enabled: false,
      label: "Hoàn thành",
      variant: "disabled"
    };
  }

  // Only allow reporting for active jobs
  const isActive = statusId === 2 || statusId === 4;
  if (!isActive) {
    return {
      enabled: false,
      label: "Không khả dụng",
      variant: "disabled"
    };
  }

  // If all checks pass
  return {
    enabled: true,
    label: "Báo cáo",
    variant: "default"
  };
}
