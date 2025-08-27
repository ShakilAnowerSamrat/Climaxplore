"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Satellite, Radar, Globe, Zap, Thermometer, Gauge, Sun, Star } from "lucide-react"

interface MissionControlProps {
  weatherData: any
  location: string
  onLocationChange: (location: string) => void
}

export function NASAMissionControl({ weatherData, location, onLocationChange }: MissionControlProps) {
  const [missionTime, setMissionTime] = useState(new Date())
  const [systemStatus, setSystemStatus] = useState("OPERATIONAL")

  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getAtmosphericPressureStatus = (pressure: number) => {
    if (pressure > 1020) return { status: "HIGH", color: "bg-chart-3", risk: "LOW" }
    if (pressure < 1000) return { status: "LOW", color: "bg-chart-5", risk: "MODERATE" }
    return { status: "NORMAL", color: "bg-chart-2", risk: "LOW" }
  }

  const getVisibilityStatus = (visibility: number) => {
    if (visibility >= 10000) return { status: "EXCELLENT", color: "bg-chart-2", risk: "LOW" }
    if (visibility >= 5000) return { status: "GOOD", color: "bg-chart-3", risk: "LOW" }
    if (visibility >= 1000) return { status: "MODERATE", color: "bg-chart-4", risk: "MODERATE" }
    return { status: "POOR", color: "bg-destructive", risk: "HIGH" }
  }

  const getUVIndexStatus = (uvIndex: number) => {
    if (uvIndex <= 2) return { status: "LOW", color: "bg-chart-2", risk: "LOW" }
    if (uvIndex <= 5) return { status: "MODERATE", color: "bg-chart-3", risk: "LOW" }
    if (uvIndex <= 7) return { status: "HIGH", color: "bg-chart-4", risk: "MODERATE" }
    if (uvIndex <= 10) return { status: "VERY HIGH", color: "bg-destructive", risk: "HIGH" }
    return { status: "EXTREME", color: "bg-destructive", risk: "CRITICAL" }
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="mission-control-panel nasa-glow">
          <CardContent className="p-8 text-center">
            <Satellite className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
            <h2 className="text-xl font-bold mb-2">INITIALIZING MISSION CONTROL</h2>
            <p className="text-muted-foreground">Establishing satellite connection...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pressureStatus = getAtmosphericPressureStatus(weatherData.main?.pressure || 1013)
  const visibilityStatus = getVisibilityStatus(weatherData.visibility || 10000)
  const uvStatus = getUVIndexStatus(weatherData.uvi || 0)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Satellite className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">WEATHER MISSION CONTROL</h1>
                <p className="text-sm text-muted-foreground">NASA Space Apps Challenge 2024</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-mono text-primary">
              {missionTime.toLocaleTimeString("en-US", { hour12: false })} UTC
            </div>
            <div className="text-sm text-muted-foreground">
              Mission Day: {Math.floor((Date.now() - new Date("2024-01-01").getTime()) / (1000 * 60 * 60 * 24))}
            </div>
          </div>
        </div>

        <Card className="mission-control-panel">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="nasa-glow">
                  <Zap className="h-3 w-3 mr-1" />
                  SYSTEM: {systemStatus}
                </Badge>
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  LOCATION: {location.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  <Radar className="h-3 w-3 mr-1" />
                  SATELLITE: ACTIVE
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-chart-2 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">LIVE DATA</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Weather Systems */}
        <div className="lg:col-span-2 space-y-6">
          {/* Atmospheric Conditions */}
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Thermometer className="h-5 w-5 text-primary" />
                <span>ATMOSPHERIC CONDITIONS</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{Math.round(weatherData.main?.temp || 0)}°</div>
                  <div className="text-sm text-muted-foreground">TEMPERATURE</div>
                  <div className="text-xs text-accent">FEELS {Math.round(weatherData.main?.feels_like || 0)}°</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{weatherData.main?.humidity || 0}%</div>
                  <div className="text-sm text-muted-foreground">HUMIDITY</div>
                  <Progress value={weatherData.main?.humidity || 0} className="mt-2" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {Math.round(weatherData.wind?.speed * 3.6 || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">WIND KM/H</div>
                  <div className="text-xs text-accent">DIR {weatherData.wind?.deg || 0}°</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{weatherData.main?.pressure || 1013}</div>
                  <div className="text-sm text-muted-foreground">PRESSURE hPa</div>
                  <Badge variant="outline" className={`mt-1 ${pressureStatus.color}`}>
                    {pressureStatus.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Hazard Assessment */}
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Radar className="h-5 w-5 text-destructive" />
                <span>ENVIRONMENTAL HAZARD ASSESSMENT</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">VISIBILITY</span>
                    <Badge className={visibilityStatus.color}>{visibilityStatus.status}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{((weatherData.visibility || 10000) / 1000).toFixed(1)} km</div>
                  <div className="text-xs text-muted-foreground">RISK LEVEL: {visibilityStatus.risk}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">UV INDEX</span>
                    <Badge className={uvStatus.color}>{uvStatus.status}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{weatherData.uvi || 0}</div>
                  <div className="text-xs text-muted-foreground">RISK LEVEL: {uvStatus.risk}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PRECIPITATION</span>
                    <Badge variant="outline">{weatherData.rain ? "ACTIVE" : "NONE"}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{weatherData.rain?.["1h"] || 0} mm</div>
                  <div className="text-xs text-muted-foreground">LAST HOUR</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Control Sidebar */}
        <div className="space-y-6">
          {/* Solar Activity */}
          <Card className="mission-control-panel nasa-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="h-5 w-5 text-accent" />
                <span>SOLAR ACTIVITY</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sunrise</span>
                  <span className="font-mono">
                    {weatherData.sys?.sunrise
                      ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sunset</span>
                  <span className="font-mono">
                    {weatherData.sys?.sunset
                      ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--:--"}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Day Length</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {weatherData.sys?.sunrise && weatherData.sys?.sunset
                      ? `${Math.floor((weatherData.sys.sunset - weatherData.sys.sunrise) / 3600)}h ${Math.floor(((weatherData.sys.sunset - weatherData.sys.sunrise) % 3600) / 60)}m`
                      : "--h --m"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Status */}
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gauge className="h-5 w-5 text-primary" />
                <span>MISSION STATUS</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Quality</span>
                  <Badge variant="secondary">EXCELLENT</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Satellite Link</span>
                  <Badge className="bg-chart-2">STRONG</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weather Model</span>
                  <Badge variant="outline">GFS v16</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Update</span>
                  <span className="text-xs font-mono">{new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>MISSION CONTROLS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Satellite className="h-4 w-4 mr-2" />
                Refresh Satellite Data
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Globe className="h-4 w-4 mr-2" />
                Change Location
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Radar className="h-4 w-4 mr-2" />
                Historical Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
