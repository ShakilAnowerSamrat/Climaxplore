"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { WeatherData } from "@/lib/weather-api"
import type { ActivityType } from "@/lib/risk-assessment"

interface ActivityInsightsProps {
  weather: WeatherData
  activity: ActivityType
}

export function ActivityInsights({ weather, activity }: ActivityInsightsProps) {
  return (
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
  )
}