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

class DataPersistenceManager {
  private readonly STORAGE_KEYS = {
    USER_PROFILE: "weather-app-user-profile",
    WEATHER_CACHE: "weather-app-weather-cache",
    PREFERENCES: "weather-preferences", // Legacy key for backward compatibility
    RECENT_LOCATIONS: "recent-locations", // Legacy key for backward compatibility
  }

  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
  private readonly MAX_HISTORY_ITEMS = 100
  private readonly DATA_RETENTION_DAYS = 30

  // User Profile Management
  getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PROFILE)
      if (stored) {
        const profile = JSON.parse(stored)
        // Migrate legacy data if needed
        this.migrateLegacyData(profile)
        return profile
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
    }

    // Create default profile
    return this.createDefaultProfile()
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      profile.lastUpdated = Date.now()
      localStorage.setItem(this.STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
    } catch (error) {
      console.error("Failed to save user profile:", error)
    }
  }

  private createDefaultProfile(): UserProfile {
    return {
      id: this.generateId(),
      preferences: {
        veryHot: 30,
        veryCold: 5,
        veryWindy: 20,
        veryWet: 0.7,
        veryHumid: 80,
        preferredActivity: "general",
      },
      favoriteLocations: [],
      queryHistory: [],
      activityStats: {},
      settings: {
        autoSave: true,
        cacheWeatherData: true,
        maxHistoryItems: this.MAX_HISTORY_ITEMS,
        dataRetentionDays: this.DATA_RETENTION_DAYS,
      },
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    }
  }

  private migrateLegacyData(profile: UserProfile): void {
    // Migrate legacy preferences
    const legacyPrefs = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES)
    if (legacyPrefs && !profile.preferences) {
      try {
        profile.preferences = JSON.parse(legacyPrefs)
      } catch (error) {
        console.error("Failed to migrate legacy preferences:", error)
      }
    }

    // Migrate legacy recent locations
    const legacyLocations = localStorage.getItem(this.STORAGE_KEYS.RECENT_LOCATIONS)
    if (legacyLocations && profile.favoriteLocations.length === 0) {
      try {
        const locations = JSON.parse(legacyLocations)
        profile.favoriteLocations = locations.map((loc: any, index: number) => ({
          id: this.generateId(),
          name: loc.name,
          lat: loc.lat,
          lon: loc.lon,
          addedAt: Date.now() - (locations.length - index) * 1000,
          lastUsed: Date.now() - (locations.length - index) * 1000,
          useCount: 1,
        }))
      } catch (error) {
        console.error("Failed to migrate legacy locations:", error)
      }
    }
  }

  // Weather Query History
  addWeatherQuery(query: Omit<WeatherQuery, "id" | "timestamp">): void {
    const profile = this.getUserProfile()
    const weatherQuery: WeatherQuery = {
      ...query,
      id: this.generateId(),
      timestamp: Date.now(),
    }

    profile.queryHistory.unshift(weatherQuery)

    // Limit history size
    if (profile.queryHistory.length > profile.settings.maxHistoryItems) {
      profile.queryHistory = profile.queryHistory.slice(0, profile.settings.maxHistoryItems)
    }

    // Update activity stats
    if (!profile.activityStats[query.activity]) {
      profile.activityStats[query.activity] = {
        totalQueries: 0,
        averageRisk: 0,
        lastUsed: 0,
      }
    }

    const stats = profile.activityStats[query.activity]
    const newTotal = stats.totalQueries + 1
    stats.averageRisk = (stats.averageRisk * stats.totalQueries + query.score) / newTotal
    stats.totalQueries = newTotal
    stats.lastUsed = Date.now()

    this.saveUserProfile(profile)
  }

  getWeatherHistory(limit?: number): WeatherQuery[] {
    const profile = this.getUserProfile()
    return limit ? profile.queryHistory.slice(0, limit) : profile.queryHistory
  }

  clearWeatherHistory(): void {
    const profile = this.getUserProfile()
    profile.queryHistory = []
    profile.activityStats = {}
    this.saveUserProfile(profile)
  }

  // Favorite Locations Management
  addFavoriteLocation(location: { name: string; lat: number; lon: number }): void {
    const profile = this.getUserProfile()

    // Check if location already exists
    const existing = profile.favoriteLocations.find(
      (fav) => Math.abs(fav.lat - location.lat) < 0.01 && Math.abs(fav.lon - location.lon) < 0.01,
    )

    if (existing) {
      existing.lastUsed = Date.now()
      existing.useCount++
    } else {
      const favorite: FavoriteLocation = {
        id: this.generateId(),
        name: location.name,
        lat: location.lat,
        lon: location.lon,
        addedAt: Date.now(),
        lastUsed: Date.now(),
        useCount: 1,
      }
      profile.favoriteLocations.unshift(favorite)
    }

    // Limit favorites (keep top 20 most used)
    if (profile.favoriteLocations.length > 20) {
      profile.favoriteLocations.sort((a, b) => b.useCount - a.useCount)
      profile.favoriteLocations = profile.favoriteLocations.slice(0, 20)
    }

    this.saveUserProfile(profile)
  }

  removeFavoriteLocation(id: string): void {
    const profile = this.getUserProfile()
    profile.favoriteLocations = profile.favoriteLocations.filter((fav) => fav.id !== id)
    this.saveUserProfile(profile)
  }

  getFavoriteLocations(): FavoriteLocation[] {
    const profile = this.getUserProfile()
    return profile.favoriteLocations.sort((a, b) => b.lastUsed - a.lastUsed)
  }

  // Weather Data Caching
  cacheWeatherData(locationKey: string, data: any): void {
    try {
      const cache = this.getWeatherCache()
      cache[locationKey] = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION,
      }
      localStorage.setItem(this.STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cache))
    } catch (error) {
      console.error("Failed to cache weather data:", error)
    }
  }

  getCachedWeatherData(locationKey: string): any | null {
    try {
      const cache = this.getWeatherCache()
      const cached = cache[locationKey]

      if (cached && cached.expiresAt > Date.now()) {
        return cached.data
      }

      // Remove expired cache
      if (cached) {
        delete cache[locationKey]
        localStorage.setItem(this.STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cache))
      }

      return null
    } catch (error) {
      console.error("Failed to get cached weather data:", error)
      return null
    }
  }

  private getWeatherCache(): WeatherCache {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.WEATHER_CACHE)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Failed to load weather cache:", error)
      return {}
    }
  }

  clearWeatherCache(): void {
    localStorage.removeItem(this.STORAGE_KEYS.WEATHER_CACHE)
  }

  // Data Export/Import
  exportUserData(): string {
    const profile = this.getUserProfile()
    const cache = this.getWeatherCache()

    return JSON.stringify(
      {
        profile,
        cache,
        exportedAt: Date.now(),
        version: "1.0",
      },
      null,
      2,
    )
  }

  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      if (data.profile) {
        this.saveUserProfile(data.profile)
      }

      if (data.cache) {
        localStorage.setItem(this.STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(data.cache))
      }

      return true
    } catch (error) {
      console.error("Failed to import user data:", error)
      return false
    }
  }

  // Data Cleanup
  cleanupOldData(): void {
    const profile = this.getUserProfile()
    const cutoffDate = Date.now() - profile.settings.dataRetentionDays * 24 * 60 * 60 * 1000

    // Clean old queries
    profile.queryHistory = profile.queryHistory.filter((query) => query.timestamp > cutoffDate)

    // Clean old cache
    const cache = this.getWeatherCache()
    const cleanedCache: WeatherCache = {}

    Object.entries(cache).forEach(([key, value]) => {
      if (value.timestamp > cutoffDate) {
        cleanedCache[key] = value
      }
    })

    localStorage.setItem(this.STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cleanedCache))
    this.saveUserProfile(profile)
  }

  // Analytics
  getUsageStats() {
    const profile = this.getUserProfile()

    return {
      totalQueries: profile.queryHistory.length,
      favoriteLocationsCount: profile.favoriteLocations.length,
      mostUsedActivity:
        Object.entries(profile.activityStats).sort(([, a], [, b]) => b.totalQueries - a.totalQueries)[0]?.[0] || "none",
      averageRiskScore:
        profile.queryHistory.length > 0
          ? profile.queryHistory.reduce((sum, query) => sum + query.score, 0) / profile.queryHistory.length
          : 0,
      accountAge: Math.floor((Date.now() - profile.createdAt) / (24 * 60 * 60 * 1000)),
    }
  }

  // Utility
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Storage size management
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let used = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }

      const available = 5 * 1024 * 1024 // Assume 5MB limit
      const percentage = (used / available) * 100

      return { used, available, percentage }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}

export const dataPersistence = new DataPersistenceManager()
