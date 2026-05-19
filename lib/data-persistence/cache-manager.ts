import { WeatherCache } from "./types"
import { STORAGE_KEYS, CACHE_DURATION } from "./constants"

export class CacheManager {
  cacheWeatherData(locationKey: string, data: any): void {
    try {
      const cache = this.getWeatherCache()
      cache[locationKey] = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
      }
      localStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cache))
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
        localStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cache))
      }

      return null
    } catch (error) {
      console.error("Failed to get cached weather data:", error)
      return null
    }
  }

  public getWeatherCache(): WeatherCache {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WEATHER_CACHE)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Failed to load weather cache:", error)
      return {}
    }
  }

  clearWeatherCache(): void {
    localStorage.removeItem(STORAGE_KEYS.WEATHER_CACHE)
  }
}