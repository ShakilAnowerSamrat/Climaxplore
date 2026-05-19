import { useState, useCallback } from "react"
import { getCurrentWeather } from "@/lib/weather-api"
import { assessActivityRisk } from "@/lib/risk-assessment"
import type { MapMarker } from "@/types/weather-map"
import type { ActivityType } from "@/lib/risk-assessment"
import type { UserPreferences } from "@/lib/weather-api"

export const useWeatherMarkers = (
  activity: ActivityType,
  preferences: UserPreferences
) => {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [loading, setLoading] = useState(false)

  const loadWeatherForMarker = useCallback(async (marker: MapMarker) => {
    try {
      const weather = await getCurrentWeather(marker.lat, marker.lon)
      const riskAssessment = assessActivityRisk(weather, activity, preferences)

      const updatedMarker = {
        ...marker,
        weather,
        risk: riskAssessment.overall,
      }

      setMarkers((prev) =>
        prev.map((m) =>
          m.lat === marker.lat && m.lon === marker.lon ? updatedMarker : m
        )
      )
    } catch (error) {
      console.error("Failed to load weather for marker:", error)
    }
  }, [activity, preferences])

  const addMarker = useCallback(async (marker: MapMarker) => {
    setMarkers((prev) => [...prev, marker])
    await loadWeatherForMarker(marker)
  }, [loadWeatherForMarker])

  const updateMarkers = useCallback((newMarkers: MapMarker[]) => {
    setMarkers(newMarkers)
  }, [])

  const clearMarkers = useCallback(() => {
    setMarkers([])
  }, [])

  return {
    markers,
    loading,
    setLoading,
    loadWeatherForMarker,
    addMarker,
    updateMarkers,
    clearMarkers,
  }
}