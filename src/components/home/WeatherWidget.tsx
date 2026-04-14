/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Weather widget component for the home screen dashboard.
 */
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CloudSun, RefreshCw } from 'lucide-react-native';
import { WeatherDTO } from '../../types/export_type_definitions';

interface WeatherWidgetProps {
  weatherData: WeatherDTO | null;
  isLoading: boolean;
  locationStatus?: string | null;
  onRetry?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  weatherData, 
  isLoading,
  locationStatus,
  onRetry,
}) => {
  const isError = locationStatus === 'error_fallback' || locationStatus === 'denied';

  const getStatusMessage = () => {
    switch (locationStatus) {
      case 'requesting_permission': return 'Đang xin quyền vị trí...';
      case 'fetching_location':     return 'Đang xác định vị trí...';
      case 'fetching_weather':      return 'Đang tải thời tiết...';
      case 'denied':                return 'Không có quyền truy cập vị trí';
      case 'error_fallback':        return 'Không lấy được dữ liệu thời tiết';
      default:                      return 'Cập nhật thời tiết';
    }
  };

  return (
    <View className="flex-row justify-between items-center bg-white/10 px-4 py-3 rounded-2xl border border-white/20 mb-3">
      {/* Left: Icon + Info */}
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-10 h-10 rounded-xl bg-white/20 justify-center items-center shadow-sm">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <CloudSun size={20} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-[15px]" numberOfLines={1}>
            {isLoading
              ? 'Đang tải...'
              : weatherData?.city || 'Vị trí của bạn'}
          </Text>
          <Text className="text-white/80 font-medium text-xs mt-0.5 capitalize" numberOfLines={1}>
            {weatherData?.description || getStatusMessage()}
          </Text>
        </View>
      </View>

      {/* Right: Temperature OR retry button */}
      {!isLoading && weatherData?.temperature !== undefined ? (
        <View className="flex-row items-start gap-0.5 ml-2">
          <Text className="text-white text-3xl font-black tracking-tighter">
            {Math.round(weatherData.temperature)}
          </Text>
          <Text className="text-white/80 text-xl font-bold mt-0.5">°C</Text>
        </View>
      ) : !isLoading && isError && onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.7}
          className="ml-2 flex-row items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2"
        >
          <RefreshCw size={13} color="white" />
          <Text className="text-white text-[12px] font-bold">Thử lại</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
