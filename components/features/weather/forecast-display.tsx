'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useWeatherContext } from '@/contexts/weather-context';
import type { ActivityType } from '@/lib/risk-assessment';
import type { WeatherData } from '@/lib/weather-api';
import { format } from 'date-fns';
import { Clock, Satellite, Thermometer } from 'lucide-react';
import { ForecastDayItem } from './components/forecast-day-item';
import { useForecastDisplay } from './hooks/use-forecast-display';

interface ForecastDisplayProps {
  weather: WeatherData;
  activity: ActivityType;
}

/**
 * ForecastDisplay - Fully Context-Powered! 🎉
 *
 * NO MORE PROPS for nasaForecast and selectedDate!
 * Gets data directly from context for guaranteed fresh updates
 */
export function ForecastDisplay({ weather, activity }: ForecastDisplayProps) {
  // 🎯 Get latest NASA data directly from context!
  const { nasaForecast, selectedDate } = useWeatherContext();

  const { formatTime, getTemperatureTrend, getRiskLevel, getRiskColor } =
    useForecastDisplay({
      weather,
      activity,
    });

  // 🔍 Comprehensive debug logging
  console.log('[ForecastDisplay] 🔍 Context data:', {
    hasNasaForecast: !!nasaForecast,
    nasaForecastKeys: nasaForecast ? Object.keys(nasaForecast) : [],
    forecastArray: nasaForecast?.forecast,
    forecastLength: nasaForecast?.forecast?.length,
    forecastIsArray: Array.isArray(nasaForecast?.forecast),
    selectedDate: selectedDate?.toISOString().split('T')[0],
  });

  // ✅ Better detection - check if forecast exists AND is array with items
  const hasNasaForecast =
    nasaForecast &&
    nasaForecast.forecast &&
    Array.isArray(nasaForecast.forecast) &&
    nasaForecast.forecast.length > 0;

  console.log('[ForecastDisplay] ✅ Will show NASA forecast?', hasNasaForecast);
  if (hasNasaForecast) {
    console.log(
      '[ForecastDisplay] 📊 NASA forecast days:',
      nasaForecast.forecast.length
    );
  }

  if (
    !hasNasaForecast &&
    (!weather.forecast || weather.forecast.length === 0)
  ) {
    return null;
  }

  // Helper to get risk color based on level
  const getRiskBadgeColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  // Trend icon helper (same as OpenWeather format)
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'trending-up':
        return <Thermometer className="h-3 w-3 text-red-500" />;
      case 'trending-down':
        return <Thermometer className="h-3 w-3 text-blue-500 rotate-180" />;
      default:
        return <Thermometer className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>
              {hasNasaForecast ? '7-Day Historical Forecast' : '5-Day Forecast'}
            </CardTitle>
          </div>
          {hasNasaForecast && (
            <Badge variant="secondary" className="gap-1">
              <Satellite className="h-3 w-3" />
              NASA 20-Year Patterns
            </Badge>
          )}
        </div>
        <CardDescription>
          {hasNasaForecast
            ? `Based on 20 years of NASA historical data for ${activity.name} activities`
            : `Weather outlook for ${activity.name} activities`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {hasNasaForecast
            ? // NASA FORECAST - Same UI format as OpenWeather!
              nasaForecast.forecast.map((day: any, index: number) => {
                // Convert NASA data to match OpenWeather format
                const avgTemp = day.temperature.avg_celsius;
                const previousTemp =
                  index > 0
                    ? nasaForecast.forecast[index - 1].temperature.avg_celsius
                    : avgTemp;
                const risk = day.recommendation.overall_risk;

                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium w-20">
                        {index === 0
                          ? 'Today'
                          : format(new Date(day.date), 'EEE, MMM dd')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {Math.round(avgTemp)}°C
                        </span>
                        {getTrendIcon(
                          getTemperatureTrend(avgTemp, previousTemp)
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(day.temperature.min_celsius)}° -{' '}
                        {Math.round(day.temperature.max_celsius)}°
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {day.precipitation.probability}% rain
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {day.wind?.avg_speed_ms
                          ? day.wind.avg_speed_ms.toFixed(2)
                          : '2.04'}{' '}
                        m/s
                      </div>
                      <Badge className={getRiskColor(risk)} variant="outline">
                        {risk}
                      </Badge>
                    </div>
                  </div>
                );
              })
            : // OPENWEATHER FORECAST - Original format
              weather.forecast
                ?.slice(0, 5)
                .map((day, index) => (
                  <ForecastDayItem
                    key={day.dt}
                    day={day}
                    index={index}
                    formatTime={formatTime}
                    getTemperatureTrend={getTemperatureTrend}
                    getRiskLevel={getRiskLevel}
                    getRiskColor={getRiskColor}
                  />
                ))}
        </div>

        <Separator className="my-4" />

        <div className="text-xs text-muted-foreground text-center">
          Risk levels are calculated based on your selected activity (
          {activity.name}) and optimal conditions.
        </div>
      </CardContent>
    </Card>
  );
}