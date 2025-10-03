"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Thermometer,
  Wind,
  Droplets,
  Eye,
  Sun,
  Cloud,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CalendarIcon,
  Zap,
  Snowflake,
  Flame,
  CalendarDaysIcon,
} from "lucide-react"
import { format, addMonths } from "date-fns"
import { cn } from "@/lib/utils"
import type { WeatherData } from "@/lib/weather-api"
import type { EnhancedRiskAssessment, ActivityType } from "@/lib/risk-assessment"
import { getForecast, getMonthlyPrediction } from "@/lib/weather-api"

interface WeatherResultsProps {
  weather: WeatherData
  riskAssessment: EnhancedRiskAssessment
  activity: ActivityType
  locationName: string
}

interface ExtremeCondition {
  type: "very_hot" | "very_cold" | "very_windy" | "very_wet" | "very_uncomfortable"
  severity: "warning" | "danger" | "extreme"
  message: string
  icon: React.ReactNode
  color: string
}

export function WeatherResults({ weather, riskAssessment, activity, locationName }: WeatherResultsProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [futureWeather, setFutureWeather] = useState<WeatherData | null>(null)
  const [isLoadingFuture, setIsLoadingFuture] = useState(false)
  const [activeTab, setActiveTab] = useState<"current" | "future">("current")
  const [selectedMonth, setSelectedMonth] = useState<string>("current")
  const [monthlyPrediction, setMonthlyPrediction] = useState<any>(null)
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false)

  const detectExtremeConditions = (weatherData: WeatherData): ExtremeCondition[] => {
    const conditions: ExtremeCondition[] = []
    const { current } = weatherData

    // Very Hot conditions (>35°C)
    if (current.temp > 35) {
      conditions.push({
        type: "very_hot",
        severity: current.temp > 40 ? "extreme" : current.temp > 37 ? "danger" : "warning",
        message: `Extreme heat warning: ${Math.round(current.temp)}°C - Heat exhaustion risk`,
        icon: <Flame className="h-4 w-4" />,
        color: "text-red-600",
      })
    }

    // Very Cold conditions (<0°C)
    if (current.temp < 0) {
      conditions.push({
        type: "very_cold",
        severity: current.temp < -10 ? "extreme" : current.temp < -5 ? "danger" : "warning",
        message: `Freezing conditions: ${Math.round(current.temp)}°C - Hypothermia risk`,
        icon: <Snowflake className="h-4 w-4" />,
        color: "text-blue-600",
      })
    }

    // Very Windy conditions (>15 m/s)
    if (current.wind_speed > 15) {
      conditions.push({
        type: "very_windy",
        severity: current.wind_speed > 25 ? "extreme" : current.wind_speed > 20 ? "danger" : "warning",
        message: `High wind warning: ${current.wind_speed} m/s - Dangerous for outdoor activities`,
        icon: <Wind className="h-4 w-4" />,
        color: "text-orange-600",
      })
    }

    // Very Wet conditions (rain/storm)
    const hasStorm = current.weather.some((w) => w.main.toLowerCase().includes("thunderstorm"))
    const hasHeavyRain = current.weather.some(
      (w) => w.main.toLowerCase().includes("rain") && w.description.includes("heavy"),
    )

    if (hasStorm) {
      conditions.push({
        type: "very_wet",
        severity: "extreme",
        message: "Thunderstorm alert - Seek immediate indoor shelter",
        icon: <Zap className="h-4 w-4" />,
        color: "text-purple-600",
      })
    } else if (hasHeavyRain) {
      conditions.push({
        type: "very_wet",
        severity: "danger",
        message: "Heavy rain warning - Flooding and visibility risks",
        icon: <CloudRain className="h-4 w-4" />,
        color: "text-blue-600",
      })
    }

    // Very Uncomfortable conditions (high heat index)
    const heatIndex = current.temp + (current.humidity / 100) * (current.temp - 14.5)
    if (heatIndex > 40 || (current.humidity > 85 && current.temp > 30)) {
      conditions.push({
        type: "very_uncomfortable",
        severity: heatIndex > 45 ? "extreme" : "danger",
        message: `Dangerous heat index: ${Math.round(heatIndex)}°C - High humidity makes it feel much hotter`,
        icon: <Droplets className="h-4 w-4" />,
        color: "text-yellow-600",
      })
    }

    return conditions
  }

  useEffect(() => {
    const loadFutureWeather = async () => {
      if (selectedMonth !== "current") {
        setFutureWeather(null)
        return
      }

      if (selectedDate.toDateString() === new Date().toDateString()) {
        setFutureWeather(null)
        return
      }

      setIsLoadingFuture(true)
      try {
        const forecast = await getForecast(weather.location.lat, weather.location.lon)
        setFutureWeather(forecast)
      } catch (error) {
        console.error("Failed to load future weather:", error)
      } finally {
        setIsLoadingFuture(false)
      }
    }

    loadFutureWeather()
  }, [selectedDate, weather.location, selectedMonth])

  useEffect(() => {
    const loadMonthlyPrediction = async () => {
      if (selectedMonth === "current") {
        setMonthlyPrediction(null)
        return
      }

      setIsLoadingMonthly(true)
      try {
        const monthOffset = Number.parseInt(selectedMonth.replace("month", ""))
        const prediction = await getMonthlyPrediction(weather.location.lat, weather.location.lon, monthOffset)
        setMonthlyPrediction(prediction)
      } catch (error) {
        console.error("Failed to load monthly prediction:", error)
      } finally {
        setIsLoadingMonthly(false)
      }
    }

    loadMonthlyPrediction()
  }, [selectedMonth, weather.location])

  const getMonthDisplayName = (monthKey: string) => {
    if (monthKey === "current") return "Current"
    const offset = Number.parseInt(monthKey.replace("month", ""))
    return format(addMonths(new Date(), offset), "MMMM yyyy")
  }

  const currentExtremeConditions = detectExtremeConditions(weather)
  const futureExtremeConditions = futureWeather ? detectExtremeConditions(futureWeather) : []

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-primary text-primary-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "extreme":
        return "bg-destructive text-destructive-foreground animate-pulse"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getFactorColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "text-primary"
      case "acceptable":
        return "text-accent"
      case "poor":
        return "text-destructive"
      case "dangerous":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  const getFactorIcon = (status: string) => {
    switch (status) {
      case "optimal":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "acceptable":
        return <AlertTriangle className="h-4 w-4 text-accent" />
      case "poor":
      case "dangerous":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-8 w-8 text-gray-500" />
      case "rain":
      case "drizzle":
        return <CloudRain className="h-8 w-8 text-blue-500" />
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "warning":
        return "border-yellow-500 bg-yellow-50 text-yellow-800"
      case "danger":
        return "border-orange-500 bg-orange-50 text-orange-800"
      case "extreme":
        return "border-red-500 bg-red-50 text-red-800 animate-pulse"
      default:
        return "border-gray-500 bg-gray-50 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Weather Analysis</span>
            <div className="flex items-center gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <CalendarDaysIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={`month${month}`}>
                      {format(addMonths(new Date(), month), "MMMM yyyy")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedMonth === "current" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "current" | "future")}>
                <TabsList>
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger
                    value="future"
                    disabled={
                      selectedMonth === "current"
                        ? !futureWeather && !isLoadingFuture
                        : !monthlyPrediction && !isLoadingMonthly
                    }
                  >
                    {selectedMonth === "current" ? "Future" : "Predicted"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardTitle>
          <CardDescription>
            {activeTab === "current"
              ? "Current weather conditions and risk assessment"
              : selectedMonth === "current"
                ? `Weather forecast for ${format(selectedDate, "PPP")}`
                : `Predicted weather for ${getMonthDisplayName(selectedMonth)}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {((activeTab === "current" && currentExtremeConditions.length > 0) ||
        (activeTab === "future" && futureExtremeConditions.length > 0)) && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Extreme Weather Conditions Alert
            </CardTitle>
            <CardDescription>Dangerous conditions detected - Take immediate precautions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {(activeTab === "current" ? currentExtremeConditions : futureExtremeConditions).map(
                (condition, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(condition.severity)}`}>
                    <div className="flex items-center gap-3">
                      <div className={condition.color}>{condition.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-semibold">
                            {condition.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {condition.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{condition.message}</p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "current" | "future")}>
        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current Weather Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(weather.current.weather[0]?.main)}
                    <div>
                      <div className="text-2xl font-bold">{Math.round(weather.current.temp)}°C</div>
                      <div className="text-sm text-muted-foreground">
                        Feels like {Math.round(weather.current.feels_like)}°C
                      </div>
                    </div>
                  </div>
                  <Badge className={getRiskColor(riskAssessment.overall)} className="text-lg px-4 py-2">
                    {riskAssessment.overall.toUpperCase()} RISK
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{locationName}</span>
                  <span>•</span>
                  <span className="capitalize">{weather.current.weather[0]?.description}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Activity Suitability Score */}
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="text-4xl font-bold text-primary mb-2">{riskAssessment.score}/100</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Activity Suitability Score for {activity.name}
                  </div>
                  <Progress value={riskAssessment.score} className="w-full h-3" />
                </div>

                {/* Weather Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-card border rounded-lg">
                    <Wind className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{weather.current.wind_speed} m/s</div>
                    <div className="text-xs text-muted-foreground">Wind Speed</div>
                  </div>
                  <div className="text-center p-3 bg-card border rounded-lg">
                    <Droplets className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{weather.current.humidity}%</div>
                    <div className="text-xs text-muted-foreground">Humidity</div>
                  </div>
                  <div className="text-center p-3 bg-card border rounded-lg">
                    <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{Math.round((weather.current.visibility || 10000) / 1000)}km</div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                  </div>
                  <div className="text-center p-3 bg-card border rounded-lg">
                    <Thermometer className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <div className="font-semibold">{Math.round(weather.current.feels_like)}°C</div>
                    <div className="text-xs text-muted-foreground">Feels Like</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factor Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
                <CardDescription>Detailed breakdown for {activity.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(riskAssessment.factors).map(([factor, data]) => (
                  <div key={factor} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getFactorIcon(data.status)}
                        <span className="text-sm font-medium capitalize">{factor}</span>
                      </div>
                      <Badge variant="outline" className={getFactorColor(data.status)}>
                        {data.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={data.score} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{data.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{data.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="future" className="space-y-6">
          {selectedMonth !== "current" ? (
            // Monthly Prediction View
            isLoadingMonthly ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading monthly prediction data...</p>
                </CardContent>
              </Card>
            ) : monthlyPrediction ? (
              <div className="space-y-6">
                {/* Monthly Overview Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="h-8 w-8 text-primary" />
                        <div>
                          <div className="text-2xl font-bold">{getMonthDisplayName(selectedMonth)}</div>
                          <div className="text-sm text-muted-foreground">Predicted Monthly Weather Pattern</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-lg px-4 py-2">
                        PREDICTION
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{locationName}</span>
                      <span>•</span>
                      <span>Based on historical patterns and current trends</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Monthly Temperature Range */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-card border rounded-lg">
                        <Thermometer className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <div className="text-2xl font-bold">{Math.round(monthlyPrediction.avgTemp.min)}°C</div>
                        <div className="text-xs text-muted-foreground">Average Low</div>
                      </div>
                      <div className="text-center p-4 bg-primary/10 border-2 border-primary rounded-lg">
                        <Thermometer className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <div className="text-3xl font-bold text-primary">
                          {Math.round(monthlyPrediction.avgTemp.avg)}°C
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold">Average Temperature</div>
                      </div>
                      <div className="text-center p-4 bg-card border rounded-lg">
                        <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <div className="text-2xl font-bold">{Math.round(monthlyPrediction.avgTemp.max)}°C</div>
                        <div className="text-xs text-muted-foreground">Average High</div>
                      </div>
                    </div>

                    {/* Monthly Conditions Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-card border rounded-lg">
                        <Wind className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="font-semibold">{monthlyPrediction.avgWind.toFixed(1)} m/s</div>
                        <div className="text-xs text-muted-foreground">Avg Wind</div>
                      </div>
                      <div className="text-center p-3 bg-card border rounded-lg">
                        <Droplets className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="font-semibold">{Math.round(monthlyPrediction.avgHumidity)}%</div>
                        <div className="text-xs text-muted-foreground">Avg Humidity</div>
                      </div>
                      <div className="text-center p-3 bg-card border rounded-lg">
                        <CloudRain className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="font-semibold">{Math.round(monthlyPrediction.precipitationDays)}</div>
                        <div className="text-xs text-muted-foreground">Rainy Days</div>
                      </div>
                      <div className="text-center p-3 bg-card border rounded-lg">
                        <Sun className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                        <div className="font-semibold">{Math.round(monthlyPrediction.sunnyDays)}</div>
                        <div className="text-xs text-muted-foreground">Sunny Days</div>
                      </div>
                    </div>

                    {/* Weekly Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Weekly Breakdown</h4>
                      {monthlyPrediction.weeklyData.map((week: any, index: number) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Week {index + 1}</span>
                            <Badge variant="outline">{week.condition}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Temp: </span>
                              <span className="font-medium">{Math.round(week.avgTemp)}°C</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rain: </span>
                              <span className="font-medium">{Math.round(week.precipitation * 100)}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Wind: </span>
                              <span className="font-medium">{week.wind.toFixed(1)} m/s</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Suitability for the Month */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Suitability for {activity.name}</CardTitle>
                    <CardDescription>Predicted conditions for {getMonthDisplayName(selectedMonth)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-muted/50 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {monthlyPrediction.activityScore}/100
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">Monthly Activity Suitability Score</div>
                        <Progress value={monthlyPrediction.activityScore} className="w-full h-3" />
                      </div>

                      <div className="grid gap-3">
                        <div className="p-4 bg-card border rounded-lg">
                          <h4 className="font-semibold mb-2">Best Days for {activity.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Approximately {monthlyPrediction.optimalDays} days this month will have optimal conditions
                            for your activity.
                          </p>
                        </div>

                        <div className="p-4 bg-card border rounded-lg">
                          <h4 className="font-semibold mb-2">Weather Patterns</h4>
                          <p className="text-sm text-muted-foreground">{monthlyPrediction.pattern}</p>
                        </div>

                        <div className="p-4 bg-card border rounded-lg">
                          <h4 className="font-semibold mb-2">Recommendations</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {monthlyPrediction.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Unable to load monthly prediction data</p>
                </CardContent>
              </Card>
            )
          ) : (
            // Existing 5-day forecast view
            <>
              {isLoadingFuture ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading future weather data...</p>
                  </CardContent>
                </Card>
              ) : futureWeather ? (
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Future Weather Overview */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getWeatherIcon(futureWeather.current.weather[0]?.main)}
                          <div>
                            <div className="text-2xl font-bold">{Math.round(futureWeather.current.temp)}°C</div>
                            <div className="text-sm text-muted-foreground">
                              Feels like {Math.round(futureWeather.current.feels_like)}°C
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          FORECAST
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{locationName}</span>
                        <span>•</span>
                        <span className="capitalize">{futureWeather.current.weather[0]?.description}</span>
                        <span>•</span>
                        <span>{format(selectedDate, "PPP")}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Future Weather Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-card border rounded-lg">
                          <Wind className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                          <div className="font-semibold">{futureWeather.current.wind_speed} m/s</div>
                          <div className="text-xs text-muted-foreground">Wind Speed</div>
                        </div>
                        <div className="text-center p-3 bg-card border rounded-lg">
                          <Droplets className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                          <div className="font-semibold">{futureWeather.current.humidity}%</div>
                          <div className="text-xs text-muted-foreground">Humidity</div>
                        </div>
                        <div className="text-center p-3 bg-card border rounded-lg">
                          <Eye className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                          <div className="font-semibold">
                            {Math.round((futureWeather.current.visibility || 10000) / 1000)}km
                          </div>
                          <div className="text-xs text-muted-foreground">Visibility</div>
                        </div>
                        <div className="text-center p-3 bg-card border rounded-lg">
                          <Thermometer className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                          <div className="font-semibold">{Math.round(futureWeather.current.feels_like)}°C</div>
                          <div className="text-xs text-muted-foreground">Feels Like</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Future Conditions Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Forecast Summary</CardTitle>
                      <CardDescription>Expected conditions for {format(selectedDate, "PPP")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <p className="mb-2">
                          <strong>Temperature:</strong> {Math.round(futureWeather.current.temp)}°C (feels like{" "}
                          {Math.round(futureWeather.current.feels_like)}°C)
                        </p>
                        <p className="mb-2">
                          <strong>Conditions:</strong> {futureWeather.current.weather[0]?.description}
                        </p>
                        <p className="mb-2">
                          <strong>Wind:</strong> {futureWeather.current.wind_speed} m/s
                        </p>
                        <p>
                          <strong>Humidity:</strong> {futureWeather.current.humidity}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Select a future date to see weather forecast</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recommendations & Advice
          </CardTitle>
          <CardDescription>Personalized suggestions based on current conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {riskAssessment.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === "high"
                    ? "border-l-destructive bg-destructive/5"
                    : rec.priority === "medium"
                      ? "border-l-accent bg-accent/5"
                      : "border-l-primary bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      rec.priority === "high"
                        ? "border-destructive text-destructive"
                        : rec.priority === "medium"
                          ? "border-accent text-accent"
                          : "border-primary text-primary"
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-medium mt-2">{rec.message}</p>
                {rec.action && <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity-Specific Insights */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Activity Insights for {activity.name}</CardTitle>
          <CardDescription>How current conditions affect your planned activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Optimal Conditions Comparison */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Optimal vs Current Conditions</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Temperature Range:</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {activity.optimalConditions.tempRange[0]}°C - {activity.optimalConditions.tempRange[1]}°C
                    </div>
                    <div className="text-xs text-muted-foreground">Current: {Math.round(weather.current.temp)}°C</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Max Wind Speed:</span>
                  <div className="text-right">
                    <div className="font-medium">{activity.optimalConditions.maxWind} m/s</div>
                    <div className="text-xs text-muted-foreground">Current: {weather.current.wind_speed} m/s</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Max Humidity:</span>
                  <div className="text-right">
                    <div className="font-medium">{activity.optimalConditions.maxHumidity}%</div>
                    <div className="text-xs text-muted-foreground">Current: {weather.current.humidity}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factor Weights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Risk Factor Importance for {activity.name}</h4>
              <div className="space-y-2">
                {Object.entries(activity.weights)
                  .sort(([, a], [, b]) => b - a)
                  .map(([factor, weight]) => (
                    <div key={factor} className="flex items-center gap-3">
                      <span className="text-sm capitalize w-20">{factor}:</span>
                      <Progress value={weight * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground w-8">{Math.round(weight * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
