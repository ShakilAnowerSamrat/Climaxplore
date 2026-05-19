'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AirQuality } from './components/air-quality';
import { AnalysisLoading } from './components/analysis-loading';
import { AnomalyDetection } from './components/anomaly-detection';
import { AtmosphericConditions } from './components/atmospheric-conditions';
import { ExtendedForecast } from './components/extended-forecast';
import { PressureAnalysis } from './components/pressure-analysis';
import { TemperatureAnalysis } from './components/temperature-analysis';
import { WeatherAlerts } from './components/weather-alerts';
import { WeatherPatternAnalysis } from './components/weather-pattern-analysis';
import { useAdvancedWeatherAnalysis } from './hooks/use-advanced-weather-analysis';
import { calculateTrends } from './utils/analysis-helpers';

interface AdvancedWeatherAnalysisProps {
  weather: any;
  historicalData: any[];
  anomalies: any[];
  location: string;
}

export function AdvancedWeatherAnalysis({
  weather,
  historicalData,
  anomalies,
  location,
}: AdvancedWeatherAnalysisProps) {
  const {
    airQuality,
    weatherAlerts,
    enhancedForecast,
    nasaHistoricalData,
    loading,
  } = useAdvancedWeatherAnalysis(weather);

  // Use NASA data if available, otherwise fall back to OpenWeather simulated data
  const weatherTrendsData =
    nasaHistoricalData.length > 0 ? nasaHistoricalData : historicalData;
  const trends = calculateTrends(weatherTrendsData);

  console.log('[Advanced Analysis] 📊 Data source for Weather Trends:', {
    usingNASA: nasaHistoricalData.length > 0,
    nasaDataPoints: nasaHistoricalData.length,
    openWeatherDataPoints: historicalData.length,
    selectedDataPoints: weatherTrendsData.length,
  });

  if (loading) {
    return <AnalysisLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Location Label */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-lg border">
        <span className="text-sm font-medium text-muted-foreground">
          📍 Location:
        </span>
        <span className="text-sm font-semibold">{location}</span>
      </div>

      <WeatherAlerts weatherAlerts={weatherAlerts} />
      <AnomalyDetection anomalies={anomalies} />

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Weather Trends</TabsTrigger>
          <TabsTrigger value="airquality">Air Quality</TabsTrigger>
          <TabsTrigger value="forecast">Extended Forecast</TabsTrigger>
          <TabsTrigger value="analysis">Pattern Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemperatureAnalysis
              historicalData={weatherTrendsData}
              trends={trends}
            />
            <PressureAnalysis
              historicalData={weatherTrendsData}
              trends={trends}
            />
          </div>
        </TabsContent>

        <TabsContent value="airquality">
          <AirQuality airQuality={airQuality} />
        </TabsContent>

        <TabsContent value="forecast">
          <ExtendedForecast enhancedForecast={enhancedForecast} />
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherPatternAnalysis />
            <AtmosphericConditions
              weather={weather}
              nasaHistoricalData={nasaHistoricalData}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}