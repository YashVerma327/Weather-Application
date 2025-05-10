import React from "react";
import { useWeather } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";
import WeatherIcon from "./WeatherIcon";

export default function HourlyForecast() {
  const { forecastData, isLoading, temperatureUnit } = useWeather();

  const getTimeLabel = (dateTime: number, index: number) => {
    if (index === 0) return "Now";
    return formatTime(new Date(dateTime * 1000));
  };

  if (isLoading || !forecastData) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-bold">Hourly Forecast</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex space-x-6 pb-2 overflow-x-auto">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="w-10 h-10 rounded-full my-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the next 24 hours of forecast data (limited to 10 items for UI)
  const hourlyForecast = forecastData.list.slice(0, 10);

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-bold">Hourly Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <div className="flex space-x-6 min-w-max pb-2">
          {hourlyForecast.map((hour, index) => (
            <div 
              key={hour.dt} 
              className="flex flex-col items-center"
            >
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                {getTimeLabel(hour.dt, index)}
              </p>
              <WeatherIcon 
                iconCode={hour.weather[0].icon} 
                description={hour.weather[0].description}
                size="small"
                className="my-1"
              />
              <p className="font-semibold">
                {Math.round(hour.main.temp)}°
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
