import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { 
  Calendar, 
  MapPin, 
  User, 
  ChevronRight, 
  AlertCircle, 
  Sprout, 
  Grape, 
  Waves, 
  Trash2, 
  Hammer,
  Banknote
} from "lucide-react-native";
import { Badge } from "../ui/Badge";
import { JobDetailDTO, JobPostDTO } from "../../types/export_type_definitions";
import { JobStatus } from "../../constants/enums";
import { jobService } from "../../services/job.service";
import { canSubmitDispute } from "../../utils/disputeRules";

interface ReportHistoryCardProps {
  item: JobDetailDTO;
  onPress: () => void;
  onDispute: () => void;
}

export function ReportHistoryCard({ item, onPress, onDispute }: ReportHistoryCardProps) {
  const [jobPost, setJobPost] = useState<Partial<JobPostDTO> | null>(item.jobPost || null);
  const [loading, setLoading] = useState(!item.jobPost?.title);

  useEffect(() => {
    const fetchFullJob = async () => {
      // If we already have the title, we have enough for the card
      if (item.jobPost?.title) {
        setJobPost(item.jobPost);
        setLoading(false);
        return;
      }

      try {
        const fullJob = await jobService.getJobPostDetail(item.jobPostId);
        setJobPost(fullJob);
      } catch (error) {
        console.error("[ReportHistoryCard] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullJob();
  }, [item.jobPostId, item.jobPost]);

  const isApproved = item.statusId === JobStatus.Completed;
  const isPending = item.statusId === JobStatus.Reported;
  const isInProgress = item.statusId === JobStatus.InProgress;

  // Agricultural icon mapping based on common job types or titles
  const getIcon = () => {
    const title = jobPost?.title?.toLowerCase() || "";
    if (title.includes("thu hoạch") || title.includes("hái")) return <Grape size={20} color="#059669" />;
    if (title.includes("trồng") || title.includes("gieo")) return <Sprout size={20} color="#059669" />;
    if (title.includes("tưới") || title.includes("nước")) return <Waves size={20} color="#0284c7" />;
    if (title.includes("bón") || title.includes("phân")) return <Sprout size={20} color="#84cc16" />;
    if (title.includes("sửa") || title.includes("dựng")) return <Hammer size={20} color="#b45309" />;
    return <Sprout size={20} color="#059669" />;
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <View className="p-4">
        {/* Header: Date & Status */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <Calendar size={12} color="#64748b" />
            <Text className="text-[11px] font-bold text-slate-500 uppercase">
              {new Date(item.workDate).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>
          <Badge variant={isApproved ? "success" : isPending ? "secondary" : isInProgress ? "info" : "warning"}>
            {isApproved ? "Đã duyệt" : isPending ? "Chờ duyệt" : isInProgress ? "Đang làm" : "Khiếu nại"}
          </Badge>
        </View>

        {/* Content Body */}
        <View className="flex-row gap-3">
          <View className="w-12 h-12 rounded-xl bg-primary-50 items-center justify-center border border-primary-100">
            {loading ? <ActivityIndicator size="small" color="#059669" /> : getIcon()}
          </View>
          
          <View className="flex-1 justify-center">
            <Text className="text-[15px] font-extrabold text-slate-800 leading-tight mb-1" numberOfLines={1}>
              {loading ? "Đang tải thông tin..." : (jobPost?.title || "Báo cáo công việc")}
            </Text>
            
            <View className="flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <User size={12} color="#94a3b8" />
                <Text className="text-[12px] text-slate-500 font-medium" numberOfLines={1}>
                  {jobPost?.contactName || "Farmer"}
                </Text>
              </View>
              {jobPost?.address && (
                <View className="flex-row items-center gap-1 flex-1">
                  <MapPin size={12} color="#94a3b8" />
                  <Text className="text-[12px] text-slate-500 font-medium" numberOfLines={1}>
                    {jobPost.address}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Progress Section */}
        {item.farmerApprovedPercent !== undefined && (
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[10px] font-extrabold text-slate-400 uppercase">Tiến độ hoàn thành</Text>
              <Text className="text-[11px] font-extrabold text-primary-700">{item.farmerApprovedPercent}%</Text>
            </View>
            <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-primary-500" 
                style={{ width: `${Math.min(100, Math.max(0, item.farmerApprovedPercent))}%` }} 
              />
            </View>
          </View>
        )}

        {/* Footer: Financial & Actions */}
        <View className="mt-4 pt-3 border-t border-slate-50 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Banknote size={14} color="#059669" />
            <Text className="text-sm font-bold text-primary-600">
              {item.jobPrice?.toLocaleString("vi-VN")}đ
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {canSubmitDispute(item) && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  onDispute();
                }}
                className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 flex-row items-center gap-1"
              >
                <AlertCircle size={12} color="#e11d48" />
                <Text className="text-[11px] font-bold text-rose-600">Khiếu nại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
