"use client"

import { WeatherMap } from "@/components/layout/dynamic-components"
import type { UserPreferences } from "@/lib/weather-api"
import type { ActivityType } from "@/lib/risk-assessment"

interface MapTabProps {
  currentLocationCoords: { lat: number; lon: number } | null
  currentLocationName: string
  selectedActivity: ActivityType
  preferences: UserPreferences
  onLocationSelect: (lat: number, lon: number, name: string) => Promise<void>
}

export function MapTab({
  currentLocationCoords,
  currentLocationName,
  selectedActivity,
  preferences,
  onLocationSelect,
}: MapTabProps) {
  return (
    <div className="space-y-6">
      <WeatherMap
        onLocationSelect={onLocationSelect}
        currentLocation={
          currentLocationCoords
            ? {
                lat: currentLocationCoords.lat,
                lon: currentLocationCoords.lon,
                name: currentLocationName,
              }
            : undefined
        }
        activity={selectedActivity}
        preferences={preferences}
      />
    </div>
  )
}