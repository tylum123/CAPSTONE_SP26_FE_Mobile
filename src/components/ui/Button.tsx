import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from "../../constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  onPress,
  children,
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={8}
      style={({ pressed }) => {
        const buttonStyles: ViewStyle[] = [
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ].filter(Boolean) as ViewStyle[];

        return buttonStyles;
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "default" ? COLORS.white : COLORS.emerald[600]}
        />
      ) : (
        <Text
          style={
            [
              styles.text,
              styles[`text_${variant}`],
              styles[`text_${size}`],
            ] as TextStyle[]
          }
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    minHeight: 48,
    ...SHADOWS.sm,
  },
  default: {
    backgroundColor: COLORS.emerald[600],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.emerald[600],
  },
  ghost: {
    backgroundColor: COLORS.emerald[50],
  },
  gradient: {
    backgroundColor: COLORS.emerald[700],
  },
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  size_md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  size_lg: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    ...SHADOWS.sm,
  },
  text: {
    fontWeight: "700",
  },
  text_default: {
    color: COLORS.white,
  },
  text_outline: {
    color: COLORS.emerald[600],
  },
  text_ghost: {
    color: COLORS.emerald[600],
  },
  text_gradient: {
    color: COLORS.white,
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
});
