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