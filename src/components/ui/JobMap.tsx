/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { Job } from "../../types/export_type_definitions";
import { COLORS } from "../../constants/theme";

// Hooks
import { useRequestLocation } from "../../hooks/use_request_location";
import { useMapState } from "../../hooks/use_map_state";
import { useMapMarkers } from "../../hooks/use_map_markers";
import { useMapFeatures } from "../../hooks/use_map_features";

// Sub-components
import { RenderJobMapWeb } from "./render_job_map_web";
import { RenderJobMapCallout } from "./render_job_map_callout";
import { RenderMapRecenterButton } from "./render_map_recenter_button";
import { RenderMapUserMarker } from "./render_map_user_marker";

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
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap Contributors' } },
  layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }]
});

function JobMapNative({ userLocation, radiusKm, onCalloutPress, markers }: any) {
  useRequestLocation();
  const { cameraRef, selectedJob, setSelectedJob, liveLocation, setLiveLocation } = useMapState(userLocation);
  const { radiusCircleFeature, jobsSource } = useMapFeatures(liveLocation, userLocation, radiusKm, markers);

  const initialLat = userLocation?.latitude || 10.762622;
  const initialLng = userLocation?.longitude || 106.660172;

  return (
    <View style={styles.mapWrap}>
      <MapLibreGL.MapView 
        style={styles.map} mapStyle={OSM_STYLE} logoEnabled={false} attributionEnabled={false}
        // @ts-ignore
        onRegionWillChange={(e) => { if (e.properties.isUserInteraction && selectedJob) setSelectedJob(null); }}
        onPress={() => setSelectedJob(null)}
      >
        <MapLibreGL.Camera ref={cameraRef} animationMode="flyTo" animationDuration={2000} 
          defaultSettings={{ centerCoordinate: [initialLng, initialLat], zoomLevel: 13 }} />
        
        <MapLibreGL.Images images={{ 
          'red-pin': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          'green-pin': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
        }} />

        <MapLibreGL.UserLocation visible={true} renderMode="normal" showsUserHeadingIndicator={true} 
          onUpdate={(location) => {
            if (location.coords) setLiveLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
          }} />

        <RenderMapUserMarker liveLocation={liveLocation} />

        {radiusCircleFeature && (
          <MapLibreGL.ShapeSource id="radius-source" shape={radiusCircleFeature as any}>
            <MapLibreGL.FillLayer id="radius-fill" sourceID="radius-source" style={{ fillColor: COLORS.primary[500], fillOpacity: 0.05 }} />
            <MapLibreGL.LineLayer id="radius-line" sourceID="radius-source" style={{ lineColor: COLORS.primary[500], lineWidth: 2, lineDasharray: [2, 2] }} />
          </MapLibreGL.ShapeSource>
        )}

        <MapLibreGL.ShapeSource id="jobs-source" shape={jobsSource as any} onPress={(e) => {
            const feature = e.features[0] as any;
            if (feature?.geometry?.coordinates) {
                const jobId = feature.id || feature.properties?.id;
                const fullJob = markers.find((m: any) => m.id.toString() === jobId?.toString());
                if (fullJob) {
                    setSelectedJob(fullJob);
                    cameraRef.current?.setCamera({ centerCoordinate: feature.geometry.coordinates, zoomLevel: 16, animationDuration: 800, animationMode: 'flyTo' });
                }
            }
        }}>
           <MapLibreGL.SymbolLayer id="job-pins-layer" sourceID="jobs-source" style={{ iconImage: ['case', ['boolean', ['get', 'urgent'], false], 'red-pin', 'green-pin'], iconSize: 0.8, iconAnchor: 'bottom', iconAllowOverlap: true }} />
        </MapLibreGL.ShapeSource>

        <RenderJobMapCallout selectedJob={selectedJob} onCalloutPress={onCalloutPress} />
      </MapLibreGL.MapView>

      <RenderMapRecenterButton liveLocation={liveLocation} userLocation={userLocation} cameraRef={cameraRef} />
    </View>
  );
}

export function JobMap(props: JobMapProps) {
  const markers = useMapMarkers(props.jobs, props.userLocation);

  return (
    <View style={[styles.container, props.style]}>
      {Platform.OS === 'web' ? (
        <RenderJobMapWeb {...props} markers={markers} />
      ) : (
        <JobMapNative {...props} markers={markers} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 350, height: 350, borderRadius: 24, overflow: "hidden", backgroundColor: "#ffffff", borderWidth: 1.5, borderColor: "#e2e8f0", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  mapWrap: { flex: 1, position: 'relative' },
  map: { flex: 1 }
});
