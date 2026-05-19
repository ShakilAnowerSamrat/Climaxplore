"use client"

import dynamic from "next/dynamic"

export const WeatherMap = dynamic(() => import("@/components/features/map/weather-map").then((mod) => ({ default: mod.WeatherMap })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export const NASAMissionControl = dynamic(
  () => import("@/components/features/analysis/nasa-mission-control").then((mod) => ({ default: mod.NASAMissionControl })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
)

export const AdvancedWeatherAnalysis = dynamic(
  () => import("@/components/features/analysis/advanced-weather-analysis").then((mod) => ({ default: mod.AdvancedWeatherAnalysis })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
)

export const HistoricalWeatherData = dynamic(
  () => import("@/components/features/analysis/historical-weather-data").then((mod) => ({ default: mod.HistoricalWeatherData })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  },
)

export const WeatherChatAssistant = dynamic(() => import("@/components/features/ai/weather-chat-assistant"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export const AIInsightsPanel = dynamic(() => import("@/components/features/ai/ai-insights-panel"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})