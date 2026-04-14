/* AI CONTEXT:
 * Shared utility helpers for report-related components.
 * Pure functions — no side effects, no imports of RN components (except icons). */

import React from "react";
import { Clock, CheckCircle, AlertTriangle, Info } from "lucide-react-native";

export const formatCurrency = (amount?: number): string => {
  if (amount == null) return "—";
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export interface StatusConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactElement;
}

export const getStatusConfig = (statusId: number): StatusConfig => {
  switch (statusId) {
    case 1:
      return {
        label: "Chờ duyệt",
        color: "#b45309",
        bg: "#fef3c7",
        border: "#fde68a",
        icon: React.createElement(Clock, { size: 14, color: "#b45309" }),
      };
    case 2:
      return {
        label: "Đã duyệt",
        color: "#065f46",
        bg: "#d1fae5",
        border: "#6ee7b7",
        icon: React.createElement(CheckCircle, { size: 14, color: "#065f46" }),
      };
    case 3:
      return {
        label: "Đang khiếu nại",
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#fed7aa",
        icon: React.createElement(AlertTriangle, { size: 14, color: "#9a3412" }),
      };
    default:
      return {
        label: "Không xác định",
        color: "#475569",
        bg: "#f1f5f9",
        border: "#cbd5e1",
        icon: React.createElement(Info, { size: 14, color: "#475569" }),
      };
  }
};
