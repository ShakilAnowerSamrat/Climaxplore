import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WeatherIcon } from "./weather-icon"
import { getRiskColor } from "../utils/map-utils"
import type { MapMarker } from "@/types/weather-map"

interface WeatherMarkerProps {
  marker: MapMarker
  isSelected: boolean
  mapMode: string
  onSelect: (marker: MapMarker) => void
}

export const WeatherMarker = ({ marker, isSelected, mapMode, onSelect }: WeatherMarkerProps) => {
  const x = ((marker.lon + 180) / 360) * 100
  const y = ((90 - marker.lat) / 180) * 100

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onClick={() => onSelect(marker)}
    >
      <div
        className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ backgroundColor: getRiskColor(marker.risk) }}
      >
        {marker.weather ? <WeatherIcon weather={marker.weather} /> : <MapPin className="h-4 w-4 text-white" />}
      </div>

      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {marker.name}
        {marker.weather && <div className="text-center">{Math.round(marker.weather.current.temp)}°C</div>}
      </div>

      {isSelected && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border rounded-lg p-4 shadow-xl min-w-64 z-20">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-sm font-semibold">{marker.name}</div>
            {marker.weather && <WeatherIcon weather={marker.weather} />}
          </div>
          {marker.weather && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-medium">{Math.round(marker.weather.current.temp)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Feels like:</span>
                  <span className="font-medium">{Math.round(marker.weather.current.feels_like)}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wind:</span>
                  <span className="font-medium">{marker.weather.current.wind_speed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Humidity:</span>
                  <span className="font-medium">{marker.weather.current.humidity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pressure:</span>
                  <span className="font-medium">{(marker.weather as any).current.pressure} hPa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UV Index:</span>
                  <span className="font-medium">{(marker.weather as any).current.uvi || "N/A"}</span>
                </div>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Activity Risk:</span>
                  <Badge
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: getRiskColor(marker.risk),
                      color: "white",
                    }}
                  >
                    {marker.risk?.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {marker.weather.current.weather?.[0]?.description || "Weather conditions"}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}