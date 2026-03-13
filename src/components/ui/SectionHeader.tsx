import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onPressAction,
  style,
}: SectionHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between px-4 mb-2"
      style={style}
    >
      <View className="flex-1">
        <Text className="text-xl font-bold text-slate-800">{title}</Text>
        {subtitle ? (
          <Text className="text-[15px] text-slate-600 mt-1">{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel && onPressAction ? (
        <TouchableOpacity onPress={onPressAction} hitSlop={8}>
          <Text className="text-base font-semibold text-primary-600">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
