import React from "react";

type WeatherIconProps = {
  iconCode: string;
  description: string;
  size?: "small" | "medium" | "large";
  className?: string;
};

const iconMap: Record<string, string> = {
  "01d": "sun", // clear sky day
  "01n": "moon", // clear sky night
  "02d": "cloud-sun", // few clouds day
  "02n": "cloud-moon", // few clouds night
  "03d": "cloud", // scattered clouds
  "03n": "cloud", // scattered clouds
  "04d": "clouds", // broken clouds
  "04n": "clouds", // broken clouds
  "09d": "cloud-drizzle", // shower rain
  "09n": "cloud-drizzle", // shower rain
  "10d": "cloud-rain", // rain day
  "10n": "cloud-rain", // rain night
  "11d": "cloud-lightning", // thunderstorm
  "11n": "cloud-lightning", // thunderstorm
  "13d": "cloud-snow", // snow
  "13n": "cloud-snow", // snow
  "50d": "wind", // mist
  "50n": "wind", // mist
};

export default function WeatherIcon({ iconCode, description, size = "medium", className = "" }: WeatherIconProps) {
  const getOpenWeatherIconUrl = (code: string) => {
    return `https://openweathermap.org/img/wn/${code}@2x.png`;
  };

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-24 h-24",
  };

  return (
    <img
      src={getOpenWeatherIconUrl(iconCode)}
      alt={description}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
