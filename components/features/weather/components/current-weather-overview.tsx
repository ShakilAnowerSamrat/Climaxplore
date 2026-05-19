'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useWeatherContext } from '@/contexts/weather-context';
import type {
  ActivityType,
  EnhancedRiskAssessment,
} from '@/lib/risk-assessment';
import type { WeatherData } from '@/lib/weather-api';
import { format } from 'date-fns';
import {
  Calendar,
  Cloud,
  Droplets,
  Eye,
  Satellite,
  Thermometer,
  Wind,
} from 'lucide-react';
import { getWeatherIcon } from '../utils/getweathericon';
import { getRiskColor } from '../utils/weather-helpers';

interface CurrentWeatherOverviewProps {
  weather: WeatherData;
  riskAssessment: EnhancedRiskAssessment;
  activity: ActivityType;
  locationName: string;
  nasaSelectedDate?: any; // 🛰️ NASA hourly data for selected date (historical only)
  nasaData?: any; // 📊 NASA dashboard probability data (ALL dates - historical pattern analysis)
  selectedDate?: Date; // 📅 Currently selected date
}

export function CurrentWeatherOverview({
  weather,
  riskAssessment,
  activity,
  locationName,
  nasaSelectedDate: propNasaSelectedDate,
  nasaData: propNasaData,
  selectedDate: propSelectedDate,
}: CurrentWeatherOverviewProps) {
  // 🎯 Use Context for real-time updates when date changes
  const {
    selectedDate: contextSelectedDate,
    nasaData: contextNasaData,
    nasaSelectedDate: contextNasaSelectedDate,
  } = useWeatherContext();

  // Use context data with props as fallback
  const selectedDate = contextSelectedDate || propSelectedDate || new Date();
  const nasaData = contextNasaData || propNasaData;
  const nasaSelectedDate = contextNasaSelectedDate || propNasaSelectedDate;
  // 🔍 Debug logging
  console.log('[CurrentWeatherOverview] 🔍 NASA data check:', {
    hasNasaSelectedDate: !!nasaSelectedDate,
    hasNasaData: !!nasaData,
    nasaSelectedKeys: nasaSelectedDate ? Object.keys(nasaSelectedDate) : [],
    nasaDataKeys: nasaData ? Object.keys(nasaData) : [],
    temperatureExists: !!nasaSelectedDate?.temperature,
    statisticsExists: !!nasaSelectedDate?.temperature?.statistics,
    dashboardTempExists: !!nasaData?.temperature,
  });

  // 🛠️ Handle THREE data sources with priority:
  // PRIORITY 1: nasaData (Dashboard API) - historical pattern analysis for ANY date
  // PRIORITY 2: nasaSelectedDate (Selected-date API) - hourly details for historical dates only
  // PRIORITY 3: weather (OpenWeather) - fallback

  const getNASATemperatureData = () => {
    // ✅ PRIORITY 1: Dashboard API (works for ALL dates - historical pattern analysis)
    if (
      nasaData?.temperature &&
      typeof nasaData.temperature.avg_celsius === 'number'
    ) {
      console.log(
        '[CurrentWeatherOverview] 📊 Using Dashboard API (historical pattern analysis)'
      );
      return {
        avg: nasaData.temperature.avg_celsius,
        min: nasaData.temperature.min_celsius,
        max: nasaData.temperature.max_celsius,
        source: 'dashboard',
      };
    }

    // ✅ PRIORITY 2: Selected-date API (historical dates only - hourly details)
    if (!nasaSelectedDate?.temperature) return null;

    const temp = nasaSelectedDate.temperature;

    // Check for selected-date API structure (with statistics wrapper)
    if (temp.statistics && typeof temp.statistics.avg_celsius === 'number') {
      console.log(
        '[CurrentWeatherOverview] 📊 Using Selected-date API (hourly breakdown)'
      );
      return {
        avg: temp.statistics.avg_celsius,
        min: temp.statistics.min_celsius,
        max: temp.statistics.max_celsius,
        source: 'selected-date',
      };
    }

    console.warn('[CurrentWeatherOverview] ⚠️ No valid NASA data available');
    return null;
  };

  const nasaTempData = getNASATemperatureData();
  const hasNasaData = nasaTempData !== null;

  console.log('[CurrentWeatherOverview] ✅ Has valid NASA data?', hasNasaData);
  console.log('[CurrentWeatherOverview] 📊 NASA temp data:', nasaTempData);

  // Primary temperature source (NASA if available, OpenWeather as fallback)
  const primaryTemp = hasNasaData ? nasaTempData.avg : weather.current.temp;

  console.log(
    '[CurrentWeatherOverview] 🌡️ Primary temp:',
    primaryTemp,
    hasNasaData ? `(NASA ${nasaTempData.source})` : '(OpenWeather)'
  );

  const tempRange = hasNasaData
    ? {
        min: nasaTempData.min,
        max: nasaTempData.max,
      }
    : null;

  // 🛠️ Normalize precipitation data (prioritize dashboard for ALL dates)
  const getNASAPrecipitationData = () => {
    // ✅ PRIORITY 1: Dashboard API (works for ALL dates - historical pattern analysis)
    if (
      nasaData?.precipitation &&
      typeof nasaData.precipitation.probability === 'number'
    ) {
      console.log(
        '[CurrentWeatherOverview] 💧 Using Dashboard API precipitation (historical pattern)'
      );
      return {
        rainProb: nasaData.precipitation.probability,
        avgRainfall: nasaData.precipitation.avg_rainfall_mm,
        rainyDays: nasaData.precipitation.rainy_days,
        source: 'dashboard',
      };
    }

    // ✅ PRIORITY 2: Selected-date API (historical dates only - hourly details)
    if (!nasaSelectedDate?.precipitation) return null;

    const precip = nasaSelectedDate.precipitation;

    // Check for selected-date API structure (with statistics wrapper)
    if (
      precip.statistics &&
      typeof precip.statistics.rain_probability === 'number'
    ) {
      console.log(
        '[CurrentWeatherOverview] 💧 Using Selected-date API precipitation (hourly breakdown)'
      );
      return {
        rainProb: precip.statistics.rain_probability,
        avgRainfall: precip.statistics.avg_rainfall_mm,
        source: 'selected-date',
      };
    }

    return null;
  };

  const nasaPrecipData = getNASAPrecipitationData();
  const rainProb = nasaPrecipData?.rainProb;

  // Determine data source badge text
  const getNasaBadgeText = () => {
    if (!hasNasaData) return null;

    if (nasaTempData?.source === 'dashboard') {
      return 'NASA Historical Pattern Analysis';
    }

    if (nasaTempData?.source === 'selected-date') {
      return 'NASA Historical Data';
    }

    return 'NASA Data';
  };

  const nasaBadgeText = getNasaBadgeText();

  return (
    <Card className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/40 shadow-sm backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
          </div>
          {hasNasaData && nasaBadgeText && (
            <Badge variant="secondary" className="gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[9px] uppercase tracking-wider rounded border border-slate-200 dark:border-slate-700">
              <Satellite className="h-3 w-3 text-cyan-500" />
              {nasaBadgeText}
            </Badge>
          )}
          {!hasNasaData && (
            <Badge variant="outline" className="gap-1 border-slate-200 dark:border-slate-800 text-slate-400 font-mono text-[9px] uppercase tracking-wider rounded">
              OpenWeather Real-Time
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-slate-900 dark:text-white">
              {getWeatherIcon(weather.current.weather[0]?.main)}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-semibold tracking-tighter leading-none text-slate-900 dark:text-white">
                  {Math.round(primaryTemp)}°C
                </span>
                {hasNasaData && <Satellite className="h-4 w-4 text-cyan-500" />}
              </div>

              {tempRange && (
                <div className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-tight">
                  Range: {Math.round(tempRange.min)}°C — {Math.round(tempRange.max)}°C
                </div>
              )}

              {hasNasaData && Math.abs(weather.current.temp - primaryTemp) > 2 && (
                <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-tight">
                  Now: {Math.round(weather.current.temp)}°C (feels {Math.round(weather.current.feels_like)}°C)
                </div>
              )}

              {!hasNasaData && (
                <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-tight">
                  Feels like {Math.round(weather.current.feels_like)}°C
                </div>
              )}
            </div>
          </div>

          <Badge
            className={`${getRiskColor(
              riskAssessment.overall
            )} text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded`}
          >
            {riskAssessment.overall} RISK
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
          <span>{locationName}</span>
          <span>•</span>
          <span className="capitalize">
            {weather.current.weather[0]?.description}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Activity Suitability Score Block */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-md">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl font-mono font-bold tracking-tight text-slate-900 dark:text-white">
              {riskAssessment.score}%
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              SUITABILITY
            </div>
          </div>
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Parade Suitability Score ({activity.name})</span>
              <span>{riskAssessment.score} / 100</span>
            </div>
            <Progress value={riskAssessment.score} className="w-full h-2 bg-slate-200/50 dark:bg-slate-800" />
          </div>
        </div>

        {/* Modular divide-grid instead of double card boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/40 border-t border-b border-slate-100 dark:border-slate-800/40 py-6">
          {rainProb !== undefined ? (
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Droplets className="h-4 w-4 text-cyan-500 mb-1.5" />
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{rainProb}%</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">RAIN PROBABILITY</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-4">
              <Cloud className="h-4 w-4 text-slate-400 mb-1.5" />
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white">N/A</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">RAIN PROBABILITY</div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center text-center px-4 pt-4 md:pt-0">
            <Wind className="h-4 w-4 text-slate-400 mb-1.5" />
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{weather.current.wind_speed} m/s</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">WIND VELOCITY</div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-4 pt-4 md:pt-0">
            <Droplets className="h-4 w-4 text-slate-400 mb-1.5" />
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{weather.current.humidity}%</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">HUMIDITY</div>
          </div>

          <div className="flex flex-col items-center justify-center text-center px-4 pt-4 md:pt-0">
            <Eye className="h-4 w-4 text-slate-400 mb-1.5" />
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{Math.round((weather.current.visibility || 10000) / 1000)} km</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">VISIBILITY</div>
          </div>
        </div>

        {/* NASA Historical Extreme Events */}
        {nasaSelectedDate?.extreme_events && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nasaSelectedDate.extreme_events.hot_hours_percentage > 0 && (
              <div className="p-4 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  <Satellite className="h-3 w-3 text-amber-500" />
                </div>
                <div className="font-mono text-sm font-bold text-amber-800 dark:text-amber-400">
                  {nasaSelectedDate.extreme_events.hot_hours_percentage}% of observed day
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  High Heat exposure (30°C+)
                </div>
              </div>
            )}

            {nasaSelectedDate.extreme_events.heat_wave_percentage > 0 && (
              <div className="p-4 bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-4 w-4 text-rose-600 dark:text-rose-500" />
                  <Satellite className="h-3 w-3 text-rose-500" />
                </div>
                <div className="font-mono text-sm font-bold text-rose-800 dark:text-rose-400">
                  {nasaSelectedDate.extreme_events.heat_wave_percentage}% of observed day
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Heat wave warning threshold (32°C+)
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800/40 p-6 bg-slate-50/30 dark:bg-slate-900/20">
        {hasNasaData ? (
          <>
            <div className="flex items-center gap-2">
              <Satellite className="h-3.5 w-3.5 text-cyan-500" />
              <span>
                NASA POWER API — 20-year historical average for{' '}
                {format(selectedDate, 'MMMM dd')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-3.5 w-3.5 text-slate-400" />
              <span>Live meteorology from OpenWeather API</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Cloud className="h-3.5 w-3.5 text-slate-400" />
            <span>Current conditions from OpenWeather API</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}