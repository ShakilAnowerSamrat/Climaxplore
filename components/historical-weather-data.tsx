"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Calendar, TrendingUp, TrendingDown, Database, Download } from "lucide-react"
import { getHistoricalWeather } from "@/lib/weather-api"

interface HistoricalWeatherDataProps {
  lat: number
  lon: number
  location: string
}

export function HistoricalWeatherData({ lat, lon, location }: HistoricalWeatherDataProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7)
  const [weatherStats, setWeatherStats] = useState<any>(null)

  useEffect(() => {
    fetchHistoricalData()
  }, [lat, lon, selectedPeriod])

  const fetchHistoricalData = async () => {
    setLoading(true)
    try {
      const data = await getHistoricalWeather(lat, lon, selectedPeriod)
      const validData = Array.isArray(data) ? data : []
      setHistoricalData(validData)
      calculateWeatherStats(validData)
    } catch (error) {
      console.error("Failed to fetch historical data:", error)
      setHistoricalData([])
    } finally {
      setLoading(false)
    }
  }

  const calculateWeatherStats = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      setWeatherStats(null)
      return
    }

    const temps = data.map((d) => d.temp)
    const pressures = data.map((d) => d.pressure)
    const humidities = data.map((d) => d.humidity)
    const windSpeeds = data.map((d) => d.wind_speed)

    const stats = {
      temperature: {
        avg: temps.reduce((a, b) => a + b, 0) / temps.length,
        min: Math.min(...temps),
        max: Math.max(...temps),
        trend: temps[temps.length - 1] > temps[0] ? "up" : "down",
      },
      pressure: {
        avg: pressures.reduce((a, b) => a + b, 0) / pressures.length,
        min: Math.min(...pressures),
        max: Math.max(...pressures),
        trend: pressures[pressures.length - 1] > pressures[0] ? "up" : "down",
      },
      humidity: {
        avg: humidities.reduce((a, b) => a + b, 0) / humidities.length,
        min: Math.min(...humidities),
        max: Math.max(...humidities),
      },
      windSpeed: {
        avg: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
        max: Math.max(...windSpeeds),
      },
    }

    setWeatherStats(stats)
  }

  const exportData = () => {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      console.warn("No historical data available for export")
      return
    }

    const csvContent = [
      "Date,Temperature(°C),Pressure(hPa),Humidity(%),Wind Speed(m/s),Weather",
      ...historicalData.map(
        (d) =>
          `${new Date(d.dt * 1000).toLocaleDateString()},${d.temp},${d.pressure},${d.humidity},${d.wind_speed},"${d.weather[0]?.description || ""}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `weather-history-${location}-${selectedPeriod}days.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className="mission-control-panel">
        <CardContent className="p-8 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">ACCESSING HISTORICAL DATABASE</h3>
          <p className="text-muted-foreground">Retrieving {selectedPeriod} days of weather data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="mission-control-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>HISTORICAL WEATHER DATABASE</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(7)}
              >
                7 Days
              </Button>
              <Button
                variant={selectedPeriod === 14 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(14)}
              >
                14 Days
              </Button>
              <Button
                variant={selectedPeriod === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(30)}
              >
                30 Days
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Location: {location}</span>
            <span>Data Points: {historicalData.length}</span>
            <span>Period: Last {selectedPeriod} days</span>
          </div>
        </CardContent>
      </Card>

      {/* Weather Statistics */}
      {weatherStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="mission-control-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Temperature</span>
                {weatherStats.temperature.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-chart-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-chart-4" />
                )}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{weatherStats.temperature.avg.toFixed(1)}°C</div>
              <div className="text-xs text-muted-foreground">
                Range: {weatherStats.temperature.min.toFixed(1)}° to {weatherStats.temperature.max.toFixed(1)}°
              </div>
            </CardContent>
          </Card>

          <Card className="mission-control-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pressure</span>
                {weatherStats.pressure.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-chart-4" />
                )}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{weatherStats.pressure.avg.toFixed(0)} hPa</div>
              <div className="text-xs text-muted-foreground">
                Range: {weatherStats.pressure.min.toFixed(0)} to {weatherStats.pressure.max.toFixed(0)} hPa
              </div>
            </CardContent>
          </Card>

          <Card className="mission-control-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Humidity</span>
                <Badge variant="outline">{weatherStats.humidity.avg.toFixed(0)}%</Badge>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{weatherStats.humidity.avg.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">
                Range: {weatherStats.humidity.min.toFixed(0)}% to {weatherStats.humidity.max.toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="mission-control-panel">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Wind Speed</span>
                <Badge variant="outline">Max {weatherStats.windSpeed.max.toFixed(1)} m/s</Badge>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{weatherStats.windSpeed.avg.toFixed(1)} m/s</div>
              <div className="text-xs text-muted-foreground">Average wind speed</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Historical Charts */}
      <Tabs defaultValue="temperature" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="pressure">Pressure</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="wind">Wind Speed</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Temperature History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pressure">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Atmospheric Pressure History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" tickFormatter={(value) => new Date(value * 1000).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toFixed(1)} hPa`, "Pressure"]}
                  />
                  <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humidity">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Humidity History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" tickFormatter={(value) => new Date(value * 1000).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Humidity"]}
                  />
                  <Bar dataKey="humidity" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wind">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Wind Speed History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dt" tickFormatter={(value) => new Date(value * 1000).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toFixed(1)} m/s`, "Wind Speed"]}
                  />
                  <Bar dataKey="wind_speed" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
