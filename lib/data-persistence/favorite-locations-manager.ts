import { FavoriteLocation } from "./types"
import { ProfileManager } from "./profile-manager"
import { MAX_FAVORITE_LOCATIONS } from "./constants"
import { generateId } from "./utils"

export class FavoriteLocationsManager {
  constructor(private profileManager: ProfileManager) {}

  addFavoriteLocation(location: { name: string; lat: number; lon: number }): void {
    const profile = this.profileManager.getUserProfile()

    // Check if location already exists
    const existing = profile.favoriteLocations.find(
      (fav) => Math.abs(fav.lat - location.lat) < 0.01 && Math.abs(fav.lon - location.lon) < 0.01,
    )

    if (existing) {
      existing.lastUsed = Date.now()
      existing.useCount++
    } else {
      const favorite: FavoriteLocation = {
        id: generateId(),
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
    if (profile.favoriteLocations.length > MAX_FAVORITE_LOCATIONS) {
      profile.favoriteLocations.sort((a, b) => b.useCount - a.useCount)
      profile.favoriteLocations = profile.favoriteLocations.slice(0, MAX_FAVORITE_LOCATIONS)
    }

    this.profileManager.saveUserProfile(profile)
  }

  removeFavoriteLocation(id: string): void {
    const profile = this.profileManager.getUserProfile()
    profile.favoriteLocations = profile.favoriteLocations.filter((fav) => fav.id !== id)
    this.profileManager.saveUserProfile(profile)
  }

  getFavoriteLocations(): FavoriteLocation[] {
    const profile = this.profileManager.getUserProfile()
    return profile.favoriteLocations.sort((a, b) => b.lastUsed - a.lastUsed)
  }
}