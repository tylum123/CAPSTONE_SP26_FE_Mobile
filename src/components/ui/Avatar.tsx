import React from "react";
import { View, Image, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SHADOWS } from "../../constants/theme";

interface AvatarProps {
  source?: { uri: string } | number;
  fallback?: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({
  source,
  fallback = "?",
  size = 40,
  style,
}: AvatarProps) {
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1,
    borderColor: COLORS.slate[100],
  };

  const fallbackStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: COLORS.emerald[500],
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image source={source} style={imageStyle} resizeMode="cover" />
      ) : (
        <View style={fallbackStyle}>
          <Text style={[styles.fallbackText, { fontSize: size / 2.5 }]}>
            {fallback}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  fallbackText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});
