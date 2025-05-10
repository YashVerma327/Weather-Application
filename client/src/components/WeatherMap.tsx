import React, { useState } from "react";
import { useWeather } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

type MapLayer = "precipitation" | "temp" | "clouds";

export default function WeatherMap() {
  const { currentLocation, isLoading } = useWeather();
  const [mapType, setMapType] = useState<MapLayer>("precipitation");
  const [zoom, setZoom] = useState(8);
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 12));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 4));
  };

  if (isLoading || !currentLocation) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-bold">Weather Map</CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80 relative">
          <Skeleton className="w-full h-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Use the environment variable for the API key
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "default_key";
  
  const getMapUrl = () => {
    let layer;
    switch (mapType) {
      case "temp":
        layer = "temp_new";
        break;
      case "clouds":
        layer = "clouds_new";
        break;
      case "precipitation":
      default:
        layer = "precipitation_new";
    }
    
    return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${API_KEY}`;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full">
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Weather Map</CardTitle>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={mapType === "precipitation" ? "default" : "outline"}
            className={`text-sm ${mapType === "precipitation" ? "bg-primary text-white" : ""}`}
            onClick={() => setMapType("precipitation")}
          >
            Radar
          </Button>
          <Button 
            size="sm" 
            variant={mapType === "clouds" ? "default" : "outline"}
            className={`text-sm ${mapType === "clouds" ? "bg-primary text-white" : ""}`}
            onClick={() => setMapType("clouds")}
          >
            Clouds
          </Button>
          <Button 
            size="sm" 
            variant={mapType === "temp" ? "default" : "outline"}
            className={`text-sm ${mapType === "temp" ? "bg-primary text-white" : ""}`}
            onClick={() => setMapType("temp")}
          >
            Temperature
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 h-80 relative">
        {/* Using iframe to embed the OpenWeatherMap layer */}
        <iframe
          title="Weather Map"
          className="w-full h-full rounded-lg border-0"
          src={`https://openweathermap.org/weathermap?basemap=map&cities=false&layer=${mapType}&lat=${currentLocation.lat}&lon=${currentLocation.lon}&zoom=${zoom}`}
        ></iframe>
        
        {/* Map controls */}
        <div className="absolute right-8 top-8 flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Map legend */}
        <div className="absolute left-8 bottom-8 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 p-2 rounded shadow-sm">
          <div className="flex items-center space-x-1">
            {mapType === "precipitation" && (
              <>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-xs">Light</span>
                
                <div className="w-3 h-3 rounded-full bg-yellow-400 ml-2"></div>
                <span className="text-xs">Moderate</span>
                
                <div className="w-3 h-3 rounded-full bg-red-500 ml-2"></div>
                <span className="text-xs">Heavy</span>
              </>
            )}
            
            {mapType === "temp" && (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Cold</span>
                
                <div className="w-3 h-3 rounded-full bg-green-400 ml-2"></div>
                <span className="text-xs">Mild</span>
                
                <div className="w-3 h-3 rounded-full bg-red-500 ml-2"></div>
                <span className="text-xs">Hot</span>
              </>
            )}
            
            {mapType === "clouds" && (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-200"></div>
                <span className="text-xs">Light</span>
                
                <div className="w-3 h-3 rounded-full bg-blue-400 ml-2"></div>
                <span className="text-xs">Medium</span>
                
                <div className="w-3 h-3 rounded-full bg-blue-600 ml-2"></div>
                <span className="text-xs">Dense</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
