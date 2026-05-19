import { getWeatherOverlayColor, getWeatherValue } from "../utils/map-utils"
import type { MapMarker } from "@/types/weather-map"
import type { MapMode } from "../utils/map-constants"

interface WeatherOverlayProps {
  markers: MapMarker[]
  mapMode: MapMode
}

export const WeatherOverlay = ({ markers, mapMode }: WeatherOverlayProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {markers.map((marker, index) => {
        if (!marker.weather) return null

        const value = getWeatherValue(marker.weather, mapMode)
        const x = ((marker.lon + 180) / 360) * 100
        const y = ((90 - marker.lat) / 180) * 100

        return (
          <div
            key={`overlay-${index}`}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: "80px",
              height: "80px",
              backgroundColor: getWeatherOverlayColor(value, mapMode),
              transform: "translate(-50%, -50%)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
        )
      })}
    </div>
  )
}