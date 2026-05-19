import type { WeatherData } from "@/lib/weather-api"
import type { ActivityType } from "@/lib/risk-assessment"

export interface UseForecastDisplayProps {
  weather: WeatherData
  activity: ActivityType
}

export function useForecastDisplay({ weather, activity }: UseForecastDisplayProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
  }

  const getTemperatureTrend = (current: number, previous: number) => {
    const diff = current - previous
    if (Math.abs(diff) < 1) return "minus"
    return diff > 0 ? "trending-up" : "trending-down"
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

  return {
    formatTime,
    getTemperatureTrend,
    getRiskLevel,
    getRiskColor,
  }
}