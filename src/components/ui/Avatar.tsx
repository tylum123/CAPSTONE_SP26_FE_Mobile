/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { View, Image, Text, ViewStyle } from "react-native";
import { COLORS } from "../../constants/theme";

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
  const dynamicStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View
      className="overflow-hidden shadow-sm"
      style={[dynamicStyle, style]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="items-center justify-center"
          style={[dynamicStyle, { backgroundColor: COLORS.primary[500] }]}
        >
          <Text
            className="text-white font-semibold"
            style={{ fontSize: size / 2.5 }}
          >
            {fallback}
          </Text>
        </View>
      )}
    </View>
  );
}
