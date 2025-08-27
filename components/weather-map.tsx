"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Layers,
  Navigation,
  Crosshair,
  Cloud,
  Sun,
  CloudRain,
  Eye,
  Gauge,
} from "lucide-react"
import { getCurrentWeather } from "@/lib/weather-api"
import { assessActivityRisk, type ActivityType } from "@/lib/risk-assessment"
import type { UserPreferences } from "@/lib/weather-api"
import { WeatherMap3D } from "./weather-map-3d"

interface WeatherMapProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void
  currentLocation?: { lat: number; lon: number; name: string }
  activity: ActivityType
  preferences: UserPreferences
}

interface MapMarker {
  lat: number
  lon: number
  name: string
  weather?: any
  risk?: string
}

const MAJOR_CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago", lat: 41.8781, lon: -87.6298 },
  { name: "Houston", lat: 29.7604, lon: -95.3698 },
  { name: "Phoenix", lat: 33.4484, lon: -112.074 },
  { name: "Philadelphia", lat: 39.9526, lon: -75.1652 },
  { name: "San Antonio", lat: 29.4241, lon: -98.4936 },
  { name: "San Diego", lat: 32.7157, lon: -117.1611 },
  { name: "Dallas", lat: 32.7767, lon: -96.797 },
  { name: "San Jose", lat: 37.3382, lon: -121.8863 },
  { name: "Miami", lat: 25.7617, lon: -80.1918 },
  { name: "Seattle", lat: 47.6062, lon: -122.3321 },
  { name: "Denver", lat: 39.7392, lon: -104.9903 },
  { name: "Boston", lat: 42.3601, lon: -71.0589 },
  { name: "Atlanta", lat: 33.749, lon: -84.388 },
]

export function WeatherMap({ onLocationSelect, currentLocation, activity, preferences }: WeatherMapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lon: -74.006 }) // Default to NYC
  const [zoom, setZoom] = useState(8)
  const [loading, setLoading] = useState(false)
  const [mapMode, setMapMode] = useState<"temperature" | "wind" | "precipitation" | "visibility" | "pressure">(
    "temperature",
  )
  const [showCities, setShowCities] = useState(false)
  const [is3DMode, setIs3DMode] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  // Initialize map with current location
  useEffect(() => {
    if (currentLocation) {
      setMapCenter({ lat: currentLocation.lat, lon: currentLocation.lon })
      const marker: MapMarker = {
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        name: currentLocation.name,
      }
      setMarkers([marker])
      loadWeatherForMarker(marker)
    }
  }, [currentLocation])

  const loadWeatherForMarker = async (marker: MapMarker) => {
    try {
      const weather = await getCurrentWeather(marker.lat, marker.lon)
      const riskAssessment = assessActivityRisk(weather, activity, preferences)

      const updatedMarker = {
        ...marker,
        weather,
        risk: riskAssessment.overall,
      }

      setMarkers((prev) => prev.map((m) => (m.lat === marker.lat && m.lon === marker.lon ? updatedMarker : m)))
    } catch (error) {
      console.error("Failed to load weather for marker:", error)
    }
  }

  const populateMajorCities = async () => {
    setLoading(true)
    try {
      const cityMarkers = MAJOR_CITIES.slice(0, 8).map((city) => ({
        lat: city.lat,
        lon: city.lon,
        name: city.name,
      }))

      setMarkers(cityMarkers)
      setShowCities(true)

      // Load weather data for each city
      for (const marker of cityMarkers) {
        await loadWeatherForMarker(marker)
      }
    } catch (error) {
      console.error("Failed to populate cities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to lat/lon (simplified calculation)
    const lat = mapCenter.lat + ((rect.height / 2 - y) / rect.height) * (zoom * 0.1)
    const lon = mapCenter.lon + ((x - rect.width / 2) / rect.width) * (zoom * 0.1)

    setLoading(true)

    try {
      const locationName = `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`

      const newMarker: MapMarker = {
        lat,
        lon,
        name: locationName,
      }

      setMarkers((prev) => [...prev, newMarker])
      await loadWeatherForMarker(newMarker)
      onLocationSelect(lat, lon, locationName)
    } catch (error) {
      console.error("Failed to add location:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker)
    onLocationSelect(marker.lat, marker.lon, marker.name)
  }

  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      setMapCenter({ lat: latitude, lon: longitude })

      const marker: MapMarker = {
        lat: latitude,
        lon: longitude,
        name: "Current Location",
      }

      setMarkers([marker])
      await loadWeatherForMarker(marker)
      onLocationSelect(latitude, longitude, "Current Location")
    })
  }

  const getRiskColor = (risk?: string) => {
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

  const getWeatherOverlayColor = (value: number, mode: string) => {
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

  const getWeatherIcon = (weather: any) => {
    if (!weather?.current?.weather?.[0]) return <Cloud className="h-4 w-4" />

    const condition = weather.current.weather[0].main.toLowerCase()
    switch (condition) {
      case "clear":
        return <Sun className="h-4 w-4 text-yellow-500" />
      case "rain":
        return <CloudRain className="h-4 w-4 text-blue-500" />
      case "clouds":
        return <Cloud className="h-4 w-4 text-gray-500" />
      default:
        return <Cloud className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Weather Map
          </CardTitle>
          <CardDescription>
            Explore weather conditions across multiple locations with detailed overlays and risk assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={getCurrentLocationWeather}>
              <Navigation className="h-4 w-4 mr-2" />
              Current Location
            </Button>
            <Button variant="outline" size="sm" onClick={populateMajorCities} disabled={loading}>
              <MapPin className="h-4 w-4 mr-2" />
              Show Major Cities
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMarkers([])
                setShowCities(false)
              }}
            >
              Clear All
            </Button>
            <Button variant={is3DMode ? "default" : "outline"} size="sm" onClick={() => setIs3DMode(!is3DMode)}>
              <Layers className="h-4 w-4 mr-2" />
              {is3DMode ? "2D Map" : "3D Globe"}
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Weather Overlay:</span>
              <Tabs value={mapMode} onValueChange={(value) => setMapMode(value as any)} className="w-auto">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="temperature" className="text-xs">
                    <Thermometer className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="wind" className="text-xs">
                    <Wind className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="precipitation" className="text-xs">
                    <Droplets className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="visibility" className="text-xs">
                    <Eye className="h-3 w-3" />
                  </TabsTrigger>
                  <TabsTrigger value="pressure" className="text-xs">
                    <Gauge className="h-3 w-3" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Display */}
      <Card>
        <CardContent className="p-0">
          {is3DMode ? (
            <WeatherMap3D
              markers={markers}
              onLocationSelect={onLocationSelect}
              activity={activity}
              preferences={preferences}
              mapMode={mapMode}
            />
          ) : (
            <div
              ref={mapRef}
              className="relative w-full h-96 bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-blue-950 dark:via-green-950 dark:to-blue-900 cursor-crosshair overflow-hidden rounded-lg"
              onClick={handleMapClick}
            >
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <pattern id="majorGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <rect width="100%" height="100%" fill="url(#majorGrid)" />
                </svg>
              </div>

              <div className="absolute inset-0 pointer-events-none">
                {markers.map((marker, index) => {
                  if (!marker.weather) return null

                  const value =
                    mapMode === "temperature"
                      ? marker.weather.current.temp
                      : mapMode === "wind"
                        ? marker.weather.current.wind_speed
                        : mapMode === "precipitation"
                          ? marker.weather.current.humidity
                          : mapMode === "visibility"
                            ? marker.weather.current.visibility || 10000
                            : marker.weather.current.pressure || 1013

                  return (
                    <div
                      key={`overlay-${index}`}
                      className="absolute rounded-full animate-pulse"
                      style={{
                        left: `${50 + ((marker.lon - mapCenter.lon) / (zoom * 0.1)) * 50}%`,
                        top: `${50 - ((marker.lat - mapCenter.lat) / (zoom * 0.1)) * 50}%`,
                        width: "100px",
                        height: "100px",
                        backgroundColor: getWeatherOverlayColor(value, mapMode),
                        transform: "translate(-50%, -50%)",
                        border: "2px solid rgba(255,255,255,0.3)",
                      }}
                    />
                  )
                })}
              </div>

              {markers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                  style={{
                    left: `${50 + ((marker.lon - mapCenter.lon) / (zoom * 0.1)) * 50}%`,
                    top: `${50 - ((marker.lat - mapCenter.lat) / (zoom * 0.1)) * 50}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkerClick(marker)
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full border-3 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: getRiskColor(marker.risk) }}
                  >
                    {marker.weather ? getWeatherIcon(marker.weather) : <MapPin className="h-4 w-4 text-white" />}
                  </div>

                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {marker.name}
                    {marker.weather && <div className="text-center">{Math.round(marker.weather.current.temp)}°C</div>}
                  </div>

                  {selectedMarker === marker && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border rounded-lg p-4 shadow-xl min-w-64 z-20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-sm font-semibold">{marker.name}</div>
                        {marker.weather && getWeatherIcon(marker.weather)}
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
                              <span className="font-medium">{marker.weather.current.pressure} hPa</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">UV Index:</span>
                              <span className="font-medium">{marker.weather.current.uvi || "N/A"}</span>
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
              ))}

              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <Crosshair className="h-6 w-6 text-muted-foreground opacity-30" />
              </div>

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div className="text-sm text-muted-foreground">Loading weather data...</div>
                  </div>
                </div>
              )}

              {markers.length > 0 && (
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
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                {mapMode === "temperature" && <Thermometer className="h-4 w-4" />}
                {mapMode === "wind" && <Wind className="h-4 w-4" />}
                {mapMode === "precipitation" && <Droplets className="h-4 w-4" />}
                {mapMode === "visibility" && <Eye className="h-4 w-4" />}
                {mapMode === "pressure" && <Gauge className="h-4 w-4" />}
                {mapMode.charAt(0).toUpperCase() + mapMode.slice(1)} Overlay
              </h4>
              <div className="space-y-2">
                {mapMode === "temperature" && (
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
                )}
                {mapMode === "wind" && (
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
                )}
                {mapMode === "precipitation" && (
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
                )}
                {mapMode === "visibility" && (
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
                )}
                {mapMode === "pressure" && (
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
                )}
              </div>
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
    </div>
  )
}
