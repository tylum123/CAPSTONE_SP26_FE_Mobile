/**
 * AI CONTEXT:
 * Action: Renders a compact card for a single dispute report entry.
 * Inputs: DisputeReportDTO object.
 * Outputs: Specialized UI component with status-based coloring.
 * Dependencies: DisputeReportDTO, Lucide Icon, View, Text. */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertCircle, Clock, CheckCircle2, XCircle, Calendar } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Badge } from "../ui/Badge";
import { Card, CardContent } from "../ui/Card";
import { DisputeReportDTO } from "../../types/export_type_definitions";

const STATUS_MAP: Record<number, { 
  label: string; 
  variant: "warning" | "secondary" | "success" | "danger"; 
  Icon: any; 
  color: string 
}> = {
  1: { label: "Chờ duyệt", variant: "warning", Icon: Clock, color: "#d97706" },
  2: { label: "Đang xem xét", variant: "secondary", Icon: AlertCircle, color: "#475569" },
  3: { label: "Đã giải quyết", variant: "success", Icon: CheckCircle2, color: "#059669" },
  4: { label: "Bị từ chối", variant: "danger", Icon: XCircle, color: "#dc2626" },
};

export function RenderDisputeCard({ dispute }: { dispute: DisputeReportDTO }) {
  const navigation = useNavigation<any>();
  const meta = STATUS_MAP[dispute.statusId] || { 
    label: "Không xác định", 
    variant: "secondary", 
    Icon: AlertCircle, 
    color: "#64748b" 
  };
  const StatusIcon = meta.Icon;

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => navigation.navigate("DisputeDetail", { dispute })}
    >
      <Card variant="elevated" className="mb-3 border border-slate-100 overflow-hidden">
      <View className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: meta.color }} />
      <CardContent className="pl-5 pb-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-full bg-slate-50 justify-center items-center">
              <StatusIcon size={16} color={meta.color} />
            </View>
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-tight">
              Mã khiếu nại: #{dispute.id.substring(0, 8).toUpperCase()}
            </Text>
          </View>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </View>

        {/* Content */}
        <Text className="text-[17px] font-bold text-slate-900 mb-2 leading-6" numberOfLines={2}>
          {dispute.reason}
        </Text>
        
        {dispute.description && (
          <Text className="text-[14px] text-slate-500 mb-4 leading-5" numberOfLines={2}>
            {dispute.description}
          </Text>
        )}

        <View className="h-px bg-slate-100 mb-3" />

        {/* Footer info */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={14} color="#94a3b8" />
            <Text className="text-[12px] text-slate-500 font-medium">
              {new Date(dispute.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          
          {dispute.resolvedAt && (
            <View className="flex-row items-center gap-1.5">
              <CheckCircle2 size={14} color="#059669" />
              <Text className="text-[12px] text-primary-600 font-bold">
                Xử lý: {new Date(dispute.resolvedAt).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
    </TouchableOpacity>
  );
}
