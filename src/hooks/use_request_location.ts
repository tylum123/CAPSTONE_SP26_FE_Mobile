/**
 * AI CONTEXT:
 * This file handles Android location permission requests for the map.
 * Extracted from JobMap during refactoring to keep components and hooks small.
 * Rule: DO NOT modify existing code logic.
 */
import { useEffect } from "react";
import { Platform } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

export function useRequestLocation() {
  useEffect(() => {
    if (Platform.OS === "android") {
      MapLibreGL.requestAndroidLocationPermissions();
    }
  }, []);
}
