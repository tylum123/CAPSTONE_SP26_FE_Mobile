import React from "react";
import { Pressable, View, Text, ViewStyle } from "react-native";
import { ChevronRight } from "lucide-react-native";

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
    <View className="flex-row items-center p-4 gap-2" style={style}>
      {leftSlot ? <View className="mr-2">{leftSlot}</View> : null}
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-800">{title}</Text>
        {subtitle ? <Text className="text-sm text-slate-600 mt-1">{subtitle}</Text> : null}
        {meta ? <Text className="text-[12px] font-medium text-slate-500 mt-1">{meta}</Text> : null}
      </View>
      <View className="ml-2">
        {rightSlot ?? <ChevronRight size={18} color="#94a3b8" />}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={["rounded-2xl", disabled ? "opacity-60" : ""].filter(Boolean).join(" ")}
      style={({ pressed }) => pressed ? { backgroundColor: "#f1f5f9" } : {}}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}
