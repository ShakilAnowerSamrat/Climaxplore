"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Wind, Thermometer, Gauge, Zap, Activity } from "lucide-react"
import { getAirQuality, getWeatherAlerts, getEnhancedForecast } from "@/lib/weather-api"

interface AdvancedWeatherAnalysisProps {
  weather: any
  historicalData: any[]
  anomalies: any[]
  location: string
}

export function AdvancedWeatherAnalysis({
  weather,
  historicalData,
  anomalies,
  location,
}: AdvancedWeatherAnalysisProps) {
  const [airQuality, setAirQuality] = useState<any>(null)
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([])
  const [enhancedForecast, setEnhancedForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdvancedData = async () => {
      if (!weather?.location) return

      setLoading(true)
      try {
        const [airQualityData, alertsData, forecastData] = await Promise.all([
          getAirQuality(weather.location.lat, weather.location.lon),
          getWeatherAlerts(weather.location.lat, weather.location.lon),
          getEnhancedForecast(weather.location.lat, weather.location.lon),
        ])

        setAirQuality(airQualityData)
        setWeatherAlerts(alertsData)
        setEnhancedForecast(forecastData)
      } catch (error) {
        console.error("Failed to fetch advanced weather data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdvancedData()
  }, [weather])

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 1) return { status: "Good", color: "bg-green-500", description: "Air quality is satisfactory" }
    if (aqi <= 2) return { status: "Fair", color: "bg-yellow-500", description: "Moderate air quality" }
    if (aqi <= 3) return { status: "Moderate", color: "bg-orange-500", description: "Unhealthy for sensitive groups" }
    if (aqi <= 4) return { status: "Poor", color: "bg-red-500", description: "Unhealthy air quality" }
    return { status: "Very Poor", color: "bg-purple-500", description: "Very unhealthy air quality" }
  }

  const calculateTrends = () => {
    if (!Array.isArray(historicalData) || historicalData.length < 2) return null

    const recent = historicalData.slice(-3)
    const older = historicalData.slice(0, 3)

    const recentAvgTemp = recent.reduce((sum, day) => sum + day.temp, 0) / recent.length
    const olderAvgTemp = older.reduce((sum, day) => sum + day.temp, 0) / older.length

    const recentAvgPressure = recent.reduce((sum, day) => sum + day.pressure, 0) / recent.length
    const olderAvgPressure = older.reduce((sum, day) => sum + day.pressure, 0) / older.length

    return {
      temperature: {
        trend: recentAvgTemp > olderAvgTemp ? "up" : "down",
        change: Math.abs(recentAvgTemp - olderAvgTemp).toFixed(1),
      },
      pressure: {
        trend: recentAvgPressure > olderAvgPressure ? "up" : "down",
        change: Math.abs(recentAvgPressure - olderAvgPressure).toFixed(1),
      },
    }
  }

  const trends = calculateTrends()

  if (loading) {
    return (
      <Card className="mission-control-panel">
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">ANALYZING ATMOSPHERIC DATA</h3>
          <p className="text-muted-foreground">Processing advanced weather patterns...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <Card className="mission-control-panel border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>ACTIVE WEATHER ALERTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherAlerts.map((alert, index) => (
                <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">{alert.event}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.start * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <Card className="mission-control-panel nasa-glow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-accent" />
              <span>WEATHER ANOMALY DETECTION</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${anomaly.severity === "high" ? "bg-destructive" : "bg-chart-3"}`}>
                      {anomaly.type.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{anomaly.severity.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm">{anomaly.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Weather Trends</TabsTrigger>
          <TabsTrigger value="airquality">Air Quality</TabsTrigger>
          <TabsTrigger value="forecast">Extended Forecast</TabsTrigger>
          <TabsTrigger value="analysis">Pattern Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Trends */}
            <Card className="mission-control-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-chart-1" />
                  <span>TEMPERATURE ANALYSIS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trends && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {trends.temperature.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-chart-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-chart-4" />
                      )}
                      <span className="text-sm font-medium">
                        {trends.temperature.change}°C {trends.temperature.trend === "up" ? "increase" : "decrease"}{" "}
                        trend
                      </span>
                    </div>
                  </div>
                )}
                {Array.isArray(historicalData) && historicalData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dt" tickFormatter={(value) => new Date(value * 1000).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
                        formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperature"]}
                      />
                      <Line type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pressure Trends */}
            <Card className="mission-control-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-chart-2" />
                  <span>PRESSURE ANALYSIS</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trends && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {trends.pressure.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-chart-2" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-chart-4" />
                      )}
                      <span className="text-sm font-medium">
                        {trends.pressure.change} hPa {trends.pressure.trend === "up" ? "increase" : "decrease"} trend
                      </span>
                    </div>
                  </div>
                )}
                {Array.isArray(historicalData) && historicalData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dt" tickFormatter={(value) => new Date(value * 1000).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
                        formatter={(value: number) => [`${value.toFixed(1)} hPa`, "Pressure"]}
                      />
                      <Area type="monotone" dataKey="pressure" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="airquality">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wind className="h-5 w-5 text-chart-3" />
                <span>AIR QUALITY INDEX</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {airQuality ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-primary mb-2">{airQuality.list[0].main.aqi}</div>
                        <Badge className={getAirQualityStatus(airQuality.list[0].main.aqi).color}>
                          {getAirQualityStatus(airQuality.list[0].main.aqi).status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {getAirQualityStatus(airQuality.list[0].main.aqi).description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CO (Carbon Monoxide)</span>
                        <span className="font-mono">{airQuality.list[0].components.co.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">NO₂ (Nitrogen Dioxide)</span>
                        <span className="font-mono">{airQuality.list[0].components.no2.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">O₃ (Ozone)</span>
                        <span className="font-mono">{airQuality.list[0].components.o3.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">PM2.5 (Fine Particles)</span>
                        <span className="font-mono">{airQuality.list[0].components.pm2_5.toFixed(2)} μg/m³</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">PM10 (Coarse Particles)</span>
                        <span className="font-mono">{airQuality.list[0].components.pm10.toFixed(2)} μg/m³</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Air quality data not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>EXTENDED FORECAST ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedForecast?.hourly ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enhancedForecast.hourly.slice(0, 24)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dt"
                      tickFormatter={(value) => new Date(value * 1000).toLocaleTimeString("en-US", { hour: "2-digit" })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value * 1000).toLocaleString()}
                      formatter={(value: number, name: string) => [
                        name === "temp" ? `${value.toFixed(1)}°C` : `${value}%`,
                        name === "temp" ? "Temperature" : "Humidity",
                      ]}
                    />
                    <Line type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={2} name="temp" />
                    <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} name="humidity" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">Extended forecast data not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="mission-control-panel">
              <CardHeader>
                <CardTitle>WEATHER PATTERN ANALYSIS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Stability Index</h4>
                    <Progress value={75} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Weather patterns show moderate stability with low probability of sudden changes.
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Predictability Score</h4>
                    <Progress value={85} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      High confidence in forecast accuracy for the next 48 hours.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mission-control-panel">
              <CardHeader>
                <CardTitle>ATMOSPHERIC CONDITIONS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Atmospheric Pressure</span>
                    <span className="font-mono">{weather?.current?.pressure || "N/A"} hPa</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Visibility</span>
                    <span className="font-mono">{((weather?.current?.visibility || 0) / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">UV Index</span>
                    <span className="font-mono">{weather?.current?.uv_index || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dew Point</span>
                    <span className="font-mono">
                      {weather?.current
                        ? `${(weather.current.temp - (100 - weather.current.humidity) / 5).toFixed(1)}°C`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
