/**
 * AI CONTEXT:
 * This file contains the MapLibre Callout overlay rendered when a job is selected.
 * Extracted from JobMap to ensure components remain small and maintainable.
 * Rule: DO NOT modify existing code logic.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Navigation, Info } from 'lucide-react-native';

interface RenderJobMapCalloutProps {
    selectedJob: any;
    onCalloutPress?: (job: any) => void;
}

export function RenderJobMapCallout({ selectedJob, onCalloutPress }: RenderJobMapCalloutProps) {
    if (!selectedJob) return null;

    return (
        <MapLibreGL.MarkerView coordinate={[selectedJob.lng, selectedJob.lat]} anchor={{ x: 0.5, y: 1.1 }}>
            <View style={[styles.customCallout, { width: 220 }]}>
                <View style={styles.calloutHeader}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>{selectedJob.title}</Text>
                    {selectedJob.urgent && <View style={styles.urgentBadge}><Text style={styles.urgentText}>GẤP</Text></View>}
                </View>
                <Text style={styles.calloutFarmer}>{selectedJob.farmer}</Text>
                <Text style={styles.calloutWage}>{(selectedJob.wageAmount || 0).toLocaleString()}đ</Text>
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
    );
}

const styles = StyleSheet.create({
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
  calloutButtonText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
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
});
