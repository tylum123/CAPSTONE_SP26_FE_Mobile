/**
 * AI CONTEXT:
 * This file is part of the CAPSTONE_SP26_FE_Mobile project.
 * Custom hook for fetching weather data based on GPS coordinates.
 * Falls back to profile-based weather if location permissions are denied.
 */
import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { weatherService } from "../services/weather.service";
import { WeatherDTO } from "../types/export_type_definitions";

export const useLocalWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Request Permission
      setLocationStatus("requesting_permission");
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        console.log("Permission to access location was denied, falling back to profile weather");
        setLocationStatus("denied");
        const data = await weatherService.getWeather();
        setWeatherData(data);
        return;
      }

      // 2. Get Coordinates
      setLocationStatus("fetching_location");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      // 3. Fetch Weather by Coords
      setLocationStatus("fetching_weather");
      const data = await weatherService.getWeatherByCoords(latitude, longitude);
      setWeatherData(data);
      setLocationStatus("success");
    } catch (err) {
      console.error("Error fetching local weather:", err);
      setLocationStatus("error_fallback");
      // Fallback
      try {
        const data = await weatherService.getWeather();
        setWeatherData(data);
      } catch (fallbackErr) {
        setError("Không thể tải thông tin thời tiết");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { 
    weatherData, 
    isLoading, 
    error, 
    locationStatus,
    refetch: fetchWeather 
  };
};
