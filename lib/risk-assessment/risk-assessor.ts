import { EnhancedRiskAssessment, ActivityType } from "./types"
import { calculateFactorScore } from "./scoring-calculator"
import { generateRecommendations } from "./recommendations-generator"

export function assessActivityRisk(
  weather: any,
  activity: ActivityType,
  userPreferences?: any,
): EnhancedRiskAssessment {
  const { current } = weather

  // Calculate individual factor scores
  const temperatureAssessment = calculateFactorScore(current.temp, activity.optimalConditions.tempRange, [
    activity.optimalConditions.tempRange[0] - 5,
    activity.optimalConditions.tempRange[1] + 5,
  ])

  const windAssessment = calculateFactorScore(
    current.wind_speed,
    activity.optimalConditions.maxWind,
    activity.optimalConditions.maxWind * 1.5,
  )

  // Precipitation assessment based on weather conditions
  let precipitationValue = 0
  const hasRain = current.weather.some(
    (w: any) =>
      w.main.toLowerCase().includes("rain") ||
      w.main.toLowerCase().includes("drizzle") ||
      w.main.toLowerCase().includes("thunderstorm"),
  )
  if (hasRain) precipitationValue = 0.5 // Moderate rain assumption

  const precipitationAssessment = calculateFactorScore(
    precipitationValue,
    activity.optimalConditions.maxPrecipitation,
    activity.optimalConditions.maxPrecipitation * 2,
  )

  const humidityAssessment = calculateFactorScore(
    current.humidity,
    activity.optimalConditions.maxHumidity,
    activity.optimalConditions.maxHumidity * 1.2,
  )

  const visibilityAssessment = calculateFactorScore(
    current.visibility || 10000,
    activity.optimalConditions.minVisibility,
    activity.optimalConditions.minVisibility * 0.5,
    true,
  )

  // Calculate weighted overall score
  const overallScore =
    temperatureAssessment.score * activity.weights.temperature +
    windAssessment.score * activity.weights.wind +
    precipitationAssessment.score * activity.weights.precipitation +
    humidityAssessment.score * activity.weights.humidity +
    visibilityAssessment.score * activity.weights.visibility

  // Determine overall risk level
  let overall: "low" | "medium" | "high" | "extreme" = "low"
  if (overallScore < 25) overall = "extreme"
  else if (overallScore < 50) overall = "high"
  else if (overallScore < 75) overall = "medium"

  const assessment: EnhancedRiskAssessment = {
    overall,
    score: Math.round(overallScore),
    factors: {
      temperature: {
        ...temperatureAssessment,
        impact: `Current: ${Math.round(current.temp)}°C (Optimal: ${activity.optimalConditions.tempRange[0]}-${activity.optimalConditions.tempRange[1]}°C)`,
      },
      wind: {
        ...windAssessment,
        impact: `Current: ${current.wind_speed} m/s (Max recommended: ${activity.optimalConditions.maxWind} m/s)`,
      },
      precipitation: {
        ...precipitationAssessment,
        impact: hasRain ? "Rain detected in current conditions" : "No precipitation expected",
      },
      humidity: {
        ...humidityAssessment,
        impact: `Current: ${current.humidity}% (Max comfortable: ${activity.optimalConditions.maxHumidity}%)`,
      },
      visibility: {
        ...visibilityAssessment,
        impact: `Current: ${Math.round((current.visibility || 10000) / 1000)}km (Min recommended: ${Math.round(activity.optimalConditions.minVisibility / 1000)}km)`,
      },
    },
    recommendations: [],
  }

  assessment.recommendations = generateRecommendations(assessment, activity, weather)

  return assessment
}