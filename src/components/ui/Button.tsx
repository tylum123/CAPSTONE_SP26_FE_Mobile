import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  Animated,
  Platform,
  ViewStyle,
} from "react-native";

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

const variantStyles = {
  default: {
    container: "bg-primary-600 overflow-hidden",
    text: "text-white",
    shadow: Platform.select({
      ios: {
        shadowColor: "#047857",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      },
      android: { elevation: 0 },
    }),
  },
  outline: {
    container: "bg-transparent border border-primary-600 overflow-hidden",
    text: "text-primary-600",
    shadow: {},
  },
  ghost: {
    container: "bg-primary-50 overflow-hidden",
    text: "text-primary-700",
    shadow: {},
  },
  danger: {
    container: "bg-rose-500 overflow-hidden",
    text: "text-white",
    shadow: {},
  },
};

const sizeStyles = {
  sm: { container: "px-3.5 py-2 min-h-[38px] rounded-xl", text: "text-[13px]" },
  md: { container: "px-5 py-3.5 min-h-[50px] rounded-2xl", text: "text-[15px]" },
  lg: { container: "px-7 py-4 min-h-[56px] rounded-[20px]", text: "text-base" },
};

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

  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  // Tách các style liên quan đến layout để apply vào wrapper
  const flatStyle = style ? (Array.isArray(style) ? Object.assign({}, ...style) : style) : {};
  const { 
    flex, margin, marginTop, marginBottom, marginLeft, marginRight, 
    marginHorizontal, marginVertical, alignSelf, flexGrow, flexShrink,
    width, height, position, top, bottom, left, right,
    ...contentStyle 
  } = flatStyle;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        fullWidth && { alignSelf: "stretch" },
        { flex, margin, marginTop, marginBottom, marginLeft, marginRight, marginHorizontal, marginVertical, alignSelf, flexGrow, flexShrink, width, height, position, top, bottom, left, right },
        vStyle.shadow,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        hitSlop={4}
        className={[
          "items-center justify-center flex-row",
          vStyle.container,
          sStyle.container,
          fullWidth ? "self-stretch" : "",
          disabled || loading ? "opacity-45" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={contentStyle}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "default" ? "#ffffff" : "#059669"}
          />
        ) : (
          <Text
            className={[
              "font-bold tracking-tight text-center",
              vStyle.text,
              sStyle.text,
            ].join(" ")}
          >
            {children}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
