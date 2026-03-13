import React from "react";
import { View, Text, ViewStyle } from "react-native";
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
    <View className="items-center p-6 gap-2" style={style}>
      {icon ? <View className="mb-1">{icon}</View> : null}
      <Text className="text-base font-semibold text-slate-800 text-center">{title}</Text>
      {description ? (
        <Text className="text-[15px] text-slate-600 text-center mb-2">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button onPress={onAction} variant="outline" fullWidth>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}
