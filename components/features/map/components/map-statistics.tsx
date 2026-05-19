import type { MapMarker } from "@/types/weather-map"
import type { MapMode } from "../utils/map-constants"

interface MapStatisticsProps {
  markers: MapMarker[]
  mapMode: MapMode
}

export const MapStatistics = ({ markers, mapMode }: MapStatisticsProps) => {
  if (markers.length === 0) return null

  return (
    <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg p-3 text-xs">
      <div className="font-medium mb-1">Map Statistics</div>
      <div className="space-y-1 text-muted-foreground">
        <div>Locations: {markers.length}</div>
        <div>Active Overlay: {mapMode}</div>
        {markers.filter((m) => m.weather).length > 0 && (
          <div>
            Weather Data: {markers.filter((m) => m.weather).length}/{markers.length}
          </div>
        )}
      </div>
    </div>
  )
}