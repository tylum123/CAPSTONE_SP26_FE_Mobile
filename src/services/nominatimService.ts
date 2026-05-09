/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Contains UI components or service modules for the React Native app.
 * Rule: DO NOT modify existing code logic.
 */
import axios from "axios";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

class NominatimService {
  private readonly baseUrl = "https://nominatim.openstreetmap.org/search";
  private cache: Map<string, Coordinates> = new Map();

  /**
   * Geocodes an address string to latitude/longitude using OpenStreetMap's Nominatim API.
   * @param address Full address string (e.g., "123 Đường 3/2, Phường 10, Quận 10, Hồ Chí Minh")
   * @returns Coordinates or null if not found
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!address || address.trim() === "") return null;
    
    const cleanAddress = address.trim().toLowerCase();
    if (this.cache.has(cleanAddress)) {
      return this.cache.get(cleanAddress) || null;
    }
    
    // Add a small delay to respect Nominatim's 1 req/sec policy if called in loop
    // (Wait at least 200ms between calls as a safety measure for mobile demo)
    await new Promise(r => setTimeout(r, 200));

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "Capstone_SP26_FE_Mobile/1.0",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const coords = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
        this.cache.set(cleanAddress, coords);
        return coords;
      }
      return null;
    } catch (error) {
      console.error("Nominatim geocoding error:", error);
      return null;
    }
  }

  /**
   * Search for multiple address suggestions for autocomplete.
   * @param query Search string
   * @returns List of display names and their details
   */
  async searchAddress(query: string): Promise<any[]> {
    if (!query || query.trim().length < 3) return [];

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          format: "json",
          limit: 5,
          addressdetails: 1,
          countrycodes: "vn", // Restrict to Vietnam
        },
        headers: {
          "User-Agent": "Capstone_SP26_FE_Mobile/1.0",
          "Accept-Language": "vi-VN,vi;q=0.9",
        },
      });

      return response.data || [];
    } catch (error) {
      console.error("Nominatim search error:", error);
      return [];
    }
  }

  /**
   * Calculates the distance between two coordinates in kilometers using the Haversine formula.
   */
  calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Gets real driving distance between two coordinates using OSRM (OpenStreetMap Routing).
   * Falls back to straight-line distance if the request fails.
   */
  async getRouteDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    const straightDist = this.calculateDistanceKm(lat1, lon1, lat2, lon2);
    
    // For very short distances (< 0.5km), road vs straight is negligible and OSRM might be overkill
    if (straightDist < 0.5) return straightDist;

    try {
      // OSRM Public Demo API (limit: 1 req/sec)
      // Format: {lon1},{lat1};{lon2},{lat2}
      const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
      
      const response = await axios.get(url, {
        headers: { "User-Agent": "Capstone_SP26_FE_Mobile/1.0" },
        timeout: 2000 // Short timeout to avoid blocking UI
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        // Distance is returned in meters, convert to km
        return response.data.routes[0].distance / 1000;
      }
      
      // Fallback: Haversine distance with a "winding factor" for road distance estimation
      return straightDist * 1.3;
    } catch (error) {
      console.log("[Nominatim] Routing failed, using estimated straight-line distance.");
      return straightDist * 1.3;
    }
  }
}

export const nominatimService = new NominatimService();
