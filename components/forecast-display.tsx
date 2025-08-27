"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { WeatherData } from "@/lib/weather-api"
import type { ActivityType } from "@/lib/risk-assessment"

interface ForecastDisplayProps {
  weather: WeatherData
  activity: ActivityType
}

export function ForecastDisplay({ weather, activity }: ForecastDisplayProps) {
  if (!weather.forecast || weather.forecast.length === 0) {
    return null
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  }

  const getTemperatureTrend = (current: number, previous: number) => {
    const diff = current - previous
    if (Math.abs(diff) < 1) return <Minus className="h-3 w-3 text-muted-foreground" />
    return diff > 0 ? (
      <TrendingUp className="h-3 w-3 text-red-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-blue-500" />
    )
  }

  const getRiskLevel = (temp: number, wind: number, humidity: number, pop: number) => {
    let score = 0

    // Temperature scoring
    if (temp < activity.optimalConditions.tempRange[0] - 5 || temp > activity.optimalConditions.tempRange[1] + 5) {
      score += 3
    } else if (temp < activity.optimalConditions.tempRange[0] || temp > activity.optimalConditions.tempRange[1]) {
      score += 1
    }

    // Wind scoring
    if (wind > activity.optimalConditions.maxWind * 1.5) score += 2
    else if (wind > activity.optimalConditions.maxWind) score += 1

    // Precipitation scoring
    if (pop > 0.7) score += 2
    else if (pop > 0.3) score += 1

    if (score >= 4) return "high"
    if (score >= 2) return "medium"
    return "low"
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-primary text-primary-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "high":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          5-Day Forecast
        </CardTitle>
        <CardDescription>Weather outlook for {activity.name} activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {weather.forecast.slice(0, 5).map((day, index) => {
            const avgTemp = (day.temp.min + day.temp.max) / 2
            const risk = getRiskLevel(avgTemp, day.wind_speed, day.humidity, day.pop)
            const previousTemp =
              index > 0 ? (weather.forecast![index - 1].temp.min + weather.forecast![index - 1].temp.max) / 2 : avgTemp

            return (
              <div key={day.dt} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium w-20">{formatTime(day.dt)}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{Math.round(avgTemp)}°C</span>
                    {getTemperatureTrend(avgTemp, previousTemp)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(day.temp.min)}° - {Math.round(day.temp.max)}°
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">{Math.round(day.pop * 100)}% rain</div>
                  <div className="text-sm text-muted-foreground">{day.wind_speed} m/s</div>
                  <Badge className={getRiskColor(risk)} variant="outline">
                    {risk}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="text-xs text-muted-foreground">
          <p>Risk levels are calculated based on your selected activity ({activity.name}) and optimal conditions.</p>
        </div>
      </CardContent>
    </Card>
  )
}
