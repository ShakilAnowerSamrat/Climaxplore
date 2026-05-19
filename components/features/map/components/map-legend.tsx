import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Layers,
  Eye,
  Gauge,
} from "lucide-react"
import { getRiskColor } from "../utils/map-utils"
import type { MapMode } from "../utils/map-constants"
import type { ActivityType } from "@/lib/risk-assessment"

interface MapLegendProps {
  mapMode: MapMode
  activity: ActivityType
}

export const MapLegend = ({ mapMode, activity }: MapLegendProps) => {
  const getWeatherIcon = () => {
    switch (mapMode) {
      case "temperature":
        return <Thermometer className="h-4 w-4" />
      case "wind":
        return <Wind className="h-4 w-4" />
      case "precipitation":
        return <Droplets className="h-4 w-4" />
      case "visibility":
        return <Eye className="h-4 w-4" />
      case "pressure":
        return <Gauge className="h-4 w-4" />
      default:
        return <Thermometer className="h-4 w-4" />
    }
  }

  const getTemperatureLegend = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-blue-500" />
        <span className="text-sm">Below 0°C (Freezing)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-green-500" />
        <span className="text-sm">0-10°C (Cold)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-yellow-500" />
        <span className="text-sm">10-20°C (Mild)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-orange-500" />
        <span className="text-sm">20-30°C (Warm)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-red-500" />
        <span className="text-sm">Above 30°C (Hot)</span>
      </div>
    </>
  )

  const getWindLegend = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-green-500" />
        <span className="text-sm">0-5 m/s (Light breeze)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-yellow-500" />
        <span className="text-sm">5-15 m/s (Moderate wind)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-orange-500" />
        <span className="text-sm">15-25 m/s (Strong wind)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-red-500" />
        <span className="text-sm">Above 25 m/s (Gale force)</span>
      </div>
    </>
  )

  const getPrecipitationLegend = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-blue-200" />
        <span className="text-sm">Low (0-30%)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-blue-400" />
        <span className="text-sm">Moderate (30-70%)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-blue-600" />
        <span className="text-sm">High (70%+)</span>
      </div>
    </>
  )

  const getVisibilityLegend = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-gray-200" />
        <span className="text-sm">Excellent (10km+)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-gray-400" />
        <span className="text-sm">Good (5-10km)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-gray-600" />
        <span className="text-sm">Poor (1-5km)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-gray-800" />
        <span className="text-sm">Very poor (less than 1km)</span>
      </div>
    </>
  )

  const getPressureLegend = () => (
    <>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-red-500" />
        <span className="text-sm">Low (less than 1000 hPa)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-yellow-500" />
        <span className="text-sm">Normal (1000-1020 hPa)</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full bg-green-500" />
        <span className="text-sm">High (greater than 1020 hPa)</span>
      </div>
    </>
  )

  const getWeatherOverlayLegend = () => {
    switch (mapMode) {
      case "temperature":
        return getTemperatureLegend()
      case "wind":
        return getWindLegend()
      case "precipitation":
        return getPrecipitationLegend()
      case "visibility":
        return getVisibilityLegend()
      case "pressure":
        return getPressureLegend()
      default:
        return getTemperatureLegend()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Map Legend & Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Risk Level Legend */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Risk Levels for {activity.name}
            </h4>
            <div className="space-y-2">
              {[
                { level: "Low", color: getRiskColor("low"), description: "Perfect conditions", icon: "🟢" },
                { level: "Medium", color: getRiskColor("medium"), description: "Minor considerations", icon: "🟡" },
                { level: "High", color: getRiskColor("high"), description: "Challenging conditions", icon: "🟠" },
                { level: "Extreme", color: getRiskColor("extreme"), description: "Dangerous - avoid", icon: "🔴" },
              ].map((item) => (
                <div key={item.level} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium min-w-16">{item.level}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Overlay Legend */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              {getWeatherIcon()}
              {mapMode.charAt(0).toUpperCase() + mapMode.slice(1)} Overlay
            </h4>
            <div className="space-y-2">{getWeatherOverlayLegend()}</div>
          </div>

          {/* Usage Instructions */}
          <div>
            <h4 className="font-medium text-sm mb-3">How to Use</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Click anywhere on the map to add weather markers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Use "Show Major Cities" to populate with US cities</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Switch overlays to see different weather patterns</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Click markers for detailed weather information</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Hover over markers to see quick temperature info</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Risk levels are calculated based on your activity and preferences</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}