/**
 * AI CONTEXT:
 * This file contains the user current location custom marker ("Tôi") label overlay.
 * Extracted from JobMap to ensure components remain small and maintainable.
 * Rule: DO NOT modify existing code logic.
 */
import React from 'react';
import { View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

interface RenderMapUserMarkerProps {
    liveLocation: any;
}

export function RenderMapUserMarker({ liveLocation }: RenderMapUserMarkerProps) {
    if (!liveLocation) return null;

    return (
        <MapLibreGL.PointAnnotation 
            id="user-me" 
            coordinate={[liveLocation.longitude, liveLocation.latitude]}
        >
            <View style={{ width: 30, height: 30, backgroundColor: 'transparent' }} />
            <MapLibreGL.Callout title="Vị trí hiện tại" />
        </MapLibreGL.PointAnnotation>
    );
}
