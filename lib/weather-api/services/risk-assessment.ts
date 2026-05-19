import type { WeatherData, UserPreferences, RiskAssessment } from "../types"

export function assessRisk(weather: WeatherData, preferences: UserPreferences): RiskAssessment {
  const { current } = weather
  let riskScore = 0
  const factors: RiskAssessment["factors"] = {
    temperature: "comfortable",
    wind: "calm",
    precipitation: "dry",
    humidity: "comfortable",
  }
  const recommendations: string[] = []

  // Temperature assessment with feels-like consideration
  const effectiveTemp = (current.temp + current.feels_like) / 2
  if (effectiveTemp >= preferences.veryHot) {
    factors.temperature = "hot"
    riskScore += 2
    recommendations.push(
      `Very hot conditions (${Math.round(effectiveTemp)}°C) - consider rescheduling during cooler hours`,
    )
  } else if (effectiveTemp <= preferences.veryCold) {
    factors.temperature = "cold"
    riskScore += 2
    recommendations.push(
      `Very cold conditions (${Math.round(effectiveTemp)}°C) - dress warmly and consider indoor alternatives`,
    )
  } else if (effectiveTemp >= preferences.veryHot - 5) {
    recommendations.push("Warm conditions - stay hydrated and seek shade when possible")
  } else if (effectiveTemp <= preferences.veryCold + 5) {
    recommendations.push("Cool conditions - dress in layers for comfort")
  }

  // Enhanced wind assessment
  if (current.wind_speed >= preferences.veryWindy) {
    factors.wind = "windy"
    riskScore += 2
    recommendations.push(`Strong winds (${current.wind_speed} m/s) - secure loose items and avoid exposed areas`)
  } else if (current.wind_speed > preferences.veryWindy * 0.7) {
    factors.wind = "breezy"
    riskScore += 1
    recommendations.push("Breezy conditions - be aware of wind effects on activities")
  }

  // Enhanced humidity assessment
  if (current.humidity >= preferences.veryHumid) {
    factors.humidity = "humid"
    riskScore += 1
    recommendations.push(`High humidity (${current.humidity}%) - stay hydrated and take frequent breaks`)
  }

  // Enhanced precipitation assessment
  const hasRain = current.weather.some(
    (w) =>
      w.main.toLowerCase().includes("rain") ||
      w.main.toLowerCase().includes("drizzle") ||
      w.main.toLowerCase().includes("thunderstorm"),
  )

  const hasStorm = current.weather.some((w) => w.main.toLowerCase().includes("thunderstorm"))

  if (hasStorm) {
    factors.precipitation = "heavy"
    riskScore += 3
    recommendations.push("Thunderstorm conditions - seek indoor shelter immediately")
  } else if (hasRain) {
    factors.precipitation = "heavy"
    riskScore += 2
    recommendations.push("Rain detected - bring waterproof gear or consider postponing")
  }

  // Overall risk calculation with enhanced thresholds
  let overall: RiskAssessment["overall"] = "low"
  if (riskScore >= 5) {
    overall = "high"
  } else if (riskScore >= 3) {
    overall = "medium"
  }

  if (recommendations.length === 0) {
    recommendations.push("Conditions look great for outdoor activities!")
  }

  return {
    overall,
    factors,
    recommendations,
  }
}