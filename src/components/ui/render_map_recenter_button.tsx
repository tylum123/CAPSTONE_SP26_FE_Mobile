/**
 * AI CONTEXT:
 * This file contains the Recenter Location floating button for the MapLibre UI.
 * Extracted from JobMap to ensure components remain small and maintainable.
 * Rule: DO NOT modify existing code logic.
 */
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Navigation } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface RenderMapRecenterButtonProps {
    liveLocation: any;
    userLocation: any;
    cameraRef: any;
}

export function RenderMapRecenterButton({ liveLocation, userLocation, cameraRef }: RenderMapRecenterButtonProps) {
    if (!liveLocation && !userLocation) return null;

    return (
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
    );
}

const styles = StyleSheet.create({
    recenterBtn: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "white",
        padding: 12,
        borderRadius: 30,
        elevation: 5,
    },
});
