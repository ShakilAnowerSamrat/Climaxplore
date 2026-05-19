'use client';

import AIInsightsPanel from '@/components/features/ai/ai-insights-panel';
import { LocationSearch } from '@/components/features/weather/location-search';
import { WeatherResults } from '@/components/features/weather/weather-results';
import { useWeatherContext } from '@/contexts/weather-context';
import type {
  ActivityType,
  EnhancedRiskAssessment,
} from '@/lib/risk-assessment';
import type { UserPreferences, WeatherData } from '@/lib/weather-api';

interface WeatherTabProps {
  weather: WeatherData | null;
  enhancedRiskAssessment: EnhancedRiskAssessment | null;
  selectedActivity: ActivityType;
  currentLocationName: string;
  preferences: UserPreferences;
  historicalData: any[];
  nasaData?: any;
  nasaSelectedDate?: any;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  loading: boolean;
  error: string;
  onLocationSelect: (lat: number, lon: number, name: string) => Promise<void>;
}

/**
 * WeatherTab - Hybrid approach
 *
 * Still accepts props for backward compatibility,
 * but uses context for date selection to ensure updates propagate
 */
export function WeatherTab({
  weather,
  enhancedRiskAssessment,
  selectedActivity,
  currentLocationName,
  preferences,
  historicalData,
  nasaData,
  nasaSelectedDate,
  selectedDate,
  onDateSelect,
  loading,
  error,
  onLocationSelect,
}: WeatherTabProps) {
  // 🎯 Get handleDateSelect from context for reliable updates
  const {
    handleDateSelect: contextHandleDateSelect,
    insights,
    anomalies,
    insightsLoading,
    insightsError,
    lastInsightsUpdated,
    regenerateInsights,
  } = useWeatherContext();

  return (
    <div className="space-y-6">
      <LocationSearch
        onLocationSelect={onLocationSelect}
        loading={loading}
        error={error}
      />

      {weather && enhancedRiskAssessment && (
        <>
          <WeatherResults
            weather={weather}
            riskAssessment={enhancedRiskAssessment}
            activity={selectedActivity}
            locationName={currentLocationName || weather.location.name}
            nasaData={nasaData}
            nasaSelectedDate={nasaSelectedDate}
            selectedDate={selectedDate}
            onDateSelect={contextHandleDateSelect}
          />
          {/* 🧠 AI Insights at bottom of Weather Tab */}
          <AIInsightsPanel
            insights={insights}
            anomalies={anomalies}
            isLoading={insightsLoading}
            error={insightsError}
            lastUpdated={lastInsightsUpdated}
            onRefresh={regenerateInsights}
          />
        </>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading weather data...</p>
        </div>
      )}
    </div>
  );
}