/**
 * AI CONTEXT:
 * This file transforms job data into map markers by calculating and caching offsets.
 * Extracted from JobMap to clean up the component and separate logic.
 * Rule: DO NOT modify existing code logic.
 */
import { useMemo } from "react";
import { Job } from "../types/export_type_definitions";

export function useMapMarkers(jobs: Job[], userLocation: { latitude: number; longitude: number } | null) {
  return useMemo(() => {
    return jobs.map(job => {
      const seed = parseInt(job.id.toString()) || Math.random() * 100;
      const offsetLat = (seed % 10) * 0.005 * (seed % 2 === 0 ? 1 : -1);
      const offsetLng = (seed % 7) * 0.005 * (seed % 3 === 0 ? 1 : -1);
      return {
        ...job,
        lat: job.latitude || (userLocation ? userLocation.latitude + offsetLat : 10.762622 + offsetLat),
        lng: job.longitude || (userLocation ? userLocation.longitude + offsetLng : 106.660172 + offsetLng),
      };
    });
  }, [jobs, userLocation]);
}
