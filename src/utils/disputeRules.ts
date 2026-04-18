import { JobDetailDTO } from "../types/define_worker_interfaces";
import { JobStatus } from "../constants/enums";

export const DISPUTE_THRESHOLD = 95;

/**
 * Business rule to determine if a report can be disputed.
 * Must be in 'Completed' status (Farmer has reviewed) and the approval percentage is below threshold.
 */
export const canSubmitDispute = (report: JobDetailDTO | null | undefined): boolean => {
  if (!report) return false;
  
  // Rule: Must be completed (approved) and percent < threshold (95)
  const isApproved = report.statusId === JobStatus.Completed; 
  const percent = report.farmerApprovedPercent ?? 100;
  
  return isApproved && percent < DISPUTE_THRESHOLD;
};
