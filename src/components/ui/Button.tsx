import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
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
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 2,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 2,
    }).start();
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && { alignSelf: "stretch" },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        hitSlop={4}
        style={({ pressed }) =>
          [
            styles.base,
            styles[variant],
            styles[`size_${size}`],
            fullWidth && styles.fullWidth,
            (disabled || loading) && styles.disabled,
            pressed && styles.pressed,
            style,
          ].filter(Boolean) as ViewStyle[]
        }
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "default" ? COLORS.white : COLORS.emerald[600]}
          />
        ) : (
          <Text
            style={
              [
                styles.text,
                styles[`text_${variant}`],
                styles[`textSize_${size}`],
              ] as TextStyle[]
            }
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: "row",
    overflow: "hidden",
  },
  /* Variants */
  default: {
    backgroundColor: COLORS.emerald[600],
    // Only iOS shadow — no elevation to avoid Android border artifact
    ...Platform.select({
      ios: {
        shadowColor: COLORS.emerald[700],
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.emerald[600],
  },
  ghost: {
    backgroundColor: COLORS.emerald[50],
  },
  danger: {
    backgroundColor: COLORS.rose[500],
  },
  /* Sizes */
  size_sm: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    minHeight: 38,
    borderRadius: BORDER_RADIUS.md,
  },
  size_md: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 50,
  },
  size_lg: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    minHeight: 56,
    borderRadius: BORDER_RADIUS.xl,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.88,
  },
  /* Text */
  text: {
    fontWeight: "700",
    letterSpacing: 0.1,
    textAlign: "center",
  },
  text_default: {
    color: COLORS.white,
  },
  text_outline: {
    color: COLORS.emerald[600],
  },
  text_ghost: {
    color: COLORS.emerald[700],
  },
  text_danger: {
    color: COLORS.white,
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 16,
  },
});
