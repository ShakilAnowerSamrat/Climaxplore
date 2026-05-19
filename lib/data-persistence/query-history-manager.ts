import { WeatherQuery } from "./types"
import { ProfileManager } from "./profile-manager"
import { generateId } from "./utils"

export class QueryHistoryManager {
  constructor(private profileManager: ProfileManager) {}

  addWeatherQuery(query: Omit<WeatherQuery, "id" | "timestamp">): void {
    const profile = this.profileManager.getUserProfile()
    const weatherQuery: WeatherQuery = {
      ...query,
      id: generateId(),
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

    this.profileManager.saveUserProfile(profile)
  }

  getWeatherHistory(limit?: number): WeatherQuery[] {
    const profile = this.profileManager.getUserProfile()
    return limit ? profile.queryHistory.slice(0, limit) : profile.queryHistory
  }

  clearWeatherHistory(): void {
    const profile = this.profileManager.getUserProfile()
    profile.queryHistory = []
    profile.activityStats = {}
    this.profileManager.saveUserProfile(profile)
  }
}