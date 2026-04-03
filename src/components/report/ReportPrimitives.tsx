/* AI CONTEXT:
 * Atomic primitives reused by report sub-components.
 * Rule: No business logic — pure presentational. */

import React from "react";
import { View, Text } from "react-native";

// ─── SectionCard ──────────────────────────────────────────────────────────────

export function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        ...style,
      }}
    >
      {children}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({
  icon,
  title,
  color = "#0f172a",
}: {
  icon: React.ReactNode;
  title: string;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {icon}
      <Text style={{ fontSize: 15, fontWeight: "700", color }}>{title}</Text>
    </View>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text style={{ fontSize: 13, color: "#64748b" }}>{label}</Text>
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#0f172a",
          maxWidth: "55%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── ApprovalProgressBar ──────────────────────────────────────────────────────

export function ApprovalProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const barColor =
    clamped >= 80 ? "#059669" : clamped >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <View style={{ marginTop: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: "#64748b" }}>Mức độ hoàn thành</Text>
        <Text style={{ fontSize: 20, fontWeight: "800", color: barColor }}>{clamped}%</Text>
      </View>
      <View
        style={{ height: 10, backgroundColor: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}
      >
        <View
          style={{
            width: `${clamped}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: 99,
          }}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={{ fontSize: 11, color: "#94a3b8" }}>0%</Text>
        <Text style={{ fontSize: 11, color: "#94a3b8" }}>100%</Text>
      </View>
    </View>
  );
}
