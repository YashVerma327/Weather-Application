import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WeatherData, ForecastData, GeocodingData, AlertData } from "@shared/schema";

type WeatherContextType = {
  currentLocation: GeocodingData | null;
  setCurrentLocation: (location: GeocodingData) => void;
  temperatureUnit: "imperial" | "metric";
  toggleTemperatureUnit: () => void;
  weatherData: WeatherData | null;
  forecastData: ForecastData | null;
  alertsData: AlertData[];
  isLoading: boolean;
  error: Error | null;
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  // Use New York City as the default location
  const [currentLocation, setCurrentLocation] = useState<GeocodingData | null>({
    name: "New York",
    lat: 40.7128,
    lon: -74.0060,
    country: "US",
    state: "New York"
  });
  const [temperatureUnit, setTemperatureUnit] = useState<"imperial" | "metric">("imperial");

  const {
    data: weatherData,
    isLoading: isWeatherLoading,
    error: weatherError,
  } = useQuery<WeatherData | null>({
    queryKey: [
      `/api/weather?lat=${currentLocation?.lat}&lon=${currentLocation?.lon}&units=${temperatureUnit}`,
    ],
    enabled: !!currentLocation,
  });

  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastError,
  } = useQuery<ForecastData | null>({
    queryKey: [
      `/api/forecast?lat=${currentLocation?.lat}&lon=${currentLocation?.lon}&units=${temperatureUnit}`,
    ],
    enabled: !!currentLocation,
  });

  const {
    data: alertsData,
    isLoading: isAlertsLoading,
    error: alertsError,
  } = useQuery<AlertData[]>({
    queryKey: [`/api/weather/alerts?lat=${currentLocation?.lat}&lon=${currentLocation?.lon}`],
    enabled: !!currentLocation,
  });

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prevUnit => (prevUnit === "imperial" ? "metric" : "imperial"));
  };

  const isLoading = isWeatherLoading || isForecastLoading || isAlertsLoading;
  const error = weatherError || forecastError || alertsError;

  return (
    <WeatherContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        temperatureUnit,
        toggleTemperatureUnit,
        weatherData: weatherData || null,
        forecastData: forecastData || null,
        alertsData: alertsData || [],
        isLoading,
        error,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
