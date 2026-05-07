/**
 * AI CONTEXT:
 * This file contains the MapLibre Callout overlay rendered when a job is selected.
 * Extracted from JobMap to ensure components remain small and maintainable.
 * Rule: DO NOT modify existing code logic.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Platform, Linking, StyleSheet, ScrollView } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Navigation, Info } from 'lucide-react-native';

interface RenderJobMapCalloutProps {
    selectedJob: any;
    onCalloutPress?: (job: any) => void;
}

function JobItem({ 
    job, 
    onCalloutPress, 
    width 
}: { 
    job: any, 
    onCalloutPress?: (job: any) => void, 
    width: number 
}) {
    return (
        <View style={[styles.jobItem, { width }]}>
            <View style={styles.calloutHeader}>
                <Text style={styles.calloutTitle} numberOfLines={1}>{job.title}</Text>
                {(job.urgent || job.isUrgent) && <View style={styles.urgentBadge}><Text style={styles.urgentText}>GẤP</Text></View>}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={[styles.calloutFarmer, { marginBottom: 0 }]} numberOfLines={1}>
                    {job.farmer?.name || job.farmer || job.contactName || "Chủ nông trại"}
                </Text>
                <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#cbd5e1', marginHorizontal: 6 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#6366f1' }} numberOfLines={1}>
                    {job.distanceKm !== undefined ? `${job.distanceKm.toFixed(1)} km` : (job.locationName || job.address || "Việt Nam")}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.calloutWage}>{(job.wageAmount || job.wage || 0).toLocaleString()}đ</Text>
                {job.matchScore !== undefined && (
                   <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: 'bold' }}>
                     Phù hợp: {Math.round(job.matchScore > 1 ? job.matchScore : job.matchScore * 100)}%
                   </Text>
                )}
            </View>
            <View style={styles.calloutActions}>
                <TouchableOpacity 
                    style={[styles.calloutButton, { flex: 1, marginRight: 6 }]} 
                    onPress={() => onCalloutPress && onCalloutPress(job)}
                >
                    <Info size={12} color="#fff" />
                    <Text style={styles.calloutButtonText}>CHI TIẾT</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.calloutButton, { backgroundColor: '#3b82f6', paddingHorizontal: 10 }]} 
                    onPress={() => {
                        const url = Platform.select({
                            ios: `maps:0,0?q=${job.lat},${job.lng}`,
                            android: `geo:0,0?q=${job.lat},${job.lng}`,
                        });
                        if (url) Linking.openURL(url);
                    }}
                >
                    <Navigation size={12} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export function RenderJobMapCallout({ selectedJob, onCalloutPress }: RenderJobMapCalloutProps) {
    const [activeIndex, setActiveIndex] = React.useState(0);
    
    if (!selectedJob) return null;

    const jobList = selectedJob.isMulti ? selectedJob.jobs : [selectedJob];
    const calloutWidth = 260;
    const contentWidth = calloutWidth; // Full width for paging

    const handleScroll = (event: any) => {
        const xOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(xOffset / contentWidth);
        if (index !== activeIndex) setActiveIndex(index);
    };

    return (
        <MapLibreGL.MarkerView coordinate={[selectedJob.lng, selectedJob.lat]} anchor={{ x: 0.5, y: 1.1 }}>
            <View style={[styles.customCallout, { width: calloutWidth }]}>
                {selectedJob.isMulti && (
                    <View style={styles.multiHeader}>
                        <Text style={styles.multiHeaderText}>
                            {activeIndex + 1}/{jobList.length} công việc tại đây
                        </Text>
                    </View>
                )}
                
                <ScrollView 
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    style={{ marginHorizontal: -12 }} // Negate parent padding
                >
                    {jobList.map((job: any) => (
                        <JobItem 
                            key={job.id} 
                            job={job} 
                            onCalloutPress={onCalloutPress} 
                            width={contentWidth}
                        />
                    ))}
                </ScrollView>

                {jobList.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {jobList.map((_: any, i: number) => (
                            <View 
                                key={i} 
                                style={[
                                    styles.dot, 
                                    i === activeIndex ? styles.activeDot : styles.inactiveDot
                                ]} 
                            />
                        ))}
                    </View>
                )}

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
    left: 110,
    width: 20,
    height: 20,
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
  },
  jobItem: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  multiHeader: {
    backgroundColor: '#f8fafc',
    marginHorizontal: -12,
    marginTop: -12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  multiHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#059669',
    width: 12,
  },
  inactiveDot: {
    backgroundColor: '#cbd5e1',
  },
});
