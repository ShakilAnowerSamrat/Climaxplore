"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface WeatherStatisticsProps {
  weatherStats: any
}

export function WeatherStatistics({ weatherStats }: WeatherStatisticsProps) {
  if (!weatherStats) return null

  return (
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
  )
}