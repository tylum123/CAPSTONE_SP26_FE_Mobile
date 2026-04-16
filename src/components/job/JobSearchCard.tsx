/* AI CONTEXT:
 * Action: A reusable card component for displaying job search results.
 * Inputs: job (JobDiscoveryDTO), onPress (function).
 * Outputs: Rendered UI for a single job search result.
 * Dependencies: Avatar, Badge, Lucide Icons, JobDiscoveryDTO. */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, CheckCircle2, Clock } from "lucide-react-native";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { JobDiscoveryDTO } from "../../types/export_type_definitions";

interface JobSearchCardProps {
  job: JobDiscoveryDTO;
  onPress: (job: JobDiscoveryDTO) => void;
}

export function JobSearchCard({ job, onPress }: JobSearchCardProps) {
  return (
    <TouchableOpacity 
      className="mb-3 bg-white rounded-2xl flex-row overflow-hidden border border-slate-100" 
      style={{ 
        shadowColor: "#0f172a", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.06, 
        shadowRadius: 8, 
        elevation: 2 
      }} 
      activeOpacity={0.9} 
      onPress={() => onPress(job)}
    >
      <View className={["w-1.5", job.isUrgent ? "bg-rose-500" : "bg-primary-400"].join(" ")} />
      <View className="flex-1 p-4">
        <View className="flex-row items-center gap-3 mb-3">
          <Avatar fallback={job.contactName?.[0] || "?"} size={42} />
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-slate-800" numberOfLines={1}>{job.title}</Text>
            <Text className="text-xs text-slate-500">{job.contactName || "Chủ nông trại"}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[17px] font-extrabold text-primary-600">
              {(job.wageAmount || 0).toLocaleString("vi-VN")}₫
              {job.jobTypeId !== 1 && <Text className="text-[11px] text-slate-400 font-medium"> /ngày</Text>}
            </Text>
            {job.isUrgent && <Badge variant="danger">Cần gấp</Badge>}
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-3 bg-slate-50 rounded-xl px-3 py-2">
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color="#64748b" />
            <Text className="text-xs text-slate-600 font-medium" numberOfLines={1}>
              {job.distanceKm ? `${job.distanceKm.toFixed(1)} km` : (job.locationName || job.address || "Việt Nam")}
            </Text>
          </View>
          <View className="w-px h-3 bg-slate-200" />
          <View className="flex-row items-center gap-1.5">
            <CheckCircle2 size={14} color="#059669" />
            <Text className="text-xs text-primary-700 font-bold">
              {job.matchScore !== undefined && job.matchScore !== null 
                ? `${Math.round(job.matchScore > 1 ? job.matchScore : job.matchScore * 100)}% khớp` 
                : "Phù hợp"}
            </Text>
          </View>
          <View className="w-px h-3 bg-slate-200" />
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color="#64748b" />
            <Text className="text-xs text-slate-600 font-medium">
              {job.startTime && job.endTime 
                ? `${job.startTime.substring(0, 5)} - ${job.endTime.substring(0, 5)}` 
                : (job.estimatedHours ? `${job.estimatedHours}h` : "N/A")}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-1.5 flex-wrap">
          {job.jobSkillRequirements?.slice(0, 3).map((s: any) => (
            <Badge key={s.id} variant="secondary">{s.name}</Badge>
          ))}
          {(job.jobSkillRequirements?.length || 0) > 3 && (
            <Text className="text-[10px] text-slate-400 self-center">
              +{job.jobSkillRequirements.length - 3}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
