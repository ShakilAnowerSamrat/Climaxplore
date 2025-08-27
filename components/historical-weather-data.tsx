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
      console.log("[v0] Fetching historical data for:", { lat, lon, selectedPeriod })
      const data = await getHistoricalWeather(lat, lon, selectedPeriod)
      console.log("[v0] Historical data received:", data)
      console.log("[v0] Data type:", typeof data, "Is array:", Array.isArray(data))

      const validData = Array.isArray(data) ? data : []
      console.log("[v0] Valid data length:", validData.length)

      const formattedData = validData.map((item, index) => ({
        ...item,
        date: new Date(item.dt * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: new Date(item.dt * 1000).toLocaleDateString(),
        dateTime: new Date(item.dt * 1000),
        index: index,
        // Ensure all numeric values are properly formatted
        temp: Number(item.temp),
        pressure: Number(item.pressure),
        humidity: Number(item.humidity),
        wind_speed: Number(item.wind_speed),
      }))

      console.log("[v0] Formatted data sample:", formattedData[0])
      console.log("[v0] Chart data ready:", formattedData.length > 0)
      setHistoricalData(formattedData)
      calculateWeatherStats(formattedData)
    } catch (error) {
      console.error("[v0] Failed to fetch historical data:", error)
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
              <div className="mb-4 text-sm text-muted-foreground">Chart Data Points: {historicalData.length}</div>
              {historicalData.length > 0 && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <div>Debug Info:</div>
                  <div>Data Length: {historicalData.length}</div>
                  <div>Sample Data: {JSON.stringify(historicalData[0], null, 2).substring(0, 200)}...</div>
                  <div>
                    Date Range: {historicalData[0]?.date} to {historicalData[historicalData.length - 1]?.date}
                  </div>
                </div>
              )}
              <div className="w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded">
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperature"]}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#0ea5e9", strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No temperature data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pressure">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Atmospheric Pressure History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">Chart Data Points: {historicalData.length}</div>
              <div className="w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded">
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value: number) => [`${value.toFixed(1)} hPa`, "Pressure"]}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pressure"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No pressure data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humidity">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Humidity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">Chart Data Points: {historicalData.length}</div>
              <div className="w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded">
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Humidity"]}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Bar dataKey="humidity" fill="#eab308" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No humidity data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wind">
          <Card className="mission-control-panel">
            <CardHeader>
              <CardTitle>Wind Speed History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">Chart Data Points: {historicalData.length}</div>
              <div className="w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded">
                {historicalData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value: number) => [`${value.toFixed(1)} m/s`, "Wind Speed"]}
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "6px",
                          color: "#F9FAFB",
                        }}
                      />
                      <Bar dataKey="wind_speed" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No wind speed data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
