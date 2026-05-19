import { useState, useEffect } from "react"
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/risk-assessment"
import type { UserPreferences } from "@/lib/weather-api"

const DEFAULT_PREFERENCES: UserPreferences = {
  veryHot: 30,
  veryCold: 5,
  veryWindy: 20,
  veryWet: 0.7,
  veryHumid: 80,
  preferredActivity: "general",
}

export interface UsePreferencesProps {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
}

export function usePreferences({ preferences, onPreferencesChange }: UsePreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(
    ACTIVITY_TYPES.find((a) => a.id === preferences.preferredActivity) || ACTIVITY_TYPES[0],
  )

  useEffect(() => {
    const changed = JSON.stringify(localPreferences) !== JSON.stringify(preferences)
    setHasChanges(changed)
  }, [localPreferences, preferences])

  const handlePreferenceChange = (key: keyof UserPreferences, value: number | string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleActivityChange = (activity: ActivityType) => {
    setSelectedActivity(activity)
    handlePreferenceChange("preferredActivity", activity.id)
  }

  const handleSave = () => {
    onPreferencesChange(localPreferences)
    // Save to localStorage
    localStorage.setItem("weather-preferences", JSON.stringify(localPreferences))
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalPreferences(DEFAULT_PREFERENCES)
    setSelectedActivity(ACTIVITY_TYPES[0])
  }

  const handleLoadDefaults = () => {
    // Load activity-specific defaults
    const activityDefaults = {
      ...DEFAULT_PREFERENCES,
      veryHot: selectedActivity.optimalConditions.tempRange[1] + 5,
      veryCold: selectedActivity.optimalConditions.tempRange[0] - 5,
      veryWindy: selectedActivity.optimalConditions.maxWind,
      veryHumid: selectedActivity.optimalConditions.maxHumidity,
      preferredActivity: selectedActivity.id,
    }
    setLocalPreferences(activityDefaults)
  }

  const getComfortLevel = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100
    if (percentage <= 25) return { level: "Very Tolerant", color: "bg-primary" }
    if (percentage <= 50) return { level: "Tolerant", color: "bg-secondary" }
    if (percentage <= 75) return { level: "Sensitive", color: "bg-accent" }
    return { level: "Very Sensitive", color: "bg-destructive" }
  }

  return {
    localPreferences,
    hasChanges,
    selectedActivity,
    handlePreferenceChange,
    handleActivityChange,
    handleSave,
    handleReset,
    handleLoadDefaults,
    getComfortLevel,
  }
}