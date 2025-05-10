import React from "react";
import { useWeather } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Check, Info, GlassWater, Home, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function WeatherAlerts() {
  const { weatherData, isLoading } = useWeather();

  const getMockAlert = () => {
    // This is just for UI display - in a real app, this would come from the API
    if (!weatherData) return null;
    
    // Mock heat advisory if temperature is above 85°F (29.4°C)
    const temp = weatherData.main.temp;
    if (temp > 85) {
      return {
        title: "Heat Advisory",
        description: "Heat index values up to 105 expected from 12 PM to 8 PM EDT.",
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        type: "warning" as const
      };
    }
    
    // Mock severe thunderstorm if humidity is high
    if (weatherData.main.humidity > 85) {
      return {
        title: "Severe Thunderstorm Watch",
        description: "Conditions are favorable for the development of severe thunderstorms.",
        startTime: new Date(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        type: "danger" as const
      };
    }
    
    // Mock flood warning if it's raining
    if (weatherData.weather[0].main.toLowerCase().includes("rain")) {
      return {
        title: "Flood Warning",
        description: "Heavy rainfall may cause flooding in low-lying areas.",
        startTime: new Date(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        type: "danger" as const
      };
    }
    
    return null;
  };

  const alert = getMockAlert();

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-bold">Weather Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-10 w-40 mt-4 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-bold">Weather Alerts</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {alert ? (
          <div className={`mb-4 p-4 ${
            alert.type === "warning" 
              ? "bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-warning" 
              : "bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border-l-4 border-destructive"
          } rounded-r-lg`}>
            <div className="flex items-start">
              <AlertTriangle className={`${
                alert.type === "warning" ? "text-warning" : "text-destructive"
              } mt-1 mr-3 h-5 w-5`} />
              <div>
                <h4 className={`font-bold ${
                  alert.type === "warning" ? "text-warning" : "text-destructive"
                }`}>
                  {alert.title}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {alert.description}
                </p>
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Effective: {formatDate(alert.startTime)}, {new Date(alert.startTime).toLocaleTimeString()} - {new Date(alert.endTime).toLocaleTimeString()}
                  </span>
                  <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                    Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <Check className="h-8 w-8 text-success mb-2" />
            <p>No active weather alerts for this location</p>
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Recommended Actions</h4>
          <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <GlassWater className="text-blue-500 mt-1 mr-2 h-4 w-4" />
              <span>Stay hydrated by drinking plenty of fluids</span>
            </li>
            <li className="flex items-start">
              <Home className="text-green-500 mt-1 mr-2 h-4 w-4" />
              <span>Stay in air-conditioned rooms when possible</span>
            </li>
            <li className="flex items-start">
              <Sun className="text-yellow-500 mt-1 mr-2 h-4 w-4" />
              <span>Limit outdoor activities during peak heat</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-6 text-center">
          <Button variant="link" className="text-primary">
            <Info className="h-4 w-4 mr-1" />
            Set up alert notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
