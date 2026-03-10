import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS, BORDER_RADIUS, SPACING } from "../../constants/theme";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "secondary"
  | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const CONFIG: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: COLORS.emerald[50], text: COLORS.emerald[700] },
  success: { bg: COLORS.emerald[50], text: COLORS.emerald[700] },
  warning: { bg: COLORS.amber[50], text: COLORS.amber[600] },
  danger: { bg: COLORS.rose[50], text: COLORS.rose[500] },
  secondary: { bg: COLORS.slate[100], text: COLORS.slate[600] },
  info: { bg: COLORS.blue[50], text: COLORS.blue[600] },
};

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const cfg = CONFIG[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: cfg.bg, borderColor: cfg.text + "22" },
        style,
      ]}
    >
      <Text style={[styles.text, { color: cfg.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
