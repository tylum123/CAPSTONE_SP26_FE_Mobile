/* AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Component: Interactive multiselect day picker for availability.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { COLORS } from "../../constants/theme";
import { DAYS } from "../../utils/scheduleUtils";

interface DayPickerProps {
  schedule: string;
  summary: string;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

export function DayPicker({ schedule, summary, onToggle, onSelectAll, onClear }: DayPickerProps) {
  const selected = schedule ? schedule.split(", ") : [];
  return (
    <View>
      <View className="flex-row justify-between mb-4 mt-2">
        {DAYS.map(day => {
          const isSelected = selected.includes(day.id);
          return (
            <TouchableOpacity
              key={day.id}
              onPress={() => onToggle(day.id)}
              className={["w-9 h-9 rounded-full items-center justify-center border", isSelected ? "bg-primary-600 border-primary-600" : "bg-white border-slate-200"].join(" ")}
            >
              <Text className={["text-[11px] font-extrabold", isSelected ? "text-white" : "text-slate-500"].join(" ")}>{day.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="flex-row items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <CheckCircle2 size={14} color={schedule ? COLORS.primary[600] : COLORS.slate[400]} />
          <Text className="text-[11px] text-slate-500 font-bold flex-1" numberOfLines={1}>{summary || "Chưa chọn ngày"}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={onSelectAll}>
            <Text className="text-[10px] text-primary-700 font-extrabold tracking-tight uppercase">Tất cả</Text>
          </TouchableOpacity>
          <View className="w-px h-3 bg-slate-300" />
          <TouchableOpacity onPress={onClear}>
            <Text className="text-[10px] text-rose-600 font-extrabold tracking-tight uppercase">Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
