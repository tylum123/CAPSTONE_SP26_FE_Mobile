import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from "../../constants/theme";

interface ListItemProps {
  title: string;
  subtitle?: string;
  meta?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function ListItem({
  title,
  subtitle,
  meta,
  leftSlot,
  rightSlot,
  onPress,
  style,
  disabled,
}: ListItemProps) {
  const content = (
    <View style={[styles.container, style]}>
      {leftSlot ? <View style={styles.left}>{leftSlot}</View> : null}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      <View style={styles.right}>
        {rightSlot ?? <ChevronRight size={18} color={COLORS.slate[400]} />}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: BORDER_RADIUS.lg,
  },
  pressed: {
    backgroundColor: COLORS.slate[100],
  },
  disabled: {
    opacity: 0.6,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  left: {
    marginRight: SPACING.sm,
  },
  body: {
    flex: 1,
  },
  right: {
    marginLeft: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.slate[800],
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.slate[600],
    marginTop: SPACING.xs,
  },
  meta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.slate[500],
    marginTop: SPACING.xs,
  },
});
