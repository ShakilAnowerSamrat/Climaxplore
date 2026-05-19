"use client"

import { PreferencesDashboard } from "@/components/features/weather/preferences-dashboard"
import type { UserPreferences } from "@/lib/weather-api"

interface PreferencesTabProps {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
}

export function PreferencesTab({ preferences, onPreferencesChange }: PreferencesTabProps) {
  return <PreferencesDashboard preferences={preferences} onPreferencesChange={onPreferencesChange} />
}