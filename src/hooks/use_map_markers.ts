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
    // 1. Calculate base positions (with fallback if missing)
    const positionedJobs = jobs.map(job => {
      const seed = parseInt(job.id.toString()) || Math.random() * 100;
      const offsetLat = (seed % 10) * 0.005 * (seed % 2 === 0 ? 1 : -1);
      const offsetLng = (seed % 7) * 0.005 * (seed % 3 === 0 ? 1 : -1);
      
      const lat = job.latitude || (userLocation ? userLocation.latitude + offsetLat : 10.762622 + offsetLat);
      const lng = job.longitude || (userLocation ? userLocation.longitude + offsetLng : 106.660172 + offsetLng);
      
      return {
        ...job,
        lat,
        lng
      };
    });

    // 2. Group by exact lat/lng
    const groups: { [key: string]: any[] } = {};
    positionedJobs.forEach(job => {
      const key = `${job.lat.toFixed(6)},${job.lng.toFixed(6)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
    });

    // 3. Create unique markers
    return Object.values(groups).map(group => {
      if (group.length === 1) return group[0];
      
      // If multiple jobs, check if any are urgent
      const hasUrgent = group.some(j => j.urgent || j.isUrgent);
      
      return {
        ...group[0],
        id: `group-${group[0].id}`,
        isMulti: true,
        urgent: hasUrgent,
        isUrgent: hasUrgent,
        jobs: group
      };
    });
  }, [jobs, userLocation]);
}
