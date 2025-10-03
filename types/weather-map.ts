import type { ActivityType } from "@/lib/risk-assessment"
import type { UserPreferences, WeatherData } from "@/lib/weather-api"

export interface MapMarker {
  lat: number
  lon: number
  name: string
  weather?: WeatherData
  risk?: string
}

export interface WeatherMapProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void
  currentLocation?: {
    lat: number
    lon: number
    name: string
  }
  activity: ActivityType
  preferences: UserPreferences
}
