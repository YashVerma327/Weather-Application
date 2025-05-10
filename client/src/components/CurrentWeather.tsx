import React from "react";
import { useWeather } from "@/hooks/use-weather";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate, formatTemperature, formatWindSpeed } from "@/lib/utils";
import { Heart, CloudRain, Wind, Gauge, Thermometer } from "lucide-react";
import WeatherIcon from "./WeatherIcon";
import { useToast } from "@/hooks/use-toast";

export default function CurrentWeather() {
  const { toast } = useToast();
  const { 
    currentLocation, 
    weatherData, 
    temperatureUnit, 
    toggleTemperatureUnit,
    isLoading 
  } = useWeather();
  const { user } = useAuth();

  const saveLocationMutation = useMutation({
    mutationFn: async () => {
      if (!currentLocation || !weatherData) return;
      
      const locationData = {
        name: weatherData.name,
        city: weatherData.name,
        country: weatherData.sys.country,
        lat: currentLocation.lat.toString(),
        lon: currentLocation.lon.toString(),
      };
      
      const res = await apiRequest("POST", "/api/locations", locationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location saved",
        description: `${weatherData?.name} has been added to your saved locations.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving location",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveLocation = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save locations.",
        variant: "destructive",
      });
      return;
    }
    
    saveLocationMutation.mutate();
  };

  if (isLoading || !weatherData) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-40" />
              </div>
              <Skeleton className="h-6 w-60 mb-6" />
              <div className="flex items-center">
                <Skeleton className="w-24 h-24 mr-4 rounded-full" />
                <div>
                  <Skeleton className="h-12 w-32 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDate = new Date();
  const updateTime = new Date(weatherData.dt * 1000);
  const minutesAgo = Math.floor((currentDate.getTime() - updateTime.getTime()) / 60000);

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div>
            <div className="flex items-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold font-roboto">{weatherData.name}</h2>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{weatherData.sys.country}</span>
              <button 
                className="ml-3 text-gray-400 hover:text-primary" 
                title="Add to favorites"
                onClick={handleSaveLocation}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {formatDate(currentDate)} • Updated {minutesAgo} min ago
            </p>
            
            <div className="flex items-center">
              {weatherData.weather[0] && (
                <WeatherIcon 
                  iconCode={weatherData.weather[0].icon} 
                  description={weatherData.weather[0].description}
                  size="large"
                  className="mr-4"
                />
              )}
              
              <div>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">{Math.round(weatherData.main.temp)}</span>
                  <span className="text-2xl ml-1">°{temperatureUnit === "imperial" ? "F" : "C"}</span>
                  
                  {/* Temperature Unit Toggle */}
                  <div className="ml-3 flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                    <Button 
                      variant={temperatureUnit === "imperial" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => toggleTemperatureUnit()}
                      className={`text-xs px-2 py-1 rounded-full ${
                        temperatureUnit === "imperial" 
                          ? "bg-primary text-white" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      °F
                    </Button>
                    <Button 
                      variant={temperatureUnit === "metric" ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => toggleTemperatureUnit()}
                      className={`text-xs px-2 py-1 rounded-full ${
                        temperatureUnit === "metric" 
                          ? "bg-primary text-white" 
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      °C
                    </Button>
                  </div>
                </div>
                
                <p className="text-xl text-gray-700 dark:text-gray-300 capitalize">
                  {weatherData.weather[0]?.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Humidity</p>
              <p className="font-semibold flex items-center">
                <CloudRain className="text-blue-400 mr-2 h-4 w-4" />
                {weatherData.main.humidity}%
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Wind</p>
              <p className="font-semibold flex items-center">
                <Wind className="text-gray-400 mr-2 h-4 w-4" />
                {formatWindSpeed(weatherData.wind.speed, temperatureUnit)}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Pressure</p>
              <p className="font-semibold flex items-center">
                <Gauge className="text-gray-400 mr-2 h-4 w-4" />
                {weatherData.main.pressure} hPa
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Feels Like</p>
              <p className="font-semibold flex items-center">
                <Thermometer className="text-red-400 mr-2 h-4 w-4" />
                {formatTemperature(weatherData.main.feels_like, temperatureUnit)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
