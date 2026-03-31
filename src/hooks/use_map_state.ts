/**
 * AI CONTEXT:
 * This file handles MapLibre's local React states like the active camera reference,
 * the selected job, and the user's live tracked location.
 * Rule: DO NOT modify existing code logic.
 */
import { useState, useRef } from "react";

export function useMapState(initialUserLocation: { latitude: number; longitude: number } | null) {
  const cameraRef = useRef<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [liveLocation, setLiveLocation] = useState<any>(initialUserLocation);

  return {
    cameraRef,
    selectedJob,
    setSelectedJob,
    liveLocation,
    setLiveLocation
  };
}
