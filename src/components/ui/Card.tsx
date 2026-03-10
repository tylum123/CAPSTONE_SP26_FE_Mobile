import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from "../../constants/theme";

type CardVariant = "default" | "elevated" | "flat" | "outline" | "tinted";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  variant?: CardVariant;
}

export function Card({ children, style, variant = "default" }: CardProps) {
  return (
    <View style={[styles.card, styles[`card_${variant}`], style]}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: CardProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardContent({ children, style }: CardProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  card_default: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  },
  card_elevated: {
    backgroundColor: COLORS.white,
    borderWidth: 0,
    ...SHADOWS.md,
  },
  card_flat: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  card_outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.emerald[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  card_tinted: {
    backgroundColor: COLORS.sage[50],
    borderWidth: 1,
    borderColor: COLORS.emerald[100],
    shadowOpacity: 0,
    elevation: 0,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate[100],
  },
  content: {
    padding: SPACING.md,
  },
});
