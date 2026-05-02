/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Job } from "../../types/export_type_definitions";
import { COLORS } from "../../constants/theme";

// Fix Leaflet's default icon path issues
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
} catch (e) {
  console.log("Leaflet icon setup error:", e);
}

// Custom icons can be created using L.divIcon


const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="position: relative; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center;">
      <div style="position: absolute; width: 100%; height: 100%; background-color: #3b82f6; opacity: 0.3; border-radius: 50%;"></div>
      <div style="background-color: #2563eb; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 2;"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const createJobIcon = (urgent: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="
        background-color: ${urgent ? '#f43f5e' : COLORS.primary[600]}; 
        width: 30px;
        height: 30px;
        border-radius: 50%; 
        border: 2px solid white; 
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1); 
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      </div>
      <div style="
        width: 10px; 
        height: 10px; 
        background-color: ${urgent ? '#f43f5e' : COLORS.primary[600]}; 
        transform: rotate(45deg); 
        margin-top: -6px; 
        border-right: 2px solid white; 
        border-bottom: 2px solid white;
        z-index: 1;
      "></div>
    </div>
  `,
  iconSize: [40, 44],
  iconAnchor: [20, 44]
});

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Custom hook to inject Leaflet CSS without Metro static asset warnings
function useLeafletCss() {
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);
}

export function JobMap({ userLocation, radiusKm, jobs, onCalloutPress, style }: any) {
  useLeafletCss();
  const center: [number, number] = userLocation ? [userLocation.latitude, userLocation.longitude] : [10.762622, 106.660172];

  // Calculate generic zoom from radius. rough estimate: 
  // zoom 13 ~ 5km radius, zoom 12 ~ 10km, zoom 11 ~ 20km
  const zoom = Math.max(10, 14 - Math.log2(radiusKm || 1));

  return (
    <View style={[styles.container, style]}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: 24 }}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png"
          maxZoom={19}
        />
        
        {userLocation && (
          <>
            <Circle 
              center={center} 
              radius={radiusKm * 1000} 
              pathOptions={{ fillColor: COLORS.primary[500], fillOpacity: 0.15, color: COLORS.primary[500], weight: 2 }} 
            />
            <Marker position={center} icon={userIcon}>
              <Popup>
                <div style={{ padding: '2px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>Vị trí của bạn</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Bán kính: {radiusKm} km</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {jobs.map((job: Job) => {
          const seed = parseInt(job.id.toString()) || Math.random() * 100;
          const offsetLat = (seed % 10) * 0.005 * (seed % 2 === 0 ? 1 : -1);
          const offsetLng = (seed % 7) * 0.005 * (seed % 3 === 0 ? 1 : -1);

          const jobLat = (job as any).latitude || (userLocation ? userLocation.latitude + offsetLat : 0);
          const jobLng = (job as any).longitude || (userLocation ? userLocation.longitude + offsetLng : 0);

          if (!jobLat || !jobLng) return null;

          return (
            <Marker key={job.id} position={[jobLat, jobLng]} icon={createJobIcon(job.urgent || false)}>
              <Popup className="custom-popup">
                <div 
                  style={{ width: '220px', cursor: 'pointer', margin: '-14px -20px -14px -20px', borderRadius: '12px', overflow: 'hidden' }}
                  onClick={() => onCalloutPress && onCalloutPress(job)}
                >
                  <div style={{ backgroundColor: '#f0fdf4', padding: '10px 14px', borderBottom: '1px solid #dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: '13px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, marginRight: '8px' }}>{job.title}</span>
                    {job.urgent && <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>GẤP</span>}
                  </div>
                  <div style={{ padding: '12px 14px', backgroundColor: 'white' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>{job.farmer}</div>
                    <div style={{ color: '#059669', fontSize: '16px', fontWeight: '900', marginBottom: '8px' }}>{job.wage}đ</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #dbeafe' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${jobLat},${jobLng}`, '_blank');
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>📍 Chỉ đường</span>
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(onCalloutPress) onCalloutPress(job);
                        }}
                        style={{ padding: '4px 8px' }}
                      >
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold' }}>Chi tiết &gt;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
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
});
