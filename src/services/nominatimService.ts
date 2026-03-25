import axios from "axios";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

class NominatimService {
  private readonly baseUrl = "https://nominatim.openstreetmap.org/search";

  /**
   * Geocodes an address string to latitude/longitude using OpenStreetMap's Nominatim API.
   * @param address Full address string (e.g., "123 Đường 3/2, Phường 10, Quận 10, Hồ Chí Minh")
   * @returns Coordinates or null if not found
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!address || address.trim() === "") return null;

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          // Nominatim requires a User-Agent to avoid blocking
          "User-Agent": "Capstone_SP26_FE_Mobile/1.0",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Nominatim geocoding error:", error);
      return null;
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
}

export const nominatimService = new NominatimService();
