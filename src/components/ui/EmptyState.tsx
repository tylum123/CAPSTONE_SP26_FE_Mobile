import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button onPress={onAction} variant="outline" fullWidth>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  icon: {
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.slate[800],
    textAlign: "center",
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate[600],
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
});
