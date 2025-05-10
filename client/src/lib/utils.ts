import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

/**
 * Combines class names with tailwind-merge for optimal styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a temperature value based on the unit system
 */
export function formatTemperature(temp: number, unit: "imperial" | "metric"): string {
  const roundedTemp = Math.round(temp);
  return `${roundedTemp}°${unit === "imperial" ? "F" : "C"}`;
}

/**
 * Formats wind speed with the appropriate unit
 */
export function formatWindSpeed(speed: number, unit: "imperial" | "metric"): string {
  return unit === "imperial" ? `${speed} mph` : `${speed} m/s`;
}

/**
 * Formats a date in a human-readable format
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(dateObj, "EEEE, MMMM do");
}

/**
 * Formats a date to show time
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(dateObj, "h:mm a");
}

/**
 * Formats a date to show day of week
 */
export function formatDay(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(dateObj, "EEE");
}

/**
 * Formats a date for a specific day of the month
 */
export function formatDayMonth(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(dateObj, "MMM d");
}

/**
 * Groups forecast data by day
 */
export function groupForecastByDay(forecastList: any[]): any[] {
  const grouped: Record<string, any[]> = {};
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = format(date, "yyyy-MM-dd");
    
    if (!grouped[day]) {
      grouped[day] = [];
    }
    
    grouped[day].push(item);
  });
  
  return Object.entries(grouped).map(([date, items]) => {
    const temps = items.map(item => item.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    // Use noon forecast item or first item as representative for the day
    const midDayItem = items.find(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 12 && hour <= 14;
    }) || items[0];
    
    return {
      date: parseISO(date),
      minTemp,
      maxTemp,
      weather: midDayItem.weather[0],
      dt: midDayItem.dt,
    };
  });
}

/**
 * Gets appropriate description for UV index
 */
export function getUVIndexDescription(uvIndex: number): string {
  if (uvIndex <= 2) return "Low";
  if (uvIndex <= 5) return "Moderate";
  if (uvIndex <= 7) return "High";
  if (uvIndex <= 10) return "Very High";
  return "Extreme";
}
