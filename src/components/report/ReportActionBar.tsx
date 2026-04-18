/* AI CONTEXT:
 * Renders the bottom action bar: pending notice OR appeal section.
 * Extracted from ReportDetailScreen to enforce <250 line rule.
 * Props: isPending, isApproved, approvedPercent, isAppealing, onAppeal. */

import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Clock, Info } from "lucide-react-native";

interface Props {
  isPending: boolean;
  isApproved: boolean;
  approvedPercent: number;
  showDisputeButton?: boolean;
  isAppealing: boolean;
  onAppeal: () => void;
}

export function ReportActionBar({
  isPending,
  isApproved,
  approvedPercent,
  showDisputeButton,
  isAppealing,
  onAppeal,
}: Props) {
  if (isPending) {
    return (
      <View
        style={{
          backgroundColor: "#fffbeb",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#fde68a",
          padding: 16,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <Clock size={20} color="#b45309" style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#92400e", marginBottom: 4 }}>
            Đang chờ chủ nông trại duyệt
          </Text>
          <Text style={{ fontSize: 13, color: "#a16207", lineHeight: 20 }}>
            Báo cáo đã được gửi thành công. Bạn sẽ nhận được thông báo khi chủ nông trại xem xét và phê duyệt.
          </Text>
        </View>
      </View>
    );
  }

  if (showDisputeButton) {
    return (
      <View
        style={{
          backgroundColor: "#fff7ed",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#fed7aa",
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 14 }}>
          <Info size={18} color="#c2410c" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: "#9a3412", lineHeight: 20 }}>
            Nếu bạn cho rằng mức phê duyệt {approvedPercent}% không phản ánh đúng khối lượng
            công việc thực tế, bạn có thể gửi khiếu nại để admin xem xét lại.
          </Text>
        </View>
        <TouchableOpacity
          onPress={onAppeal}
          disabled={isAppealing}
          style={{
            borderWidth: 1.5,
            borderColor: "#ea580c",
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: isAppealing ? "#fff7ed" : "#fff",
          }}
        >
          {isAppealing ? (
            <ActivityIndicator size="small" color="#ea580c" />
          ) : (
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#ea580c" }}>
              Gửi khiếu nại kết quả
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
