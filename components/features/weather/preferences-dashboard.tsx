"use client"

import { ActivitySelector } from "@/components/features/weather/activity-selector"
import { usePreferences } from "./hooks/use-preferences"
import { PreferencesHeader } from "./components/preferences-header"
import { TemperaturePreferences } from "./components/temperature-preferences"
import { WindPreferences } from "./components/wind-preferences"
import { HumidityPreferences } from "./components/humidity-preferences"
import { PrecipitationPreferences } from "./components/precipitation-preferences"
import { QuickSetup } from "./components/quick-setup"
import { PreferencesActions } from "./components/preferences-actions"
import type { UserPreferences } from "@/lib/weather-api"

interface PreferencesDashboardProps {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
  onClose?: () => void
}

export function PreferencesDashboard({ preferences, onPreferencesChange, onClose }: PreferencesDashboardProps) {
  const {
    localPreferences,
    hasChanges,
    selectedActivity,
    handlePreferenceChange,
    handleActivityChange,
    handleSave,
    handleReset,
    handleLoadDefaults,
    getComfortLevel,
  } = usePreferences({ preferences, onPreferencesChange })

  const handleLoadGeneralDefaults = () => {
    const DEFAULT_PREFERENCES: UserPreferences = {
      veryHot: 30,
      veryCold: 5,
      veryWindy: 20,
      veryWet: 0.7,
      veryHumid: 80,
      preferredActivity: "general",
    }
    handlePreferenceChange("veryHot", DEFAULT_PREFERENCES.veryHot)
    handlePreferenceChange("veryCold", DEFAULT_PREFERENCES.veryCold)
    handlePreferenceChange("veryWindy", DEFAULT_PREFERENCES.veryWindy)
    handlePreferenceChange("veryWet", DEFAULT_PREFERENCES.veryWet)
    handlePreferenceChange("veryHumid", DEFAULT_PREFERENCES.veryHumid)
    handlePreferenceChange("preferredActivity", DEFAULT_PREFERENCES.preferredActivity)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PreferencesHeader
        hasChanges={hasChanges}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Activity Selection */}
      <ActivitySelector selectedActivity={selectedActivity} onActivityChange={handleActivityChange} />

      {/* Temperature Preferences */}
      <TemperaturePreferences
        veryHot={localPreferences.veryHot}
        veryCold={localPreferences.veryCold}
        onPreferenceChange={(key, value) => handlePreferenceChange(key as keyof UserPreferences, value)}
        getComfortLevel={getComfortLevel}
      />

      {/* Wind Preferences */}
      <WindPreferences
        veryWindy={localPreferences.veryWindy}
        onPreferenceChange={(key, value) => handlePreferenceChange(key as keyof UserPreferences, value)}
        getComfortLevel={getComfortLevel}
      />

      {/* Humidity Preferences */}
      <HumidityPreferences
        veryHumid={localPreferences.veryHumid}
        onPreferenceChange={(key, value) => handlePreferenceChange(key as keyof UserPreferences, value)}
        getComfortLevel={getComfortLevel}
      />

      {/* Precipitation Sensitivity */}
      <PrecipitationPreferences
        veryWet={localPreferences.veryWet}
        onPreferenceChange={(key, value) => handlePreferenceChange(key as keyof UserPreferences, value)}
        getComfortLevel={getComfortLevel}
      />

      {/* Quick Actions */}
      <QuickSetup
        selectedActivity={selectedActivity}
        onLoadDefaults={handleLoadDefaults}
        onLoadGeneralDefaults={handleLoadGeneralDefaults}
      />

      {/* Action Buttons */}
      <PreferencesActions
        hasChanges={hasChanges}
        onSave={handleSave}
        onClose={onClose}
      />
    </div>
  )
}