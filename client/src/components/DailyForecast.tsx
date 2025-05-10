import React from "react";
import { useWeather } from "@/hooks/use-weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDay, formatDayMonth, groupForecastByDay } from "@/lib/utils";
import WeatherIcon from "./WeatherIcon";

export default function DailyForecast() {
  const { forecastData, isLoading, temperatureUnit } = useWeather();

  if (isLoading || !forecastData) {
    return (
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
        <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-bold">5-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-6 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group forecast by day
  const dailyForecast = groupForecastByDay(forecastData.list).slice(0, 5);

  const getDayLabel = (date: Date, index: number) => {
    if (index === 0) return "Today";
    return formatDay(date);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl font-bold">5-Day Forecast</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {dailyForecast.map((day, index) => {
            const tempRange = ((day.maxTemp - day.minTemp) / 30) * 100; // Scale to percentage for the bar
            const barWidth = Math.min(Math.max(tempRange, 40), 95); // Ensure bar is between 40-95% width for UI

            return (
              <div 
                key={day.dt} 
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="w-24">
                  <p className="font-medium">{getDayLabel(day.date, index)}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {formatDayMonth(day.date)}
                  </p>
                </div>
                
                <div className="flex items-center">
                  <WeatherIcon 
                    iconCode={day.weather.icon} 
                    description={day.weather.description}
                    size="small"
                  />
                  <span className="ml-2 w-24 capitalize">{day.weather.description}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="font-semibold w-10 text-right">
                    {Math.round(day.maxTemp)}°
                  </span>
                  <div className="mx-2 w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-red-400 h-1.5 rounded-full" 
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 w-10">
                    {Math.round(day.minTemp)}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
