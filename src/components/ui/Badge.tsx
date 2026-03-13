import React from "react";
import { View, Text, ViewStyle } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "secondary" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

// Using inline style for dynamic border-color since Tailwind can't do hex+alpha dynamically
const CONFIG: Record<BadgeVariant, { container: string; text: string; borderColor: string }> = {
  default:   { container: "bg-primary-50",  text: "text-primary-700", borderColor: "#05966933" },
  success:   { container: "bg-primary-50",  text: "text-primary-700", borderColor: "#05966933" },
  warning:   { container: "bg-rice-50",     text: "text-rice-600",    borderColor: "#d9770633" },
  danger:    { container: "bg-rose-50",     text: "text-rose-500",    borderColor: "#f43f5e33" },
  secondary: { container: "bg-slate-100",   text: "text-slate-600",   borderColor: "#47556933" },
  info:      { container: "bg-blue-50",     text: "text-blue-600",    borderColor: "#2563eb33" },
};

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const cfg = CONFIG[variant];
  return (
    <View
      className={["px-2.5 py-0.5 rounded-full self-start border", cfg.container].join(" ")}
      style={[{ borderColor: cfg.borderColor }, style]}
    >
      <Text className={["text-[11px] font-bold tracking-wide", cfg.text].join(" ")}>
        {children}
      </Text>
    </View>
  );
}
