'use client';

import { ForecastDisplay } from '@/components/features/weather/forecast-display';
import { useWeatherContext } from '@/contexts/weather-context';

/**
 * ForecastTab - Now powered by Context! 🎉
 *
 * No more prop drilling! This component automatically gets:
 * - Latest weather data
 * - NASA forecast (auto-updates when date changes)
 * - Selected activity
 * - Selected date
 *
 * When you select a date in the calendar:
 * 1. handleDateSelect() updates context
 * 2. NASA APIs fetch new data
 * 3. Context updates automatically
 * 4. This component re-renders with new data
 * 5. ForecastDisplay shows updated NASA forecast
 *
 * No manual prop passing needed! ✨
 */
export function ForecastTab() {
  // 🎯 Direct access to context - no props needed!
  const { weather, selectedActivity, nasaForecast, selectedDate } =
    useWeatherContext();

  console.log('[ForecastTab] 🔍 Rendering with data:', {
    hasWeather: !!weather,
    hasNasaForecast: !!nasaForecast,
    nasaForecastDays: nasaForecast?.forecast?.length || 0,
    selectedDate: selectedDate?.toISOString().split('T')[0],
  });

  return (
    <div className="space-y-6">
      {!weather && !nasaForecast && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Select a location to view the forecast
          </p>
        </div>
      )}
      {weather && (
        <ForecastDisplay weather={weather} activity={selectedActivity} />
      )}
    </div>
  );
}