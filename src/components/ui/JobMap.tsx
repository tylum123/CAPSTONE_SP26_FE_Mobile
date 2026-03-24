import React, { useMemo, useRef } from "react";
import { View, Text, StyleSheet, Platform, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { Job } from "../../types";
import { COLORS } from "../../constants/theme";
import { MapPin } from "lucide-react-native";

export interface JobMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  radiusKm: number;
  jobs: Job[];
  onCalloutPress?: (job: Job) => void;
  style?: any;
}

export function JobMap({ userLocation, radiusKm, jobs, onCalloutPress, style }: JobMapProps) {
  const webViewRef = useRef<WebView>(null);

  const initialLat = userLocation?.latitude || 10.762622;
  const initialLng = userLocation?.longitude || 106.660172;

  // Prepare job data for JS injection
  const markersData = useMemo(() => {
    return jobs.map(job => {
      const seed = parseInt(job.id.toString()) || Math.random() * 100;
      const offsetLat = (seed % 10) * 0.005 * (seed % 2 === 0 ? 1 : -1);
      const offsetLng = (seed % 7) * 0.005 * (seed % 3 === 0 ? 1 : -1);

      return {
        id: job.id,
        title: job.title,
        farmer: job.farmer,
        wage: job.wage,
        urgent: job.urgent,
        lat: (job as any).latitude || (userLocation ? userLocation.latitude + offsetLat : 10.762622 + offsetLat),
        lng: (job as any).longitude || (userLocation ? userLocation.longitude + offsetLng : 106.660172 + offsetLng),
      };
    });
  }, [jobs, userLocation]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; background: #e2e8f0; }
        .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; }
        .leaflet-popup-content { margin: 0 !important; width: 200px !important; }
        .popup-container { padding: 12px; font-family: sans-serif; }
        .popup-title { font-weight: bold; color: #1e293b; margin-bottom: 4px; font-size: 14px; }
        .popup-sub { color: #64748b; font-size: 12px; margin-bottom: 8px; }
        .popup-price { color: #16a34a; font-weight: 800; font-size: 15px; }
        .popup-btn { 
          display: block; width: 100%; padding: 8px; margin-top: 10px;
          background: #22c55e; color: white; text-align: center;
          border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 12px;
        }
        .urgent-badge { 
          background: #f43f5e; color: white; padding: 2px 6px; 
          border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 6px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${initialLat}, ${initialLng}], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; CartoDB'
        }).addTo(map);

        // User Location
        ${userLocation ? `
          L.circle([${userLocation.latitude}, ${userLocation.longitude}], {
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.15,
            radius: ${radiusKm * 1000}
          }).addTo(map);
          L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], {
            radius: 8, color: 'white', weight: 3, fillColor: '#3b82f6', fillOpacity: 1
          }).addTo(map).bindPopup("Vị trí của bạn");
        ` : ''}

        var markers = ${JSON.stringify(markersData)};
        markers.forEach(function(job) {
          var marker = L.marker([job.lat, job.lng]).addTo(map);
          var popupContent = '<div class="popup-container">' +
            '<div class="popup-title">' + job.title + (job.urgent ? '<span class="urgent-badge">GẤP</span>' : '') + '</div>' +
            '<div class="popup-sub">' + job.farmer + '</div>' +
            '<div class="popup-price">' + job.wage + 'đ</div>' +
            '<a href="javascript:void(0)" class="popup-btn" onclick="window.ReactNativeWebView.postMessage(\'detail:\' + ' + job.id + ')">Xem chi tiết</a>' +
            '</div>';
          marker.bindPopup(popupContent);
        });

        function centerMap(lat, lng) {
          map.setView([lat, lng], 14);
        }
      </script>
    </body>
    </html>
  `;

  const onMessage = (event: any) => {
    const data = event.nativeEvent.data;
    if (data.startsWith("detail:")) {
      const jobId = data.split(":")[1];
      const job = jobs.find(j => j.id.toString() === jobId);
      if (job && onCalloutPress) {
        onCalloutPress(job);
      }
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, style, { justifyContent: "center", alignItems: "center", backgroundColor: "#f1f5f9" }]}>
        <MapPin size={40} color={COLORS.slate[300]} style={{ marginBottom: 12 }} />
        <Text className="text-slate-500 font-bold mb-1">Bản đồ di động</Text>
        <Text className="text-slate-400 text-[13px] text-center px-4">Đang hiển thị chế độ WebView trên Mobile.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
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
    flex: 1,
  },
});
