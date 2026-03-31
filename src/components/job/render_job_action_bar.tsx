/* AI CONTEXT:
 * Action: Renders the sticky bottom action bar for the job detail.
 * Inputs: Job detail data, insets, submission/app state, press handlers.
 * Outputs: View with predicted salary and Apply/Report buttons.
 * Dependencies: Button component, date helpers, Lucide icons. */

import React from "react";
import { View, Text } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { Button } from "../ui/Button";
import { isPastDate } from "../../utils/provide_formatting_helpers";

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
      
      {(applicationInfo.statusId === 2 && !jobDetail.timeSlots?.find((s: any) => s.date === new Date().toLocaleDateString("vi-VN") && s.reportedAt)) ? (
        <Button 
          onPress={onReportPress}
          size="lg"
          variant="default"
          disabled={isPastDate(jobDetail.endDate || jobDetail.startDate)}
        >
          <View className="flex-row items-center gap-2">
            <CheckCircle size={18} color="white" />
            <Text className="text-white font-bold">Nộp Báo Cáo</Text>
          </View>
        </Button>
      ) : applicationInfo.statusId === 2 ? (
        <View className="bg-primary-50 px-4 py-2 rounded-xl border border-primary-100">
          <Text className="text-primary-700 font-bold text-center">Đã báo cáo hôm nay ✓</Text>
        </View>
      ) : (
        <Button 
          onPress={onApplyPress} 
          disabled={isApplied || isSubmitting || (jobDetail.wageTypeId !== "Khoán" && selectedTimeSlots.length === 0)} 
          size="lg"
          variant={isApplied ? "ghost" : "default"}
        >
          {isSubmitting ? "Đang gửi..." : isApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"}
        </Button>
      )}
    </View>
  );
}
