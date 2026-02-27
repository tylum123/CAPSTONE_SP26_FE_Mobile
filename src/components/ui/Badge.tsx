import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS, BORDER_RADIUS, SPACING } from "../../constants/theme";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "secondary";
  style?: ViewStyle;
}

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const badgeStyles: ViewStyle[] = [
    styles.badge,
    styles[variant],
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
  ].filter(Boolean) as TextStyle[];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: "flex-start",
  },
  default: {
    backgroundColor: COLORS.emerald[50],
  },
  success: {
    backgroundColor: COLORS.emerald[50],
  },
  warning: {
    backgroundColor: COLORS.amber[400] + "20",
  },
  danger: {
    backgroundColor: COLORS.rose[500] + "20",
  },
  secondary: {
    backgroundColor: COLORS.gray[500] + "20",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  text_default: {
    color: COLORS.emerald[700],
  },
  text_success: {
    color: COLORS.emerald[700],
  },
  text_warning: {
    color: COLORS.amber[400],
  },
  text_danger: {
    color: COLORS.rose[500],
  },
  text_secondary: {
    color: COLORS.gray[600],
  },
});
