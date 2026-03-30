/**
 * AI CONTEXT:
 * This file computes GeoJSON features used by MapLibre (the radius circle and job nodes).
 * Extracted from JobMap to manage map feature states independently.
 * Rule: DO NOT modify existing code logic.
 */
import { useMemo } from "react";

export function useMapFeatures(
  liveLocation: { latitude: number; longitude: number } | null,
  userLocation: { latitude: number; longitude: number } | null,
  radiusKm: number,
  markers: any[]
) {
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

  const jobsSource = useMemo(() => ({
    type: "FeatureCollection",
    features: markers.map((job: any) => ({
      type: "Feature",
      id: job.id.toString(),
      geometry: { type: "Point", coordinates: [job.lng, job.lat] },
      properties: { ...job }
    }))
  }), [markers]);

  return { radiusCircleFeature, jobsSource };
}
