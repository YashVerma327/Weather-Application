import { WeatherData, ForecastData, GeocodingData, AlertData } from "@shared/schema";

// Access the API key from environment variables
// Using OPENWEATHER_API_KEY (server-side) and falling back to VITE_OPENWEATHER_API_KEY (client-side) if needed
const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org";

export async function fetchCurrentWeather(lat: string, lon: string, units = "imperial"): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add OPENWEATHER_API_KEY or VITE_OPENWEATHER_API_KEY to your environment variables.");
  }

  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Weather API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
}

export async function fetchForecast(lat: string, lon: string, units = "imperial"): Promise<ForecastData> {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.");
  }

  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Forecast API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
}

export async function fetchWeatherAlerts(lat: string, lon: string): Promise<AlertData[]> {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.");
  }

  // Note: The One Call API is a paid feature in OpenWeatherMap
  // We'll handle both cases - if the API key has access or not
  const url = `${BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // If the API key doesn't have access to One Call API, we'll return an empty array
      if (response.status === 401) {
        console.log("Weather alerts API requires a paid subscription - returning empty alerts array");
        return [];
      }
      
      const errorText = await response.text();
      console.warn(`Weather alerts API warning: ${response.status} ${errorText}`);
      return [];
    }
    
    const data = await response.json();
    return data.alerts || [];
  } catch (error) {
    console.warn("Weather alerts could not be fetched:", error);
    return [];
  }
}

export async function searchLocation(query: string): Promise<GeocodingData[]> {
  if (!API_KEY) {
    throw new Error("OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your environment variables.");
  }

  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Geocoding API error: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching location:", error);
    throw error;
  }
}

export function getWeatherIconUrl(iconCode: string, size = "2x"): string {
  return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
}
