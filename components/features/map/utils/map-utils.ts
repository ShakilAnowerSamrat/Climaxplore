import type { WeatherData } from "@/lib/weather-api"
import type { MapMode } from "./map-constants"

export const getRiskColor = (risk?: string) => {
  switch (risk) {
    case "low":
      return "#10b981" // emerald-500
    case "medium":
      return "#84cc16" // lime-500
    case "high":
      return "#dc2626" // red-600
    case "extreme":
      return "#7c2d12" // red-900
    default:
      return "#6b7280" // gray-500
  }
}

export const getWeatherOverlayColor = (value: number, mode: MapMode) => {
  switch (mode) {
    case "temperature":
      if (value < 0) return "rgba(59, 130, 246, 0.7)" // blue
      if (value < 10) return "rgba(34, 197, 94, 0.7)" // green
      if (value < 20) return "rgba(234, 179, 8, 0.7)" // yellow
      if (value < 30) return "rgba(249, 115, 22, 0.7)" // orange
      return "rgba(239, 68, 68, 0.7)" // red
    case "wind":
      if (value < 5) return "rgba(34, 197, 94, 0.5)" // green
      if (value < 15) return "rgba(234, 179, 8, 0.5)" // yellow
      if (value < 25) return "rgba(249, 115, 22, 0.5)" // orange
      return "rgba(239, 68, 68, 0.5)" // red
    case "precipitation":
      return `rgba(59, 130, 246, ${Math.min(value / 100, 0.8)})` // blue with opacity based on precipitation
    case "visibility":
      const opacity = Math.max(0.2, 1 - value / 10000)
      return `rgba(107, 114, 128, ${opacity})` // gray with opacity based on visibility
    case "pressure":
      if (value < 1000) return "rgba(239, 68, 68, 0.6)" // red (low pressure)
      if (value > 1020) return "rgba(34, 197, 94, 0.6)" // green (high pressure)
      return "rgba(234, 179, 8, 0.6)" // yellow (normal pressure)
    default:
      return "rgba(107, 114, 128, 0.4)" // gray
  }
}

export const convertCoordinates = (
  event: React.MouseEvent<HTMLDivElement>,
  mapCenter: { lat: number; lon: number },
  zoom: number,
  mapRef: React.RefObject<HTMLDivElement>
) => {
  if (!mapRef.current) return { lat: 0, lon: 0 }

  const rect = mapRef.current.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Convert pixel coordinates to lat/lon (simplified calculation)
  const lat = mapCenter.lat + ((rect.height / 2 - y) / rect.height) * (zoom * 0.1)
  const lon = mapCenter.lon + ((x - rect.width / 2) / rect.width) * (zoom * 0.1)

  return { lat, lon }
}

export const getWeatherValue = (weather: WeatherData, mode: MapMode) => {
  switch (mode) {
    case "temperature":
      return weather.current.temp
    case "wind":
      return weather.current.wind_speed
    case "precipitation":
      return weather.current.humidity
    case "visibility":
      return weather.current.visibility || 10000
    case "pressure":
      return (weather as any).current.pressure || 1013
    default:
      return 0
  }
}