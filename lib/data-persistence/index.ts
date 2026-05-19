import { ProfileManager } from "./profile-manager"
import { QueryHistoryManager } from "./query-history-manager"
import { FavoriteLocationsManager } from "./favorite-locations-manager"
import { CacheManager } from "./cache-manager"
import { AnalyticsManager } from "./analytics-manager"

// Export types
export type { WeatherQuery, FavoriteLocation, UserProfile, WeatherCache } from "./types"

class DataPersistenceManager {
  private profileManager: ProfileManager
  private queryHistoryManager: QueryHistoryManager
  private favoriteLocationsManager: FavoriteLocationsManager
  private cacheManager: CacheManager
  private analyticsManager: AnalyticsManager

  constructor() {
    this.profileManager = new ProfileManager()
    this.queryHistoryManager = new QueryHistoryManager(this.profileManager)
    this.favoriteLocationsManager = new FavoriteLocationsManager(this.profileManager)
    this.cacheManager = new CacheManager()
    this.analyticsManager = new AnalyticsManager(this.profileManager, this.cacheManager)
  }

  // User Profile Management
  getUserProfile() {
    return this.profileManager.getUserProfile()
  }

  saveUserProfile(profile: any) {
    return this.profileManager.saveUserProfile(profile)
  }

  // Weather Query History
  addWeatherQuery(query: any) {
    return this.queryHistoryManager.addWeatherQuery(query)
  }

  getWeatherHistory(limit?: number) {
    return this.queryHistoryManager.getWeatherHistory(limit)
  }

  clearWeatherHistory() {
    return this.queryHistoryManager.clearWeatherHistory()
  }

  // Favorite Locations Management
  addFavoriteLocation(location: { name: string; lat: number; lon: number }) {
    return this.favoriteLocationsManager.addFavoriteLocation(location)
  }

  removeFavoriteLocation(id: string) {
    return this.favoriteLocationsManager.removeFavoriteLocation(id)
  }

  getFavoriteLocations() {
    return this.favoriteLocationsManager.getFavoriteLocations()
  }

  // Weather Data Caching
  cacheWeatherData(locationKey: string, data: any) {
    return this.cacheManager.cacheWeatherData(locationKey, data)
  }

  getCachedWeatherData(locationKey: string) {
    return this.cacheManager.getCachedWeatherData(locationKey)
  }

  clearWeatherCache() {
    return this.cacheManager.clearWeatherCache()
  }

  // Data Export/Import
  exportUserData() {
    return this.analyticsManager.exportUserData()
  }

  importUserData(jsonData: string) {
    return this.analyticsManager.importUserData(jsonData)
  }

  // Data Cleanup
  cleanupOldData() {
    return this.analyticsManager.cleanupOldData()
  }

  // Analytics
  getUsageStats() {
    return this.analyticsManager.getUsageStats()
  }

  // Storage size management
  getStorageUsage() {
    return this.analyticsManager.getStorageUsage()
  }
}

export const dataPersistence = new DataPersistenceManager()