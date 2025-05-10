import React, { useEffect } from "react";
import { useWeather } from "@/hooks/use-weather";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import WeatherMap from "@/components/WeatherMap";
import WeatherAlerts from "@/components/WeatherAlerts";
import SavedLocations from "@/components/SavedLocations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomePage() {
  const { currentLocation, setCurrentLocation } = useWeather();

  // Try to get user's location when the page loads if no location is set
  useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Default to New York if geolocation fails
            setCurrentLocation({
              name: "New York",
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              country: "US",
            });
          } catch (error) {
            console.error("Error getting location:", error);
            // Default to New York if geolocation fails
            setCurrentLocation({
              name: "New York",
              lat: 40.7128,
              lon: -74.006,
              country: "US",
            });
          }
        },
        () => {
          // Default to New York if geolocation fails
          setCurrentLocation({
            name: "New York",
            lat: 40.7128,
            lon: -74.006,
            country: "US",
          });
        }
      );
    }
  }, [currentLocation, setCurrentLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <SearchBar />
        
        {currentLocation && (
          <>
            <CurrentWeather />
            <HourlyForecast />
            <DailyForecast />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <WeatherMap />
              <WeatherAlerts />
            </div>
            
            <SavedLocations />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
