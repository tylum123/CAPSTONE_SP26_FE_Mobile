/* AI CONTEXT:
 * Action: Renders the top hero section of a job detail.
 * Inputs: Job detail data containing title, location, dates, and wages.
 * Outputs: UI block with badges and main job overview.
 * Dependencies: Badge component, Lucide icons. */

import React from "react";
import { View, Text } from "react-native";
import { Calendar, Banknote } from "lucide-react-native";
import { Badge } from "../ui/Badge";
import { isPastEndDateWithGrace } from "../../utils/provide_formatting_helpers";

export function RenderJobHeader({ jobDetail }: { jobDetail: any }) {
  if (!jobDetail) return null;

  const isExpired = isPastEndDateWithGrace(jobDetail.endDate || jobDetail.startDate);
  // Status checked: 1=Draft, 2=Published, 3=Closed, 4=InProgress, 5=Completed, 6=Cancelled
  const isInProgressButExpired = isExpired && jobDetail.statusId === 4;

  const getCategoryVariant = (categoryName: string): any => {
    if (!categoryName) return "secondary";
    const name = categoryName.toLowerCase();
    if (name.includes("trồng trọt")) return "success";   // Green
    if (name.includes("chăn nuôi")) return "warning";   // Yellow/Orange
    if (name.includes("thủy hải sản")) return "info";   // Blue
    return "secondary";
  };

  const categoryVariant = getCategoryVariant(jobDetail.jobType);

  return (
    <View className="bg-white rounded-[20px] p-6 mb-4 border border-slate-100" style={{ shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row gap-2">
          {jobDetail.jobType ? (
            <Badge variant={jobDetail.urgent ? "danger" : categoryVariant}>
              {jobDetail.urgent ? "Cần gấp" : jobDetail.jobType}
            </Badge>
          ) : null}
          {isInProgressButExpired && (
            <Badge variant="warning">Quá hạn báo cáo</Badge>
          )}
          {jobDetail.statusId === 5 && (
            <Badge variant="info">✓ Đã hoàn thành</Badge>
          )}
        </View>
      </View>
      <Text className="text-[22px] font-extrabold text-slate-900 mb-1" style={{ letterSpacing: -0.4 }}>{jobDetail.title}</Text>
      <Text className="text-[13px] text-slate-500 mb-4">{jobDetail.location?.address}</Text>
      <View className="flex-row items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
        <Calendar size={18} color="#64748b" />
        <View>
          <Text className="text-[10px] text-slate-400 uppercase font-bold" style={{ letterSpacing: 0.5 }}>Ngày làm việc</Text>
          <Text className="text-[14px] text-slate-700 font-bold">{jobDetail.startDate} - {jobDetail.endDate || jobDetail.startDate}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2 bg-primary-50 rounded-2xl p-4 border border-primary-100">
        <View className="flex-row items-center gap-2">
          <Banknote size={20} color="#059669" />
          <Text className="text-[28px] font-extrabold text-primary-700" style={{ letterSpacing: -0.5 }}>
            {jobDetail.wage?.toLocaleString("vi-VN")}<Text className="text-lg font-semibold"> đ</Text>
          </Text>
        </View>
        {jobDetail.wageTypeId?.toLowerCase() === "ngày" && (
          <Text className="text-sm text-slate-500">/ ngày</Text>
        )}
      </View>
    </View>
  );
}
