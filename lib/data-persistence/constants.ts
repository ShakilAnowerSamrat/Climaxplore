export const STORAGE_KEYS = {
  USER_PROFILE: "weather-app-user-profile",
  WEATHER_CACHE: "weather-app-weather-cache",
  PREFERENCES: "weather-preferences", // Legacy key for backward compatibility
  RECENT_LOCATIONS: "recent-locations", // Legacy key for backward compatibility
} as const

export const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
export const MAX_HISTORY_ITEMS = 100
export const DATA_RETENTION_DAYS = 30
export const MAX_FAVORITE_LOCATIONS = 20