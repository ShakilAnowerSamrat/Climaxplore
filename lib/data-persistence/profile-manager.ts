import { UserProfile } from "./types"
import { STORAGE_KEYS, MAX_HISTORY_ITEMS, DATA_RETENTION_DAYS } from "./constants"
import { generateId } from "./utils"

export class ProfileManager {
  getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
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
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
    } catch (error) {
      console.error("Failed to save user profile:", error)
    }
  }

  private createDefaultProfile(): UserProfile {
    return {
      id: generateId(),
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
        maxHistoryItems: MAX_HISTORY_ITEMS,
        dataRetentionDays: DATA_RETENTION_DAYS,
      },
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    }
  }

  private migrateLegacyData(profile: UserProfile): void {
    // Migrate legacy preferences
    const legacyPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
    if (legacyPrefs && !profile.preferences) {
      try {
        profile.preferences = JSON.parse(legacyPrefs)
      } catch (error) {
        console.error("Failed to migrate legacy preferences:", error)
      }
    }

    // Migrate legacy recent locations
    const legacyLocations = localStorage.getItem(STORAGE_KEYS.RECENT_LOCATIONS)
    if (legacyLocations && profile.favoriteLocations.length === 0) {
      try {
        const locations = JSON.parse(legacyLocations)
        profile.favoriteLocations = locations.map((loc: any, index: number) => ({
          id: generateId(),
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
}