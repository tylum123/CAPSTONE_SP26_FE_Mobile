/* AI CONTEXT:
 * Renders farmer feedback card + payment summary card (only when statusId === 2).
 * Extracted from ReportDetailScreen to enforce <250 line rule.
 * Props: data (JobDetailDTO), approvedPercent. */

import React from "react";
import { View, Text } from "react-native";
import { MessageSquare, DollarSign, Percent, TrendingUp } from "lucide-react-native";
import { JobDetailDTO } from "../../types/export_type_definitions";
import { formatCurrency } from "./report_helpers";
import { SectionCard, SectionHeader, InfoRow, ApprovalProgressBar } from "./ReportPrimitives";

interface Props {
  data: JobDetailDTO;
  approvedPercent: number;
}

export function ReportFeedbackCard({ data, approvedPercent }: Props) {
  const estimatedPayment =
    data.workerPaymentAmount ?? (data.jobPrice * approvedPercent) / 100;

  return (
    <>
      {/* ── Farmer Feedback ── */}
      <SectionCard style={{ borderColor: "#6ee7b7", backgroundColor: "#f0fdf4" }}>
        <SectionHeader
          icon={<MessageSquare size={17} color="#059669" />}
          title="Đánh giá từ chủ nông trại"
          color="#065f46"
        />
        {data.farmerFeedback ? (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              borderLeftWidth: 3,
              borderLeftColor: "#059669",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 14, color: "#334155", lineHeight: 22, fontStyle: "italic" }}>
              "{data.farmerFeedback}"
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 14, fontStyle: "italic" }}>
            Chủ nông trại không để lại nhận xét.
          </Text>
        )}
        <ApprovalProgressBar percent={approvedPercent} />
      </SectionCard>

      {/* ── Payment Summary ── */}
      <SectionCard style={{ borderColor: "#bae6fd", backgroundColor: "#f0f9ff" }}>
        <SectionHeader
          icon={<TrendingUp size={17} color="#0284c7" />}
          title="Tổng kết thanh toán"
          color="#0c4a6e"
        />
        <InfoRow
          label="Đơn giá ban đầu"
          value={formatCurrency(data.jobPrice)}
          icon={<DollarSign size={14} color="#94a3b8" />}
        />
        <InfoRow
          label="% Phê duyệt"
          value={`${approvedPercent}%`}
          icon={<Percent size={14} color="#94a3b8" />}
        />
        {data.refundAmount != null && data.refundAmount > 0 && (
          <InfoRow
            label="Hoàn tiền"
            value={formatCurrency(data.refundAmount)}
            icon={<DollarSign size={14} color="#f59e0b" />}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#bae6fd",
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#0c4a6e" }}>Thực nhận</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#059669" }}>
            {formatCurrency(estimatedPayment)}
          </Text>
        </View>
      </SectionCard>
    </>
  );
}
