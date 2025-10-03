"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Html, Environment } from "@react-three/drei"
import * as THREE from "three"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ActivityType } from "@/lib/risk-assessment"
import type { UserPreferences } from "@/lib/weather-api"

interface WeatherMap3DProps {
  markers: Array<{
    lat: number
    lon: number
    name: string
    weather?: any
    risk?: string
  }>
  onLocationSelect: (lat: number, lon: number, name: string) => void
  activity: ActivityType
  preferences: UserPreferences
  mapMode: "temperature" | "wind" | "precipitation" | "visibility" | "pressure"
}

// Convert lat/lon to 3D sphere coordinates
function latLonToVector3(lat: number, lon: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

// 3D Earth Globe Component
function EarthGlobe({ markers, onLocationSelect, activity, preferences, mapMode }: WeatherMap3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [selectedMarker, setSelectedMarker] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const earthTexture = useMemo(() => {
    if (typeof window === "undefined" || !isMounted) {
      return null
    }

    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext("2d")!

    // Create a simple Earth-like gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, "#87CEEB") // Sky blue for poles
    gradient.addColorStop(0.3, "#228B22") // Forest green
    gradient.addColorStop(0.5, "#8B4513") // Saddle brown for land
    gradient.addColorStop(0.7, "#228B22") // Forest green
    gradient.addColorStop(1, "#87CEEB") // Sky blue for poles

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 512)

    // Add some continent-like shapes
    ctx.fillStyle = "#4169E1"
    for (let i = 0; i < 50; i++) {
      ctx.beginPath()
      ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 20 + 5, 0, Math.PI * 2)
      ctx.fill()
    }

    return new THREE.CanvasTexture(canvas)
  }, [isMounted])

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case "low":
        return "#10b981"
      case "medium":
        return "#84cc16"
      case "high":
        return "#dc2626"
      case "extreme":
        return "#7c2d12"
      default:
        return "#6b7280"
    }
  }

  const getWeatherValue = (weather: any, mode: string) => {
    if (!weather?.current) return 0

    const current = weather.current
    if (!current || typeof current !== "object") return 0

    switch (mode) {
      case "temperature":
        return typeof current.temp === "number" ? current.temp : 0
      case "wind":
        return typeof current.wind_speed === "number" ? current.wind_speed : 0
      case "precipitation":
        return typeof current.humidity === "number" ? current.humidity : 0
      case "visibility":
        return typeof current.visibility === "number" ? current.visibility : 10000
      case "pressure":
        return typeof current.pressure === "number" ? current.pressure : 1013
      default:
        return 0
    }
  }

  const handleGlobeClick = (event: any) => {
    if (!event || !event.point) return

    event.stopPropagation()

    // Convert click position to lat/lon
    const point = event.point
    if (!point || typeof point.y !== "number" || typeof point.z !== "number" || typeof point.x !== "number") {
      return
    }

    const lat = Math.asin(Math.max(-1, Math.min(1, point.y / 2))) * (180 / Math.PI)
    const lon = Math.atan2(point.z, -point.x) * (180 / Math.PI) - 180

    const locationName = `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`
    console.log("[v0] 3D Globe clicked - calling onLocationSelect with:", { lat, lon, locationName })
    onLocationSelect(lat, lon, locationName)
  }

  return (
    <group>
      {/* Earth Globe */}
      <mesh ref={meshRef} onClick={handleGlobeClick}>
        <sphereGeometry args={[2, 64, 32]} />
        {earthTexture && <meshStandardMaterial map={earthTexture} transparent opacity={0.9} />}
      </mesh>

      {/* Weather Markers */}
      {markers.map((marker, index) => {
        if (!marker || typeof marker.lat !== "number" || typeof marker.lon !== "number") {
          return null
        }

        const position = latLonToVector3(marker.lat, marker.lon, 2.1)
        if (!position || !position.isVector3) {
          return null
        }

        const weatherValue = getWeatherValue(marker.weather, mapMode)

        return (
          <group key={index} position={[position.x, position.y, position.z]}>
            {/* Marker Sphere */}
            <mesh
              onClick={(e) => {
                if (!e) return
                e.stopPropagation()
                setSelectedMarker(marker)
                console.log("[v0] 3D Marker clicked - calling onLocationSelect with:", {
                  lat: marker.lat,
                  lon: marker.lon,
                  name: marker.name || "Unknown Location",
                })
                onLocationSelect(marker.lat, marker.lon, marker.name || "Unknown Location")
              }}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color={getRiskColor(marker.risk)}
                emissive={getRiskColor(marker.risk)}
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Weather Data Visualization */}
            {marker.weather?.current && (
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.02, 0.02, Math.max(0.1, weatherValue / 100), 8]} />
                <meshStandardMaterial
                  color={
                    mapMode === "temperature"
                      ? "#ff6b6b"
                      : mapMode === "wind"
                        ? "#4ecdc4"
                        : mapMode === "precipitation"
                          ? "#45b7d1"
                          : mapMode === "visibility"
                            ? "#96ceb4"
                            : "#feca57"
                  }
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}

            {/* Location Label */}
            <Html distanceFactor={10} position={[0, 0.15, 0]}>
              <div className="bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                {marker.name || "Unknown Location"}
                {marker.weather?.current?.temp && (
                  <div className="text-center">{Math.round(marker.weather.current.temp)}°C</div>
                )}
              </div>
            </Html>

            {/* Detailed Info Popup */}
            {selectedMarker === marker && marker.weather?.current && (
              <Html distanceFactor={8} position={[0, 0.3, 0]}>
                <Card className="min-w-64 pointer-events-auto">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-sm font-semibold">{marker.name || "Unknown Location"}</div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {typeof marker.weather.current.temp === "number" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Temperature:</span>
                            <span className="font-medium">{Math.round(marker.weather.current.temp)}°C</span>
                          </div>
                        )}
                        {typeof marker.weather.current.feels_like === "number" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Feels like:</span>
                            <span className="font-medium">{Math.round(marker.weather.current.feels_like)}°C</span>
                          </div>
                        )}
                        {typeof marker.weather.current.wind_speed === "number" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wind:</span>
                            <span className="font-medium">{marker.weather.current.wind_speed} m/s</span>
                          </div>
                        )}
                        {typeof marker.weather.current.humidity === "number" && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Humidity:</span>
                            <span className="font-medium">{marker.weather.current.humidity}%</span>
                          </div>
                        )}
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
                            {marker.risk?.toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <button
                      className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedMarker(null)}
                    >
                      Close
                    </button>
                  </CardContent>
                </Card>
              </Html>
            )}
          </group>
        )
      })}

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[2.2, 64, 32]} />
        <meshBasicMaterial color="#4a90e2" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

export function WeatherMap3D(props: WeatherMap3DProps) {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: "radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)" }}
      >
        <ambientLight intensity={0.4} color="#4a90e2" />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ff6b6b" />

        {/* Environment for realistic reflections */}
        <Environment preset="night" />

        {/* 3D Earth Globe with weather data */}
        <EarthGlobe {...props} />

        {/* Interactive controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* Background stars */}
        <mesh>
          <sphereGeometry args={[50, 32, 32]} />
          <meshBasicMaterial color="#000011" side={THREE.BackSide} />
        </mesh>
      </Canvas>

      {/* 3D Map Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
        <div className="font-medium mb-1">3D Globe Controls</div>
        <div className="space-y-1 text-white/80">
          <div>• Drag to rotate the globe</div>
          <div>• Scroll to zoom in/out</div>
          <div>• Click markers for details</div>
          <div>• Click globe to add locations</div>
        </div>
      </div>
    </div>
  )
}
