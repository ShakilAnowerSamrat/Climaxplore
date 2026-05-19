'use client';

import { NASAHistoricalInsights } from '@/components/features/weather/components/nasa-historical-insights';
import { AdvancedWeatherAnalysis } from '@/components/layout/dynamic-components';
import type { WeatherData } from '@/lib/weather-api';

interface AnalysisTabProps {
  weather: WeatherData | null;
  historicalData: any[];
  weatherAnomalies: any[];
  currentLocationName: string;
  nasaData?: any; // 🛰️ NASA dashboard data
}

export function AnalysisTab({
  weather,
  historicalData,
  weatherAnomalies,
  currentLocationName,
  nasaData,
}: AnalysisTabProps) {
  return (
    <div className="space-y-6">
      {/* 🛰️ NASA Historical Insights - Primary position in Analysis tab */}
      {nasaData && weather && (
        <NASAHistoricalInsights
          data={nasaData}
          locationName={currentLocationName}
        />
      )}

      {weather ? (
        <AdvancedWeatherAnalysis
          weather={weather}
          historicalData={historicalData}
          anomalies={weatherAnomalies}
          location={currentLocationName}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select a location to view advanced weather analysis
          </p>
        </div>
      )}
    </div>
  );
}