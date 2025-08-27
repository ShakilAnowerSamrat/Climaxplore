"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"
import type { WeatherData } from "@/lib/weather-api"
import type { EnhancedRiskAssessment, ActivityType } from "@/lib/risk-assessment"

interface WeatherResultsProps {
  weather: WeatherData
  riskAssessment: EnhancedRiskAssessment
  activity: ActivityType
  locationName: string
}

export function WeatherResults({ weather, riskAssessment, activity, locationName }: WeatherResultsProps) {
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

  return (
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
            <div className="text-sm text-muted-foreground mb-3">Activity Suitability Score for {activity.name}</div>
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
