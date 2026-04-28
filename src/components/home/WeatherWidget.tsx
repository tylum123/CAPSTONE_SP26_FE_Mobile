/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Weather widget component for the home screen dashboard.
 */
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CloudSun, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#38bdf8', '#0284c7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-row justify-between items-center px-5 py-4 rounded-[24px] shadow-sm mb-2"
    >
      {/* Left: Icon + Info */}
      <View className="flex-row items-center gap-4 flex-1">
        <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center shadow-sm border border-white/20">
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <CloudSun size={24} color="white" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-white font-black text-[17px] tracking-tight" numberOfLines={1}>
            {isLoading
              ? 'Đang tải...'
              : weatherData?.city || 'Vị trí của bạn'}
          </Text>
          <Text className="text-white/80 font-semibold text-[13px] mt-0.5 capitalize" numberOfLines={1}>
            {weatherData?.description || getStatusMessage()}
          </Text>
        </View>
      </View>

      {/* Right: Temperature OR retry button */}
      {!isLoading && weatherData?.temperature !== undefined ? (
        <View className="flex-row items-start gap-1 ml-2">
          <Text 
            className="text-white text-[40px] font-black tracking-tighter leading-tight"
            style={{ textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 }}
          >
            {Math.round(weatherData.temperature)}
          </Text>
          <Text className="text-white/90 text-[20px] font-bold mt-1">°C</Text>
        </View>
      ) : !isLoading && isError && onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.7}
          className="ml-2 flex-row items-center gap-1.5 bg-white/20 rounded-full px-4 py-2 border border-white/20"
        >
          <RefreshCw size={14} color="white" />
          <Text className="text-white text-[13px] font-bold">Thử lại</Text>
        </TouchableOpacity>
      ) : null}
    </LinearGradient>
  );
};
