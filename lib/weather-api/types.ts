export interface WeatherData {
  location: {
    name: string
    lat: number
    lon: number
  }
  current: {
    temp: number
    feels_like: number
    humidity: number
    wind_speed: number
    wind_deg: number
    weather: {
      main: string
      description: string
      icon: string
    }[]
    visibility: number
    uv_index?: number
  }
  forecast?: {
    dt: number
    temp: {
      min: number
      max: number
    }
    weather: {
      main: string
      description: string
      icon: string
    }[]
    pop: number // Probability of precipitation
    wind_speed: number
    humidity: number
  }[]
  historical?: HistoricalWeatherData[]
  alerts?: any[]
}

export interface UserPreferences {
  veryHot: number
  veryCold: number
  veryWindy: number
  veryWet: number // Probability threshold (0-1)
  veryHumid: number
  preferredActivity: string // Activity type ID
}

export interface RiskAssessment {
  overall: "low" | "medium" | "high"
  factors: {
    temperature: "comfortable" | "hot" | "cold"
    wind: "calm" | "breezy" | "windy"
    precipitation: "dry" | "light" | "heavy"
    humidity: "comfortable" | "humid"
  }
  recommendations: string[]
}

export interface HistoricalWeatherData {
  dt: number
  temp: number
  pressure: number
  humidity: number
  wind_speed: number
  weather: {
    main: string
    description: string
    icon: string
  }[]
}

export interface MonthlyPrediction {
  month: string
  avgTemp: {
    min: number
    max: number
    avg: number
  }
  avgWind: number
  avgHumidity: number
  precipitationDays: number
  sunnyDays: number
  weeklyData: {
    week: number
    avgTemp: number
    precipitation: number
    wind: number
    condition: string
  }[]
  activityScore: number
  optimalDays: number
  pattern: string
  recommendations: string[]
}