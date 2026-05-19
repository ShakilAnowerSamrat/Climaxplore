'use client';

import AIInsightsPanel from '@/components/features/ai/ai-insights-panel';
import WeatherChatAssistant from '@/components/features/ai/weather-chat-assistant';
import { LocationSearch } from '@/components/features/weather/location-search';
import { useWeatherContext } from '@/contexts/weather-context';
import type { EnhancedRiskAssessment } from '@/lib/risk-assessment';
import type { UserPreferences, WeatherData } from '@/lib/weather-api';

interface AIAssistantTabProps {
  weather: WeatherData | null;
  currentLocationName: string;
  selectedActivity: any;
  preferences: UserPreferences;
  enhancedRiskAssessment: EnhancedRiskAssessment | null;
  historicalData: any[];
  loading: boolean;
  error: string;
  onLocationSelect: (lat: number, lon: number, name: string) => Promise<void>;
}

export function AIAssistantTab({
  weather,
  currentLocationName,
  selectedActivity,
  preferences,
  enhancedRiskAssessment,
  historicalData,
  loading,
  error,
  onLocationSelect,
}: AIAssistantTabProps) {
  const {
    insights,
    anomalies,
    insightsLoading,
    insightsError,
    lastInsightsUpdated,
    regenerateInsights,
  } = useWeatherContext();
  return (
    <div className="space-y-6">
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
            insights={insights}
            anomalies={anomalies}
            isLoading={insightsLoading}
            error={insightsError}
            lastUpdated={lastInsightsUpdated}
            onRefresh={regenerateInsights}
          />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select a location to start chatting with ARIA, your AI weather
            assistant
          </p>
          <LocationSearch
            onLocationSelect={onLocationSelect}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}