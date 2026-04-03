/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Weather widget component for the home screen dashboard.
 * Rule: DO NOT modify existing code logic.
 */
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { CloudSun } from 'lucide-react-native';
import { WeatherDTO } from '../../types/export_type_definitions';

interface WeatherWidgetProps {
  weatherData: WeatherDTO | null;
  isLoading: boolean;
  locationStatus?: string | null;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  weatherData, 
  isLoading,
  locationStatus 
}) => {
  const getStatusMessage = () => {
    switch (locationStatus) {
      case "requesting_permission": return "Đang xin quyền vị trí...";
      case "fetching_location": return "Đang xác định vị trí...";
      case "fetching_weather": return "Đang tải thời tiết...";
      case "denied": return "Dùng vị trí mặc định";
      case "error_fallback": return "Lỗi, dùng vị trí mặc định";
      default: return "Cập nhật thời tiết";
    }
  };

  return (
    <View className="flex-row justify-between items-center bg-white/10 px-4 py-3 rounded-2xl border border-white/20 mb-3">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-white/20 justify-center items-center shadow-sm">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <CloudSun size={20} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
            {weatherData?.city || (isLoading ? "Đang tải..." : "Vị trí của bạn")}
          </Text>
          <Text className="text-white/80 font-medium text-xs mt-0.5 capitalize" numberOfLines={1}>
            {weatherData?.description || getStatusMessage()}
          </Text>
        </View>
      </View>
      <View className="flex-row items-start gap-1 ml-2">
        <Text className="text-white text-3xl font-black tracking-tighter">
          {weatherData?.temperature !== undefined ? Math.round(weatherData.temperature) : "--"}
        </Text>
        <Text className="text-white/80 text-xl font-bold mt-0.5">°C</Text>
      </View>
    </View>
  );
};
