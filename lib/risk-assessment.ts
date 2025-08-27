export interface ActivityType {
  id: string
  name: string
  description: string
  weights: {
    temperature: number
    wind: number
    precipitation: number
    humidity: number
    visibility: number
  }
  optimalConditions: {
    tempRange: [number, number]
    maxWind: number
    maxPrecipitation: number
    maxHumidity: number
    minVisibility: number
  }
}

export interface EnhancedRiskAssessment {
  overall: "low" | "medium" | "high" | "extreme"
  score: number // 0-100
  factors: {
    temperature: {
      status: "optimal" | "acceptable" | "poor" | "dangerous"
      score: number
      impact: string
    }
    wind: {
      status: "optimal" | "acceptable" | "poor" | "dangerous"
      score: number
      impact: string
    }
    precipitation: {
      status: "optimal" | "acceptable" | "poor" | "dangerous"
      score: number
      impact: string
    }
    humidity: {
      status: "optimal" | "acceptable" | "poor" | "dangerous"
      score: number
      impact: string
    }
    visibility: {
      status: "optimal" | "acceptable" | "poor" | "dangerous"
      score: number
      impact: string
    }
  }
  recommendations: {
    priority: "high" | "medium" | "low"
    message: string
    action?: string
  }[]
  bestTimeWindows?: {
    start: Date
    end: Date
    score: number
    reason: string
  }[]
}

export const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: "general",
    name: "General Outdoor Activity",
    description: "Walking, casual outdoor events",
    weights: { temperature: 0.3, wind: 0.2, precipitation: 0.3, humidity: 0.1, visibility: 0.1 },
    optimalConditions: {
      tempRange: [15, 25],
      maxWind: 15,
      maxPrecipitation: 0.1,
      maxHumidity: 70,
      minVisibility: 5000,
    },
  },
  {
    id: "hiking",
    name: "Hiking & Trekking",
    description: "Mountain hiking, trail walking",
    weights: { temperature: 0.25, wind: 0.25, precipitation: 0.25, humidity: 0.15, visibility: 0.1 },
    optimalConditions: {
      tempRange: [10, 22],
      maxWind: 20,
      maxPrecipitation: 0.2,
      maxHumidity: 75,
      minVisibility: 3000,
    },
  },
  {
    id: "cycling",
    name: "Cycling",
    description: "Road cycling, mountain biking",
    weights: { temperature: 0.2, wind: 0.4, precipitation: 0.3, humidity: 0.05, visibility: 0.05 },
    optimalConditions: {
      tempRange: [12, 24],
      maxWind: 25,
      maxPrecipitation: 0.1,
      maxHumidity: 80,
      minVisibility: 8000,
    },
  },
  {
    id: "water_sports",
    name: "Water Sports",
    description: "Swimming, kayaking, sailing",
    weights: { temperature: 0.35, wind: 0.3, precipitation: 0.15, humidity: 0.05, visibility: 0.15 },
    optimalConditions: {
      tempRange: [20, 30],
      maxWind: 15,
      maxPrecipitation: 0.3,
      maxHumidity: 85,
      minVisibility: 2000,
    },
  },
  {
    id: "picnic",
    name: "Picnic & BBQ",
    description: "Outdoor dining, family gatherings",
    weights: { temperature: 0.25, wind: 0.25, precipitation: 0.4, humidity: 0.05, visibility: 0.05 },
    optimalConditions: {
      tempRange: [18, 28],
      maxWind: 12,
      maxPrecipitation: 0.05,
      maxHumidity: 75,
      minVisibility: 5000,
    },
  },
  {
    id: "photography",
    name: "Photography",
    description: "Outdoor photography sessions",
    weights: { temperature: 0.15, wind: 0.15, precipitation: 0.25, humidity: 0.1, visibility: 0.35 },
    optimalConditions: {
      tempRange: [5, 30],
      maxWind: 20,
      maxPrecipitation: 0.1,
      maxHumidity: 80,
      minVisibility: 10000,
    },
  },
]

export function calculateFactorScore(
  value: number,
  optimal: [number, number] | number,
  acceptable: [number, number] | number,
  isHigherBetter = false,
): { score: number; status: "optimal" | "acceptable" | "poor" | "dangerous" } {
  let score = 0
  let status: "optimal" | "acceptable" | "poor" | "dangerous" = "dangerous"

  if (Array.isArray(optimal)) {
    // Range-based scoring (temperature)
    const [optMin, optMax] = optimal
    const [accMin, accMax] = acceptable as [number, number]

    if (value >= optMin && value <= optMax) {
      score = 100
      status = "optimal"
    } else if (value >= accMin && value <= accMax) {
      // Calculate score based on distance from optimal range
      const distanceFromOptimal = Math.min(
        Math.abs(value - optMin),
        Math.abs(value - optMax),
        value < optMin ? optMin - value : value - optMax,
      )
      const maxDistance = Math.max(optMin - accMin, accMax - optMax)
      score = Math.max(50, 100 - (distanceFromOptimal / maxDistance) * 50)
      status = "acceptable"
    } else {
      // Poor or dangerous based on how far outside acceptable range
      const distanceFromAcceptable = value < accMin ? accMin - value : value - accMax
      score = Math.max(0, 50 - distanceFromAcceptable * 2)
      status = score > 25 ? "poor" : "dangerous"
    }
  } else {
    // Threshold-based scoring (wind, precipitation, etc.)
    const optimalThreshold = optimal as number
    const acceptableThreshold = acceptable as number

    if (isHigherBetter) {
      if (value >= optimalThreshold) {
        score = 100
        status = "optimal"
      } else if (value >= acceptableThreshold) {
        score = 50 + ((value - acceptableThreshold) / (optimalThreshold - acceptableThreshold)) * 50
        status = "acceptable"
      } else {
        score = Math.max(0, (value / acceptableThreshold) * 50)
        status = score > 25 ? "poor" : "dangerous"
      }
    } else {
      if (value <= optimalThreshold) {
        score = 100
        status = "optimal"
      } else if (value <= acceptableThreshold) {
        score = 50 + ((acceptableThreshold - value) / (acceptableThreshold - optimalThreshold)) * 50
        status = "acceptable"
      } else {
        score = Math.max(0, 50 - ((value - acceptableThreshold) / acceptableThreshold) * 50)
        status = score > 25 ? "poor" : "dangerous"
      }
    }
  }

  return { score: Math.round(score), status }
}

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
