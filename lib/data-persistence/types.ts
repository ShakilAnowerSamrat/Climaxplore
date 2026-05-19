export interface WeatherQuery {
  id: string
  timestamp: number
  location: {
    name: string
    lat: number
    lon: number
  }
  activity: string
  riskLevel: string
  score: number
  weather: {
    temp: number
    humidity: number
    windSpeed: number
    conditions: string
  }
}

export interface FavoriteLocation {
  id: string
  name: string
  lat: number
  lon: number
  addedAt: number
  lastUsed: number
  useCount: number
}

export interface UserProfile {
  id: string
  name?: string
  preferences: any
  favoriteLocations: FavoriteLocation[]
  queryHistory: WeatherQuery[]
  activityStats: {
    [activityId: string]: {
      totalQueries: number
      averageRisk: number
      lastUsed: number
    }
  }
  settings: {
    autoSave: boolean
    cacheWeatherData: boolean
    maxHistoryItems: number
    dataRetentionDays: number
  }
  createdAt: number
  lastUpdated: number
}

export interface WeatherCache {
  [locationKey: string]: {
    data: any
    timestamp: number
    expiresAt: number
  }
}