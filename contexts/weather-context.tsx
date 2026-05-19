'use client';

import {
  useAIInsights,
  type AnomalyAnalysis,
  type WeatherInsights,
} from '@/components/features/ai/hooks/use-ai-insights';
import { useWeatherData } from '@/hooks/use-weather-data';
import type {
  ActivityType,
  EnhancedRiskAssessment,
} from '@/lib/risk-assessment';
import type {
  RiskAssessment,
  UserPreferences,
  WeatherData,
} from '@/lib/weather-api';
import { createContext, ReactNode, useContext } from 'react';

/**
 * WeatherContext - Global state management for weather data
 *
 * This eliminates prop drilling and ensures all components
 * get automatic updates when data changes.
 *
 * Benefits:
 * - Components automatically re-render on data changes
 * - No manual prop passing through 5 levels
 * - Calendar updates immediately trigger all card updates
 * - NASA data available everywhere
 */

interface WeatherContextType {
  // Weather Data
  weather: WeatherData | null;
  riskAssessment: RiskAssessment | null;
  enhancedRiskAssessment: EnhancedRiskAssessment | null;

  // NASA Data
  nasaData: any;
  nasaSelectedDate: any;
  nasaForecast: any;

  // User State
  preferences: UserPreferences;
  selectedActivity: ActivityType;
  selectedDate: Date;
  currentLocationName: string;
  currentLocationCoords: { lat: number; lon: number } | null;

  // Historical Data
  historicalData: any[];
  weatherAnomalies: any[];

  // UI State
  loading: boolean;
  error: string;
  isClient: boolean;

  // AI Insights (shared across tabs)
  insights: WeatherInsights | null;
  anomalies: AnomalyAnalysis | null;
  insightsLoading: boolean;
  insightsError: string | null;
  lastInsightsUpdated: Date | null;
  regenerateInsights: () => void;

  // Actions
  handleLocationSelect: (
    lat: number,
    lon: number,
    name: string
  ) => Promise<void>;
  handlePreferencesChange: (preferences: UserPreferences) => void;
  handleActivityChange: (activity: ActivityType) => void;
  handleDateSelect: (date: Date) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  // Use the existing hook - all the logic stays the same!
  const weatherData = useWeatherData();

  // Derive inputs for AI insights from existing context state
  const weatherForAI = weatherData.weather;
  const prefsForAI = weatherData.preferences;
  const activityForAI = weatherData.selectedActivity?.name;
  const locationForAI =
    weatherData.currentLocationName || weatherData.weather?.location?.name;
  const historicalForAI = weatherData.historicalData;
  const dateForAI = weatherData.selectedDate;

  // Centralize AI insights generation here so it runs once and is shared
  const {
    insights,
    anomalies,
    isLoading: insightsLoading,
    lastUpdated: lastInsightsUpdated,
    error: insightsError,
    generateInsights,
  } = useAIInsights(
    weatherForAI,
    prefsForAI,
    activityForAI,
    locationForAI,
    historicalForAI,
    dateForAI
  );

  return (
    <WeatherContext.Provider
      value={{
        ...weatherData,
        // Shared AI insights state
        insights,
        anomalies,
        insightsLoading,
        insightsError,
        lastInsightsUpdated,
        regenerateInsights: generateInsights,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

/**
 * Custom hook to access weather context
 *
 * Usage in any component:
 * const { weather, nasaForecast, handleDateSelect } = useWeatherContext();
 *
 * No more prop drilling! 🎉
 */
export function useWeatherContext() {
  const context = useContext(WeatherContext);

  if (context === undefined) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }

  return context;
}