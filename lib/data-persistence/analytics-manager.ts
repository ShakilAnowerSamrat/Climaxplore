import { ProfileManager } from "./profile-manager"
import { CacheManager } from "./cache-manager"
import { getStorageUsage } from "./utils"

export class AnalyticsManager {
  constructor(
    private profileManager: ProfileManager,
    private cacheManager: CacheManager,
  ) {}

  getUsageStats() {
    const profile = this.profileManager.getUserProfile()

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

  getStorageUsage() {
    return getStorageUsage()
  }

  // Data Cleanup
  cleanupOldData(): void {
    const profile = this.profileManager.getUserProfile()
    const cutoffDate = Date.now() - profile.settings.dataRetentionDays * 24 * 60 * 60 * 1000

    // Clean old queries
    profile.queryHistory = profile.queryHistory.filter((query) => query.timestamp > cutoffDate)

    // Clean old cache
    const cache = this.cacheManager.getWeatherCache()
    const cleanedCache: any = {}

    Object.entries(cache).forEach(([key, value]) => {
      if (value.timestamp > cutoffDate) {
        cleanedCache[key] = value
      }
    })

    localStorage.setItem("weather-app-weather-cache", JSON.stringify(cleanedCache))
    this.profileManager.saveUserProfile(profile)
  }

  // Data Export/Import
  exportUserData(): string {
    const profile = this.profileManager.getUserProfile()
    const cache = this.cacheManager.getWeatherCache()

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
        this.profileManager.saveUserProfile(data.profile)
      }

      if (data.cache) {
        localStorage.setItem("weather-app-weather-cache", JSON.stringify(data.cache))
      }

      return true
    } catch (error) {
      console.error("Failed to import user data:", error)
      return false
    }
  }
}