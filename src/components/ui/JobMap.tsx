import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Linking } from "react-native";
import MapView, { Marker, Circle, UrlTile, Callout } from "react-native-maps";
import { Job, UpcomingJob } from "../../types";
import { COLORS } from "../../constants/theme";
import { MapPin, Briefcase, Navigation } from "lucide-react-native";

export interface JobMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  radiusKm: number; // Use referdistance in KM
  jobs: Job[];
  onCalloutPress?: (job: Job) => void;
  style?: any;
}

const formatWage = (wageStr: string | number) => {
  const num = typeof wageStr === 'string' ? parseFloat(wageStr.toString().replace(/,/g, '').replace(/\./g,'')) : wageStr;
  if (!num || isNaN(num)) return wageStr;
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'Tr';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toString();
};

export function JobMap({ userLocation, radiusKm, jobs, onCalloutPress, style }: JobMapProps) {
  const initialRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        // Approximate scaling based on radius
        latitudeDelta: radiusKm * 0.02,
        longitudeDelta: radiusKm * 0.02,
      };
    }
    // Default to a generic location if loading or no location
    return {
      latitude: 10.762622,
      longitude: 106.660172,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [userLocation, radiusKm]);

  // react-native-maps does not officially support web without complex polyfills.
  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style, { justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" }]}>
        <MapPin size={40} color={COLORS.slate[300]} style={{ marginBottom: 12 }} />
        <Text className="text-slate-500 font-bold mb-1">Bản đồ di động</Text>
        <Text className="text-slate-400 text-[13px] text-center px-4">Tính năng bản đồ chỉ hỗ trợ trên thiết bị di động (Android / iOS).</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        mapType="none" // Turn off default Google/Apple maps rendering
      >
        {/* OpenStreetMap Tile Layer - CartoDB Voyager. Note: react-native-maps UrlTile
            does not support {s} subdomain placeholders, use a fixed subdomain. */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"
          maximumZ={19}
          flipY={false}
          shouldReplaceMapContent
        />

        {userLocation && (
          <>
            {/* Draw Radius Circle */}
            <Circle
              center={userLocation}
              radius={radiusKm * 1000} // Circle radius takes meters
              fillColor="rgba(34, 197, 94, 0.15)" // theme primary 500 transparent
              strokeColor="rgba(34, 197, 94, 0.4)"
              strokeWidth={1}
            />

            {/* Marker for User Location - use pinColor, no child views (Fabric safe) */}
            <Marker
              coordinate={userLocation}
              zIndex={100}
              pinColor="#2563eb"
              anchor={{ x: 0.5, y: 1 }}
            >
              <Callout tooltip>
                <View className="bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 mb-1">
                  <Text className="font-bold text-slate-800 text-sm">Vị trí của bạn</Text>
                  <Text className="text-xs text-slate-500">
                    Bán kính: {radiusKm} km
                  </Text>
                </View>
              </Callout>
            </Marker>
          </>
        )}

        {/* Job Markers */}
        {jobs.map((job) => {
          // If we don't have simulated/real coordinates for demo jobs,
          // let's distribute them roughly around the user location for demonstration.
          // Note: In real logic, JobPost should return actual lat/lng.
          // As a fallback for demo:
          const seed = parseInt(job.id.toString()) || Math.random() * 100;
          const offsetLat = (seed % 10) * 0.005 * (seed % 2 === 0 ? 1 : -1);
          const offsetLng = (seed % 7) * 0.005 * (seed % 3 === 0 ? 1 : -1);

          const jobLat = (job as any).latitude || (userLocation ? userLocation.latitude + offsetLat : 0);
          const jobLng = (job as any).longitude || (userLocation ? userLocation.longitude + offsetLng : 0);

          if (!jobLat || !jobLng) return null;

          return (
            <Marker
              key={job.id}
              coordinate={{ latitude: jobLat, longitude: jobLng }}
              tracksViewChanges={false}
              pinColor={job.urgent ? "#f43f5e" : COLORS.primary[600]}
            >

              {/* Popup Callout on click */}
              <Callout tooltip onPress={() => onCalloutPress && onCalloutPress(job)}>
                <View className="bg-white w-[220px] rounded-2xl shadow-xl overflow-hidden mb-2 border border-slate-100">
                  <View className="bg-primary-50 px-3 py-2 border-b border-primary-100 flex-row items-center justify-between">
                    <Text className="text-primary-700 font-bold text-[13px] flex-1 mr-2" numberOfLines={1}>
                      {job.title}
                    </Text>
                    {job.urgent && (
                      <View className="bg-rose-500 px-1.5 py-0.5 rounded">
                        <Text className="text-[10px] text-white font-bold">GẤP</Text>
                      </View>
                    )}
                  </View>
                  <View className="p-3">
                    <Text className="text-slate-500 text-xs mb-1" numberOfLines={1}>{job.farmer}</Text>
                    <Text className="text-primary-600 font-extrabold text-[15px] mb-2">{job.wage}đ</Text>
                    
                    <View className="flex-row items-center justify-between mt-1 pt-2 border-t border-slate-50">
                      <TouchableOpacity 
                        className="flex-row items-center bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100 mr-2"
                        onPress={(e) => {
                          e.stopPropagation();
                          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${jobLat},${jobLng}`);
                        }}
                      >
                        <Navigation size={12} color="#3b82f6" />
                        <Text className="text-[11px] text-blue-600 ml-1 font-bold">Chỉ đường</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onCalloutPress && onCalloutPress(job)} className="flex-1 items-end py-1.5">
                        <Text className="text-[11px] text-primary-600 font-bold">Chi tiết {'>'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
