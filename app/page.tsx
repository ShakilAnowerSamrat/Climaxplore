"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LocationSearch } from "@/components/location-search"
import { PreferencesDashboard } from "@/components/preferences-dashboard"
import { ActivitySelector } from "@/components/activity-selector"
import { WeatherResults } from "@/components/weather-results"
import { ForecastDisplay } from "@/components/forecast-display"
import { DataManagement } from "@/components/data-management"
import {
  getCurrentWeather,
  getForecast,
  getHistoricalWeather,
  assessRisk,
  type WeatherData,
  type UserPreferences,
  type RiskAssessment,
} from "@/lib/weather-api"
import {
  assessActivityRisk,
  ACTIVITY_TYPES,
  type ActivityType,
  type EnhancedRiskAssessment,
} from "@/lib/risk-assessment"
import { dataPersistence } from "@/lib/data-persistence"

const WeatherMap = dynamic(() => import("@/components/weather-map").then((mod) => ({ default: mod.WeatherMap })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

const NASAMissionControl = dynamic(
  () => import("@/components/nasa-mission-control").then((mod) => ({ default: mod.NASAMissionControl })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
)

const AdvancedWeatherAnalysis = dynamic(
  () => import("@/components/advanced-weather-analysis").then((mod) => ({ default: mod.AdvancedWeatherAnalysis })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
)

const HistoricalWeatherData = dynamic(
  () => import("@/components/historical-weather-data").then((mod) => ({ default: mod.HistoricalWeatherData })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
)

const WeatherChatAssistant = dynamic(() => import("@/components/weather-chat-assistant"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

const AIInsightsPanel = dynamic(() => import("@/components/ai-insights-panel"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

const defaultPreferences: UserPreferences = {
  veryHot: 30,
  veryCold: 5,
  veryWindy: 20,
  veryWet: 0.7,
  veryHumid: 80,
  preferredActivity: "general",
}

export default function WeatherApp() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [enhancedRiskAssessment, setEnhancedRiskAssessment] = useState<EnhancedRiskAssessment | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(ACTIVITY_TYPES[0])
  const [currentLocationName, setCurrentLocationName] = useState("")
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("weather")
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [weatherAnomalies, setWeatherAnomalies] = useState<any[]>([])
  const [missionControlMode, setMissionControlMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const profile = dataPersistence.getUserProfile()
    if (profile.preferences) {
      setPreferences(profile.preferences)
      const activity = ACTIVITY_TYPES.find((a) => a.id === profile.preferences.preferredActivity) || ACTIVITY_TYPES[0]
      setSelectedActivity(activity)
    }
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLocationSelect = async (lat: number, lon: number, name: string) => {
    console.log("[v0] handleLocationSelect called with:", { lat, lon, name })

    setLoading(true)
    setError("")
    setCurrentLocationName(name)
    setCurrentLocationCoords({ lat, lon })

    try {
      const locationKey = `${lat.toFixed(2)},${lon.toFixed(2)}`
      let weatherData = dataPersistence.getCachedWeatherData(locationKey)
      let forecastData = dataPersistence.getCachedWeatherData(`${locationKey}-forecast`)

      if (!weatherData || !forecastData) {
        console.log("[v0] Fetching fresh weather data for location:", { lat, lon, name })
        const [fetchedWeather, fetchedForecast] = await Promise.all([
          getCurrentWeather(lat, lon),
          getForecast(lat, lon),
        ])

        weatherData = fetchedWeather
        forecastData = fetchedForecast

        dataPersistence.cacheWeatherData(locationKey, weatherData)
        dataPersistence.cacheWeatherData(`${locationKey}-forecast`, forecastData)
        console.log("[v0] Weather data fetched and cached successfully")
      } else {
        console.log("[v0] Using cached weather data for location:", name)
      }

      try {
        const historical = await getHistoricalWeather(lat, lon, 7)
        setHistoricalData(historical)

        const anomalies = detectWeatherAnomalies(weatherData, historical)
        setWeatherAnomalies(anomalies)
      } catch (err) {
        console.log("Historical data not available:", err)
      }

      const combinedWeatherData = {
        ...weatherData,
        forecast: forecastData.forecast,
      }

      const risk = assessRisk(combinedWeatherData, preferences)
      const enhancedRisk = assessActivityRisk(combinedWeatherData, selectedActivity, preferences)

      console.log("[v0] Updating weather state with:", {
        location: name,
        temp: weatherData.current.temp,
        riskLevel: enhancedRisk.overall,
      })

      setWeather(combinedWeatherData)
      setRiskAssessment(risk)
      setEnhancedRiskAssessment(enhancedRisk)

      if (activeTab === "map") {
        console.log("[v0] Switching to weather tab to show selected location data")
        setActiveTab("weather")
      }

      dataPersistence.addFavoriteLocation({ name, lat, lon })
      dataPersistence.addWeatherQuery({
        location: { name, lat, lon },
        activity: selectedActivity.id,
        riskLevel: enhancedRisk.overall,
        score: enhancedRisk.score,
        weather: {
          temp: weatherData.current.temp,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.wind_speed,
          conditions: weatherData.current.weather[0]?.description || "Unknown",
        },
      })

      console.log("[v0] Location selection completed successfully")
    } catch (err) {
      console.error("[v0] Error in handleLocationSelect:", err)
      setError("Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }

  const detectWeatherAnomalies = (current: any, historical: any[]) => {
    const anomalies = []

    if (historical.length > 0) {
      const avgTemp = historical.reduce((sum, day) => sum + day.temp, 0) / historical.length
      const tempDiff = Math.abs(current.current.temp - avgTemp)

      if (tempDiff > 10) {
        anomalies.push({
          type: "temperature",
          severity: tempDiff > 15 ? "high" : "moderate",
          message: `Temperature is ${tempDiff.toFixed(1)}°C ${current.current.temp > avgTemp ? "above" : "below"} historical average`,
        })
      }

      const avgPressure = historical.reduce((sum, day) => sum + day.pressure, 0) / historical.length
      const pressureDiff = Math.abs(current.current.pressure - avgPressure)

      if (pressureDiff > 20) {
        anomalies.push({
          type: "pressure",
          severity: pressureDiff > 30 ? "high" : "moderate",
          message: `Atmospheric pressure is ${pressureDiff.toFixed(1)} hPa ${current.current.pressure > avgPressure ? "above" : "below"} normal`,
        })
      }
    }

    return anomalies
  }

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences)
    const activity = ACTIVITY_TYPES.find((a) => a.id === newPreferences.preferredActivity) || ACTIVITY_TYPES[0]
    setSelectedActivity(activity)

    const profile = dataPersistence.getUserProfile()
    profile.preferences = newPreferences
    dataPersistence.saveUserProfile(profile)

    if (weather) {
      const risk = assessRisk(weather, newPreferences)
      const enhancedRisk = assessActivityRisk(weather, activity, newPreferences)
      setRiskAssessment(risk)
      setEnhancedRiskAssessment(enhancedRisk)
    }
  }

  const handleActivityChange = (activity: ActivityType) => {
    setSelectedActivity(activity)
    const newPrefs = { ...preferences, preferredActivity: activity.id }
    setPreferences(newPrefs)

    const profile = dataPersistence.getUserProfile()
    profile.preferences = newPrefs
    dataPersistence.saveUserProfile(profile)

    if (weather) {
      const enhancedRisk = assessActivityRisk(weather, activity, newPrefs)
      setEnhancedRiskAssessment(enhancedRisk)
    }
  }

  if (missionControlMode) {
    return (
      <div className="min-h-screen">
        <NASAMissionControl
          weatherData={weather?.current}
          location={currentLocationName}
          onLocationChange={(location) => {
            setMissionControlMode(false)
            setActiveTab("weather")
          }}
        />
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setMissionControlMode(false)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg nasa-glow"
          >
            Exit Mission Control
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold text-primary mb-2 text-balance">Will It Rain On My Parade?</h1>
            <button
              onClick={() => setMissionControlMode(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg nasa-glow hover:bg-primary/90 transition-colors"
            >
              🚀 Mission Control
            </button>
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-muted-foreground text-lg text-pretty">
              NASA Space Apps Challenge 2025 • Advanced Weather Risk Assessment System
            </p>
            <a
              href="https://github.com/ShakilAnowerSamrat/Climaxplore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors nasa-glow"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </a>
          </div>
          {weatherAnomalies.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium">⚠️ Weather Anomalies Detected</p>
              <p className="text-sm text-destructive/80">
                {weatherAnomalies.length} unusual weather pattern{weatherAnomalies.length > 1 ? "s" : ""} identified
              </p>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="weather">Weather & Risk</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="activity">Activity Setup</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data & History</TabsTrigger>
            <TabsTrigger value="analysis">Advanced Analysis</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
            <TabsTrigger value="ai-assistant">🤖 AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-6">
            <LocationSearch onLocationSelect={handleLocationSelect} loading={loading} error={error} />

            {weather && enhancedRiskAssessment && (
              <>
                <WeatherResults
                  weather={weather}
                  riskAssessment={enhancedRiskAssessment}
                  activity={selectedActivity}
                  locationName={currentLocationName || weather.location.name}
                />
                <AIInsightsPanel
                  weatherData={weather}
                  userPreferences={preferences}
                  activity={selectedActivity.name}
                  location={currentLocationName || weather.location.name}
                  historicalData={historicalData}
                />
              </>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading weather data...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            {!weather && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a location to view the forecast</p>
              </div>
            )}
            {weather && <ForecastDisplay weather={weather} activity={selectedActivity} />}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <WeatherMap
              onLocationSelect={handleLocationSelect}
              currentLocation={
                currentLocationCoords
                  ? {
                      lat: currentLocationCoords.lat,
                      lon: currentLocationCoords.lon,
                      name: currentLocationName,
                    }
                  : undefined
              }
              activity={selectedActivity}
              preferences={preferences}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivitySelector selectedActivity={selectedActivity} onActivityChange={handleActivityChange} />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesDashboard preferences={preferences} onPreferencesChange={handlePreferencesChange} />
          </TabsContent>

          <TabsContent value="data">
            <DataManagement onLocationSelect={handleLocationSelect} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {weather ? (
              <AdvancedWeatherAnalysis
                weather={weather}
                historicalData={historicalData}
                anomalies={weatherAnomalies}
                location={currentLocationName}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a location to view advanced weather analysis</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="historical" className="space-y-6">
            {currentLocationCoords ? (
              <HistoricalWeatherData
                lat={currentLocationCoords.lat}
                lon={currentLocationCoords.lon}
                location={currentLocationName}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a location to view historical weather data</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            {weather ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeatherChatAssistant
                  weatherContext={{
                    current: weather.current,
                    location: currentLocationName || weather.location.name,
                    activity: selectedActivity.name,
                    preferences: preferences,
                    riskAssessment: enhancedRiskAssessment,
                  }}
                />
                <AIInsightsPanel
                  weatherData={weather}
                  userPreferences={preferences}
                  activity={selectedActivity.name}
                  location={currentLocationName || weather.location.name}
                  historicalData={historicalData}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Select a location to start chatting with ARIA, your AI weather assistant
                </p>
                <LocationSearch onLocationSelect={handleLocationSelect} loading={loading} error={error} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
