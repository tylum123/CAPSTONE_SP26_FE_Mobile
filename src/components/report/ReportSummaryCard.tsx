/* AI CONTEXT:
 * Renders the top status banner + job info card + worker description + evidence images.
 * Extracted from ReportDetailScreen to enforce <250 line rule.
 * Props: data (JobDetailDTO), onImagePress callback. */

import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  ImageIcon,
  MapPin,
} from "lucide-react-native";
import { JobDetailDTO } from "../../types/export_type_definitions";
import { formatCurrency, formatDate, getStatusConfig } from "./report_helpers";
import { SectionCard, SectionHeader, InfoRow } from "./ReportPrimitives";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  data: JobDetailDTO;
  evidenceUrls: string[];
  onImagePress: (url: string) => void;
}

export function ReportSummaryCard({ data, evidenceUrls, onImagePress }: Props) {
  const statusConfig = getStatusConfig(data.statusId);

  return (
    <>
      {/* ── Status Banner ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: statusConfig.bg,
          borderWidth: 1,
          borderColor: statusConfig.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {statusConfig.icon}
          <Text style={{ fontSize: 13, fontWeight: "600", color: statusConfig.color }}>
            {statusConfig.label}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Calendar size={13} color={statusConfig.color} />
          <Text style={{ fontSize: 12, color: statusConfig.color }}>
            {formatDate(data.workDate)}
          </Text>
        </View>
      </View>

      {/* ── Job Info Card ── */}
      <SectionCard>
        <SectionHeader icon={<Briefcase size={17} color="#059669" />} title="Thông tin công việc" />
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 4 }}>
          {data.jobPost?.title || "Công việc chung"}
        </Text>
        {(data.jobPost?.contactName || data.jobPostId) ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: "#64748b" }}>Đối tác: </Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#334155" }}>
              {data.jobPost?.contactName || `ID: ${data.jobPostId.substring(0, 8)}...`}
            </Text>
          </View>
        ) : null}
        {data.jobPost?.address ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MapPin size={13} color="#94a3b8" />
            <Text style={{ fontSize: 13, color: "#64748b", flex: 1 }} numberOfLines={1}>
              {data.jobPost.address}
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MapPin size={13} color="#94a3b8" />
            <Text style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
              Địa chỉ chưa cập nhật
            </Text>
          </View>
        )}
        <View style={{ height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 }} />
        <InfoRow
          label="Ngày làm việc"
          value={formatDate(data.workDate)}
          icon={<Calendar size={14} color="#94a3b8" />}
        />
        {data.completedAt ? (
          <InfoRow
            label="Hoàn thành lúc"
            value={formatDate(data.completedAt)}
            icon={<CheckCircle size={14} color="#94a3b8" />}
          />
        ) : null}
        <InfoRow
          label="Đơn giá"
          value={formatCurrency(data.jobPrice)}
          icon={<DollarSign size={14} color="#94a3b8" />}
        />
      </SectionCard>

      {/* ── Worker Description ── */}
      <SectionCard>
        <SectionHeader icon={<FileText size={17} color="#3b82f6" />} title="Mô tả công việc của bạn" />
        <View
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            padding: 12,
            borderLeftWidth: 3,
            borderLeftColor: "#3b82f6",
          }}
        >
          <Text style={{ fontSize: 15, color: "#334155", lineHeight: 24 }}>
            {data.workerDescription || "Không có mô tả."}
          </Text>
        </View>
      </SectionCard>

      {/* ── Evidence Images ── */}
      {evidenceUrls.length > 0 && (
        <SectionCard>
          <SectionHeader
            icon={<ImageIcon size={17} color="#8b5cf6" />}
            title={`Hình ảnh minh chứng (${evidenceUrls.length})`}
          />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {evidenceUrls.map((url, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => onImagePress(url)}
                style={{
                  width: (SCREEN_WIDTH - 32 - 32 - 8) / 3,
                  aspectRatio: 1,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#f1f5f9",
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 8, textAlign: "center" }}>
            Nhấn vào ảnh để xem toàn màn hình
          </Text>
        </SectionCard>
      )}
    </>
  );
}
