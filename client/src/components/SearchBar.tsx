import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { GeocodingData } from "@shared/schema";
import { useWeather } from "@/hooks/use-weather";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { setCurrentLocation } = useWeather();

  const { data: suggestions, isLoading } = useQuery<GeocodingData[]>({
    queryKey: [`/api/location/search?q=${encodeURIComponent(searchTerm)}`],
    enabled: searchTerm.length > 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (location: GeocodingData) => {
    setCurrentLocation(location);
    setSearchTerm(location.name + (location.state ? `, ${location.state}` : "") + `, ${location.country}`);
    setShowSuggestions(false);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `/api/location/search?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            
            if (!response.ok) {
              throw new Error("Failed to get location");
            }
            
            const data = await response.json();
            if (data && data.length > 0) {
              handleSelectLocation(data[0]);
            }
          } catch (error) {
            console.error("Error getting location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8" ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a location..."
          className="w-full px-4 py-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary pr-20"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length > 2 && setShowSuggestions(true)}
        />
        <div className="absolute right-3 top-2 flex space-x-2">
          <button 
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary"
            onClick={handleGeolocation}
            title="Use current location"
          >
            <MapPin className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-gray-500 dark:text-gray-400"
            title="Search locations"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
        
        {showSuggestions && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
            {isLoading ? (
              <div className="p-2">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : !suggestions || suggestions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                No locations found
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}`}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  onClick={() => handleSelectLocation(suggestion)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  <span>
                    {suggestion.name}
                    {suggestion.state && `, ${suggestion.state}`}, {suggestion.country}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
