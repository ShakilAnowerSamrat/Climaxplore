"use client"

import { HistoricalWeatherData } from "@/components/layout/dynamic-components"

interface HistoricalTabProps {
  currentLocationCoords: { lat: number; lon: number } | null
  currentLocationName: string
}

export function HistoricalTab({ currentLocationCoords, currentLocationName }: HistoricalTabProps) {
  return (
    <div className="space-y-6">
      {currentLocationCoords ? (
        <HistoricalWeatherData
          lat={currentLocationCoords.lat}
          lon={currentLocationCoords.lon}
          location={currentLocationName}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select a location to view historical weather data</p>
        </div>
      )}
    </div>
  )
}