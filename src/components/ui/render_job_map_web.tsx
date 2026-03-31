/**
 * AI CONTEXT:
 * This file contains the Web fallback implementation of the Job Map utilizing WebView & Leaflet.
 * Extracted from JobMap to decouple Expo Web fallback from Native MapLibre structure.
 * Rule: DO NOT modify existing code logic.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from "react-native-webview";

export function RenderJobMapWeb({ userLocation, radiusKm, onCalloutPress, markers }: any) {
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
            '<div class="popup-wage">' + (job.wageAmount || 0).toLocaleString() + 'đ</div>' +
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

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
