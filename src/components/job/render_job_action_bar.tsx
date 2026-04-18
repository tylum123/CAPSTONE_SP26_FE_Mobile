/* AI CONTEXT:
 * Action: Renders the sticky bottom action bar for the job detail.
 * Inputs: Job detail data, insets, submission/app state, press handlers.
 * Outputs: View with predicted salary and Apply/Report buttons.
 * Dependencies: Button component, date helpers, Lucide icons. */

import React from "react";
import { View, Text } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { Button } from "../ui/Button";
import { getReportButtonStatus } from "../../utils/jobRules";

type Props = {
  jobDetail: any;
  selectedTimeSlots: string[];
  isApplied: boolean;
  applicationInfo: any;
  insets: { bottom: number };
  isSubmitting: boolean;
  onReportPress: () => void;
  onApplyPress: () => void;
};

export function RenderJobActionBar({ jobDetail, selectedTimeSlots, isApplied, applicationInfo, insets, isSubmitting, onReportPress, onApplyPress }: Props) {
  if (!jobDetail) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isReportedToday = jobDetail.reports?.some((r: any) => r.workDate?.startsWith(todayStr));

  // Use centralized logic
  const btnStatus = getReportButtonStatus(
    jobDetail.startDate, 
    jobDetail.endDate, 
    jobDetail.statusId, 
    isReportedToday,
    applicationInfo.workDates
  );

  return (
    <View className="flex-row items-center gap-4 px-4 pt-4 bg-white border-t border-slate-100" style={{ paddingBottom: insets.bottom + 8, shadowColor: "#0f172a", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8 }}>
      <View className="flex-1">
        <Text className="text-xs text-slate-500">Thù lao dự kiến</Text>
        <Text className="text-[22px] font-extrabold text-primary-700">
          {(jobDetail.wage * (selectedTimeSlots.length || 1)).toLocaleString("vi-VN")} đ
        </Text>
        {selectedTimeSlots.length > 0 && (
          <Text className="text-xs text-slate-400">
            {selectedTimeSlots.length} khung giờ {isApplied ? "(Đã ứng tuyển)" : ""}
          </Text>
        )}
      </View>
      
      {applicationInfo.statusId === 2 ? (
        btnStatus.enabled ? (
          <Button 
            onPress={onReportPress}
            size="lg"
            variant="default"
            disabled={!btnStatus.enabled}
            className={btnStatus.variant === "reported" ? "bg-primary-50 border border-primary-100" : ""}
          >
            <View className="flex-row items-center gap-2">
              <CheckCircle size={18} color="white" />
              <Text 
                numberOfLines={1}
                adjustsFontSizeToFit
                className="font-bold text-white px-1"
              >
                {btnStatus.label}
              </Text>
            </View>
          </Button>
        ) : (
          <View className="bg-slate-100 border border-slate-200 px-6 py-4 rounded-[20px] items-center justify-center flex-row gap-2">
             <CheckCircle size={18} color="#94a3b8" />
             <Text 
               numberOfLines={1}
               adjustsFontSizeToFit
               className="text-slate-500 font-bold px-1"
             >
               {btnStatus.label}
             </Text>
          </View>
        )
      ) : (
        <Button 
          onPress={onApplyPress} 
          disabled={isApplied || isSubmitting || (jobDetail.wageTypeId !== "Khoán" && selectedTimeSlots.length === 0)} 
          size="lg"
          variant={isApplied ? "ghost" : "default"}
          className={isApplied ? "border border-primary-100" : ""}
        >
          <Text 
            numberOfLines={1} 
            adjustsFontSizeToFit 
            className={["font-bold", isApplied ? "text-primary-700" : "text-white"].join(" ")}
          >
            {isSubmitting ? "Đang gửi..." : isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
          </Text>
        </Button>
      )}
    </View>
  );
}
