"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Thermometer, Wind, Droplets, Eye, RotateCcw, Save } from "lucide-react"
import { ActivitySelector } from "@/components/activity-selector"
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/risk-assessment"
import type { UserPreferences } from "@/lib/weather-api"

interface PreferencesDashboardProps {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
  onClose?: () => void
}

const DEFAULT_PREFERENCES: UserPreferences = {
  veryHot: 30,
  veryCold: 5,
  veryWindy: 20,
  veryWet: 0.7,
  veryHumid: 80,
  preferredActivity: "general",
}

export function PreferencesDashboard({ preferences, onPreferencesChange, onClose }: PreferencesDashboardProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Weather Preferences
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Customize your weather comfort levels to get personalized risk assessments</CardDescription>
        </CardHeader>
      </Card>

      {/* Activity Selection */}
      <ActivitySelector selectedActivity={selectedActivity} onActivityChange={handleActivityChange} />

      {/* Temperature Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Temperature Comfort Zone
          </CardTitle>
          <CardDescription>Set your temperature thresholds for outdoor comfort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hot Temperature Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="very-hot">Too Hot Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{localPreferences.veryHot}°C</span>
                <Badge
                  variant="outline"
                  className={getComfortLevel(localPreferences.veryHot, 25, 40).color + " text-white"}
                >
                  {getComfortLevel(localPreferences.veryHot, 25, 40).level}
                </Badge>
              </div>
            </div>
            <Slider
              id="very-hot"
              min={25}
              max={40}
              step={1}
              value={[localPreferences.veryHot]}
              onValueChange={([value]) => handlePreferenceChange("veryHot", value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Activities will be flagged as risky when temperature exceeds this value
            </p>
          </div>

          <Separator />

          {/* Cold Temperature Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="very-cold">Too Cold Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{localPreferences.veryCold}°C</span>
                <Badge
                  variant="outline"
                  className={getComfortLevel(15 - localPreferences.veryCold, 0, 15).color + " text-white"}
                >
                  {getComfortLevel(15 - localPreferences.veryCold, 0, 15).level}
                </Badge>
              </div>
            </div>
            <Slider
              id="very-cold"
              min={-5}
              max={15}
              step={1}
              value={[localPreferences.veryCold]}
              onValueChange={([value]) => handlePreferenceChange("veryCold", value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Activities will be flagged as risky when temperature drops below this value
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wind Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Wind Sensitivity
          </CardTitle>
          <CardDescription>Set your wind speed tolerance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="very-windy">Too Windy Threshold</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{localPreferences.veryWindy} m/s</span>
              <Badge
                variant="outline"
                className={getComfortLevel(localPreferences.veryWindy, 10, 30).color + " text-white"}
              >
                {getComfortLevel(localPreferences.veryWindy, 10, 30).level}
              </Badge>
            </div>
          </div>
          <Slider
            id="very-windy"
            min={10}
            max={30}
            step={1}
            value={[localPreferences.veryWindy]}
            onValueChange={([value]) => handlePreferenceChange("veryWindy", value)}
            className="w-full"
          />
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>10 m/s: Light breeze</div>
            <div>20 m/s: Strong wind</div>
            <div>30 m/s: Very strong wind</div>
          </div>
        </CardContent>
      </Card>

      {/* Humidity Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Humidity Tolerance
          </CardTitle>
          <CardDescription>Set your humidity comfort level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="very-humid">Too Humid Threshold</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{localPreferences.veryHumid}%</span>
              <Badge
                variant="outline"
                className={getComfortLevel(localPreferences.veryHumid, 60, 95).color + " text-white"}
              >
                {getComfortLevel(localPreferences.veryHumid, 60, 95).level}
              </Badge>
            </div>
          </div>
          <Slider
            id="very-humid"
            min={60}
            max={95}
            step={5}
            value={[localPreferences.veryHumid]}
            onValueChange={([value]) => handlePreferenceChange("veryHumid", value)}
            className="w-full"
          />
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>60%: Comfortable</div>
            <div>75%: Noticeable</div>
            <div>90%: Very humid</div>
          </div>
        </CardContent>
      </Card>

      {/* Precipitation Sensitivity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Rain Sensitivity
          </CardTitle>
          <CardDescription>Set your precipitation tolerance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="very-wet">Rain Risk Threshold</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{Math.round(localPreferences.veryWet * 100)}%</span>
              <Badge
                variant="outline"
                className={getComfortLevel(localPreferences.veryWet * 100, 30, 90).color + " text-white"}
              >
                {getComfortLevel(localPreferences.veryWet * 100, 30, 90).level}
              </Badge>
            </div>
          </div>
          <Slider
            id="very-wet"
            min={0.3}
            max={0.9}
            step={0.1}
            value={[localPreferences.veryWet]}
            onValueChange={([value]) => handlePreferenceChange("veryWet", value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Probability of precipitation that you consider too risky for outdoor activities
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup</CardTitle>
          <CardDescription>Load preset configurations based on your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLoadDefaults}>
              Load {selectedActivity.name} Defaults
            </Button>
            <Button variant="outline" onClick={() => setLocalPreferences(DEFAULT_PREFERENCES)}>
              Load General Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {hasChanges ? "You have unsaved changes" : "All changes saved"}
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
