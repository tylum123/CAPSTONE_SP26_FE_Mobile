import React, { useMemo, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from "react-native";
import { WebView } from "react-native-webview";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { Job } from "../../types";
import { COLORS } from "../../constants/theme";
import { MapPin, Navigation, Info } from "lucide-react-native";

// Initialize MapLibre
if (Platform.OS !== "web") {
  MapLibreGL.setAccessToken(null);
  MapLibreGL.setConnected(true);
}

export interface JobMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  radiusKm: number;
  jobs: Job[];
  onCalloutPress?: (job: Job) => void;
  style?: any;
}

const OSM_STYLE = JSON.stringify({
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap Contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
});

/**
 * NATIVE VERSION (MapLibre)
 * Used for Android/iOS builds
 */
function JobMapNative({ userLocation, radiusKm, jobs, onCalloutPress, style, markers }: any) {
  const cameraRef = useRef<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [liveLocation, setLiveLocation] = useState<any>(userLocation);

  useEffect(() => {
    if (Platform.OS === "android") {
      MapLibreGL.requestAndroidLocationPermissions();
    }
  }, []);

  const initialLat = userLocation?.latitude || 10.762622;
  const initialLng = userLocation?.longitude || 106.660172;

  const radiusCircleFeature = useMemo(() => {
    const loc = liveLocation || userLocation;
    if (!loc) return null;
    const points = 64;
    const coords = [];
    const center = [loc.longitude, loc.latitude];
    const kmPerDegreeLat = 111.32;
    const kmPerDegreeLng = 111.32 * Math.cos(center[1] * Math.PI / 180);

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = (radiusKm / kmPerDegreeLng) * Math.cos(theta);
        const y = (radiusKm / kmPerDegreeLat) * Math.sin(theta);
        coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]);

    return {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [coords] } }]
    };
  }, [liveLocation, userLocation, radiusKm]);

  const handleMarkerPress = (job: any) => {
    setSelectedJob(job);
  };

  const jobsSource = useMemo(() => ({
    type: "FeatureCollection",
    features: markers.map((job: any) => ({
      type: "Feature",
      id: job.id.toString(),
      geometry: { type: "Point", coordinates: [job.lng, job.lat] },
      properties: { ...job }
    }))
  }), [markers]);

  return (
    <View style={styles.mapWrap}>
      <MapLibreGL.MapView 
        style={styles.map} 
        mapStyle={OSM_STYLE}
        logoEnabled={false} 
        attributionEnabled={false}
        // @ts-ignore
        onRegionWillChange={(e) => {
            if (e.properties.isUserInteraction && selectedJob) {
                setSelectedJob(null);
            }
        }}
        onPress={() => setSelectedJob(null)}
      >
        <MapLibreGL.Camera 
          ref={cameraRef}
          defaultSettings={{
              centerCoordinate: [initialLng, initialLat],
              zoomLevel: 13
          }}
          animationMode="flyTo" 
          animationDuration={2000} 
        />

        <MapLibreGL.Images 
           images={{ 
              'red-pin': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
              'green-pin': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
           }} 
        />

        {/* Real-time "Tôi" Blue Dot & Label */}
        <MapLibreGL.UserLocation 
          visible={true} 
          renderMode="normal" 
          showsUserHeadingIndicator={true} 
          onUpdate={(location) => {
            if (location.coords) {
                setLiveLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
          }}
        />

        {/* Real-time 'Tôi' Label Overlay */}
        {liveLocation && (
            <MapLibreGL.PointAnnotation 
                id="user-me" 
                coordinate={[liveLocation.longitude, liveLocation.latitude]}
            >
                <View style={{ width: 30, height: 30, backgroundColor: 'transparent' }} />
                <MapLibreGL.Callout title="Vị trí hiện tại" />
            </MapLibreGL.PointAnnotation>
        )}

      
      {radiusCircleFeature && (
        <MapLibreGL.ShapeSource id="radius-source" shape={radiusCircleFeature as any}>
          <MapLibreGL.FillLayer 
            id="radius-fill" 
            sourceID="radius-source"
            style={{ fillColor: COLORS.primary[500], fillOpacity: 0.05 }} 
          />
          <MapLibreGL.LineLayer 
            id="radius-line" 
            sourceID="radius-source"
            style={{ lineColor: COLORS.primary[500], lineWidth: 2, lineDasharray: [2, 2] }} 
          />
        </MapLibreGL.ShapeSource>
      )}


        <MapLibreGL.ShapeSource 
           id="jobs-source" 
           shape={jobsSource as any} 
           onPress={(e) => {
               const feature = e.features[0] as any;
               if (feature && feature.geometry && feature.geometry.coordinates) {
                   const jobId = feature.id || feature.properties?.id;
                   const fullJob = markers.find((m: any) => m.id.toString() === jobId?.toString());
                   const coords = feature.geometry.coordinates;
                   
                   if (fullJob) {
                       setSelectedJob(fullJob);
                       
                       // Pinpoint auto-zoom
                       cameraRef.current?.setCamera({
                           centerCoordinate: coords,
                           zoomLevel: 16,
                           animationDuration: 800,
                           animationMode: 'flyTo'
                       });
                   }
               }
           }}
        >
           <MapLibreGL.SymbolLayer 
             id="job-pins-layer" 
             sourceID="jobs-source"
             style={{ 
                iconImage: [
                    'case',
                    ['boolean', ['get', 'urgent'], false], 'red-pin',
                    'green-pin'
                ],
                iconSize: 0.8,
                iconAnchor: 'bottom',
                iconAllowOverlap: true,
             }} 
           />
        </MapLibreGL.ShapeSource>

        {/* Selected Job MarkerView - This follows the map NATIVELY without lag */}
        {selectedJob && (
            <MapLibreGL.MarkerView coordinate={[selectedJob.lng, selectedJob.lat]} anchor={{ x: 0.5, y: 1.1 }}>
                <View style={[styles.customCallout, { width: 220 }]}>
                    <View style={styles.calloutHeader}>
                        <Text style={styles.calloutTitle} numberOfLines={1}>{selectedJob.title}</Text>
                        {selectedJob.urgent && <View style={styles.urgentBadge}><Text style={styles.urgentText}>GẤP</Text></View>}
                    </View>
                    <Text style={styles.calloutFarmer}>{selectedJob.farmer}</Text>
                    <Text style={styles.calloutWage}>{(selectedJob.wage || 0).toLocaleString()}đ</Text>
                    <View style={styles.calloutActions}>
                        <TouchableOpacity 
                            style={[styles.calloutButton, { flex: 1, marginRight: 6 }]} 
                            onPress={() => onCalloutPress && onCalloutPress(selectedJob)}
                        >
                            <Info size={12} color="#fff" />
                            <Text style={styles.calloutButtonText}>CHI TIẾT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.calloutButton, { backgroundColor: '#3b82f6', paddingHorizontal: 10 }]} 
                            onPress={() => {
                                const url = Platform.select({
                                    ios: `maps:0,0?q=${selectedJob.lat},${selectedJob.lng}`,
                                    android: `geo:0,0?q=${selectedJob.lat},${selectedJob.lng}`,
                                });
                                if (url) Linking.openURL(url);
                            }}
                        >
                            <Navigation size={12} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.calloutArrow} />
                </View>
            </MapLibreGL.MarkerView>
        )}
      </MapLibreGL.MapView>

    {/* Recenter Button */}
    {(liveLocation || userLocation) && (
      <TouchableOpacity 
        style={styles.recenterBtn}
        onPress={() => {
          const loc = liveLocation || userLocation;
          cameraRef.current?.setCamera({
            centerCoordinate: [loc.longitude, loc.latitude],
            zoomLevel: 14,
            animationDuration: 1000
          });
        }}
      >
        <Navigation size={22} color={COLORS.primary[600]} />
      </TouchableOpacity>
    )}
    </View>
  );
}

/**
 * WEB/FALLBACK VERSION (WebView + Leaflet)
 * Used for Expo Web Demo
 */
function JobMapWeb({ userLocation, radiusKm, onCalloutPress, markers }: any) {
  const initialLat = userLocation?.latitude || 10.762622;
  const initialLng = userLocation?.longitude || 106.660172;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background: #ffffff; }
        #map { height: 100%; width: 100%; background: #ffffff; }
        .popup-card { padding: 4px; font-family: sans-serif; min-width: 140px; }
        .popup-job { font-weight: bold; font-size: 14px; color: #1e293b; margin-bottom: 2px; }
        .popup-wage { color: #16a34a; font-weight: 800; font-size: 15px; }
        .popup-btn { 
          display: block; width: 100%; padding: 10px; margin-top: 8px;
          background: #22c55e; color: white; text-align: center;
          border-radius: 6px; font-weight: bold; border: none; font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${initialLat}, ${initialLng}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        ${userLocation ? `
          L.circle([${userLocation.latitude}, ${userLocation.longitude}], { color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.1, radius: ${radiusKm * 1000} }).addTo(map);
          L.circleMarker([${userLocation.latitude}, ${userLocation.longitude}], { radius: 8, color: 'white', weight: 3, fillColor: '#3b82f6', fillOpacity: 1 }).addTo(map);
        ` : ''}

        var markers = ${JSON.stringify(markers)};
        markers.forEach(function(job) {
          var marker = L.marker([job.lat, job.lng]).addTo(map);
          var html = '<div class="popup-card">' +
            '<div class="popup-job">' + job.title + '</div>' +
            '<div class="popup-wage">' + job.wage.toLocaleString() + 'đ</div>' +
            '<button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(\\\'detail:\\\' + ' + job.id + ')">XEM CHI TIẾT</button>' +
            '</div>';
          marker.bindPopup(html);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      style={styles.map}
      onMessage={(event) => {
        const data = event.nativeEvent.data;
        if (data.startsWith("detail:")) {
          const jobId = data.split(":")[1];
          const job = markers.find((j: any) => j.id.toString() === jobId);
          if (job && onCalloutPress) onCalloutPress(job);
        }
      }}
    />
  );
}

export function JobMap(props: JobMapProps) {
  const markers = useMemo(() => {
    return props.jobs.map(job => {
      const seed = parseInt(job.id.toString()) || Math.random() * 100;
      const offsetLat = (seed % 10) * 0.005 * (seed % 2 === 0 ? 1 : -1);
      const offsetLng = (seed % 7) * 0.005 * (seed % 3 === 0 ? 1 : -1);
      return {
        ...job,
        lat: (job as any).latitude || (props.userLocation ? props.userLocation.latitude + offsetLat : 10.762622 + offsetLat),
        lng: (job as any).longitude || (props.userLocation ? props.userLocation.longitude + offsetLng : 106.660172 + offsetLng),
      };
    });
  }, [props.jobs, props.userLocation]);

  return (
    <View style={[styles.container, props.style]}>
      {Platform.OS === 'web' ? (
        <JobMapWeb {...props} markers={markers} />
      ) : (
        <JobMapNative {...props} markers={markers} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 350,
    height: 350,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  mapWrap: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  recenterBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    elevation: 5,
  },
  customCallout: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  calloutArrow: {
    position: 'absolute',
    bottom: -10,
    left: 90,
    width: 20,
    height: 20,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeCallout: {
    position: "absolute",
    top: 10,
    right: 12,
    padding: 4,
  },
  userLocationOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
    borderWidth: 2,
    borderColor: "white",
  },
  markerContainer: {
    padding: 6,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerUrgent: {
    backgroundColor: COLORS.primary[600],
    borderColor: COLORS.primary[700],
  },
  calloutContainer: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    minWidth: 160,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  calloutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  urgentText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  calloutFarmer: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  calloutWage: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16a34a",
    marginBottom: 10,
  },
  calloutActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  calloutButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  homeMarkerContainer: {
    padding: 4,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ef4444",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
});
