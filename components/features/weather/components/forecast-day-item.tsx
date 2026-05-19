"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { WeatherData } from "@/lib/weather-api"

interface ForecastDayItemProps {
  day: any
  index: number
  formatTime: (timestamp: number) => string
  getTemperatureTrend: (current: number, previous: number) => string
  getRiskLevel: (temp: number, wind: number, humidity: number, pop: number) => string
  getRiskColor: (risk: string) => string
}

export function ForecastDayItem({
  day,
  index,
  formatTime,
  getTemperatureTrend,
  getRiskLevel,
  getRiskColor,
}: ForecastDayItemProps) {
  const avgTemp = (day.temp.min + day.temp.max) / 2
  const risk = getRiskLevel(avgTemp, day.wind_speed, day.humidity, day.pop)
  const previousTemp =
    index > 0 ? (day.temp.min + day.temp.max) / 2 : avgTemp

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "trending-up":
        return <TrendingUp className="h-3 w-3 text-red-500" />
      case "trending-down":
        return <TrendingDown className="h-3 w-3 text-blue-500" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium w-20">{formatTime(day.dt)}</div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{Math.round(avgTemp)}°C</span>
          {getTrendIcon(getTemperatureTrend(avgTemp, previousTemp))}
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
}