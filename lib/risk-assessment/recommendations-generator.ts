import { EnhancedRiskAssessment } from "./types"
import { ActivityType } from "./types"

export function generateRecommendations(
  assessment: EnhancedRiskAssessment,
  activity: ActivityType,
  weather: any,
): { priority: "high" | "medium" | "low"; message: string; action?: string }[] {
  const recommendations: { priority: "high" | "medium" | "low"; message: string; action?: string }[] = []

  // Temperature recommendations
  if (assessment.factors.temperature.status === "dangerous") {
    if (weather.current.temp > activity.optimalConditions.tempRange[1] + 10) {
      recommendations.push({
        priority: "high",
        message: "Extreme heat conditions detected",
        action: "Postpone activity or move to air-conditioned location",
      })
    } else if (weather.current.temp < activity.optimalConditions.tempRange[0] - 10) {
      recommendations.push({
        priority: "high",
        message: "Extreme cold conditions detected",
        action: "Dress in layers and consider postponing",
      })
    }
  } else if (assessment.factors.temperature.status === "poor") {
    if (weather.current.temp > activity.optimalConditions.tempRange[1]) {
      recommendations.push({
        priority: "medium",
        message: "Hot conditions expected",
        action: "Stay hydrated and take frequent breaks",
      })
    } else {
      recommendations.push({
        priority: "medium",
        message: "Cold conditions expected",
        action: "Dress warmly and check for hypothermia signs",
      })
    }
  }

  // Wind recommendations
  if (assessment.factors.wind.status === "dangerous") {
    recommendations.push({
      priority: "high",
      message: "Dangerous wind conditions",
      action: "Avoid exposed areas and consider postponing",
    })
  } else if (assessment.factors.wind.status === "poor" && activity.id === "cycling") {
    recommendations.push({
      priority: "medium",
      message: "Strong headwinds expected",
      action: "Plan shorter routes and allow extra time",
    })
  }

  // Precipitation recommendations
  if (assessment.factors.precipitation.status === "dangerous") {
    recommendations.push({
      priority: "high",
      message: "Heavy precipitation expected",
      action: "Postpone outdoor activities",
    })
  } else if (assessment.factors.precipitation.status === "poor") {
    recommendations.push({
      priority: "medium",
      message: "Light rain possible",
      action: "Bring waterproof gear",
    })
  }

  // Visibility recommendations
  if (assessment.factors.visibility.status === "dangerous") {
    recommendations.push({
      priority: "high",
      message: "Very poor visibility conditions",
      action: "Avoid driving and outdoor navigation",
    })
  }

  // Overall recommendations based on score
  if (assessment.score >= 80) {
    recommendations.push({
      priority: "low",
      message: "Excellent conditions for outdoor activities!",
    })
  } else if (assessment.score >= 60) {
    recommendations.push({
      priority: "low",
      message: "Good conditions with minor considerations",
    })
  } else if (assessment.score >= 40) {
    recommendations.push({
      priority: "medium",
      message: "Moderate conditions - prepare accordingly",
    })
  } else {
    recommendations.push({
      priority: "high",
      message: "Poor conditions - consider alternative plans",
    })
  }

  return recommendations
}