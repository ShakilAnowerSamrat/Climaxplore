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
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(selectedDate, 'EEEE, MMMM dd, yyyy')}</span>
          </div>
          {hasNasaData && nasaBadgeText && (
            <Badge variant="secondary" className="gap-1">
              <Satellite className="h-3 w-3" />
              {nasaBadgeText}
            </Badge>
          )}
          {!hasNasaData && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              OpenWeather Data
            </Badge>
          )}
        </div>

        {/* Info: Dashboard API shows historical patterns for future predictions
        // {hasNasaData && nasaTempData?.source === 'dashboard' && (
        //   <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        //     <p className="text-sm text-blue-700 dark:text-blue-400">
        //       📊 Showing probability analysis based on{' '}
        //       {nasaData?.period?.years_analyzed || 10} years of satellite
        //       observations for this date.
        //     </p>
        //   </div>
        // )} */}

        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.current.weather[0]?.main)}
            <div>
              {/* PRIMARY: NASA historical average or OpenWeather current */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {Math.round(primaryTemp)}°C
                </span>
                {hasNasaData && <Satellite className="h-5 w-5 text-primary" />}
              </div>

              {/* Temperature range from NASA */}
              {tempRange && (
                <div className="text-sm text-muted-foreground mt-1">
                  Range: {Math.round(tempRange.min)}°C -{' '}
                  {Math.round(tempRange.max)}°C
                </div>
              )}

              {/* Current conditions from OpenWeather (if different from NASA) */}
              {hasNasaData &&
                Math.abs(weather.current.temp - primaryTemp) > 2 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <span>
                      Now: {Math.round(weather.current.temp)}°C (feels{' '}
                      {Math.round(weather.current.feels_like)}°C)
                    </span>
                  </div>
                )}

              {!hasNasaData && (
                <div className="text-sm text-muted-foreground">
                  Feels like {Math.round(weather.current.feels_like)}°C
                </div>
              )}
            </div>
          </div>
          <Badge
            className={`${getRiskColor(
              riskAssessment.overall
            )} text-lg px-4 py-2`}
          >
            {riskAssessment.overall.toUpperCase()} RISK
          </Badge>
        </CardTitle>

        <CardDescription className="flex items-center gap-2">
          <span>{locationName}</span>
          <span>•</span>
          <span className="capitalize">
            {weather.current.weather[0]?.description}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Activity Suitability Score */}
        <div className="text-center p-6 bg-muted/50 rounded-lg">
          <div className="text-4xl font-bold text-primary mb-2">
            {riskAssessment.score}/100
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            Activity Suitability Score for {activity.name}
          </div>
          <Progress value={riskAssessment.score} className="w-full h-3" />
        </div>

        {/* Weather Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* NASA Rain Probability (if available) */}
          {rainProb !== undefined && (
            <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Droplets className="h-5 w-5 text-primary" />
                <Satellite className="h-3 w-3 text-primary" />
              </div>
              <div className="font-semibold">{rainProb}%</div>
              <div className="text-xs text-muted-foreground">Rain Chance</div>
            </div>
          )}

          {/* OpenWeather live metrics */}
          <div className="text-center p-3 bg-card border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Wind className="h-5 w-5 text-muted-foreground" />
              <Cloud className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="font-semibold">
              {weather.current.wind_speed} m/s
            </div>
            <div className="text-xs text-muted-foreground">Wind (Live)</div>
          </div>

          <div className="text-center p-3 bg-card border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Droplets className="h-5 w-5 text-muted-foreground" />
              <Cloud className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="font-semibold">{weather.current.humidity}%</div>
            <div className="text-xs text-muted-foreground">Humidity (Live)</div>
          </div>

          <div className="text-center p-3 bg-card border rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <Cloud className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="font-semibold">
              {Math.round((weather.current.visibility || 10000) / 1000)}km
            </div>
            <div className="text-xs text-muted-foreground">
              Visibility (Live)
            </div>
          </div>
        </div>

        {/* NASA Extreme Events (if available) */}
        {nasaSelectedDate?.extreme_events && (
          <div className="grid grid-cols-2 gap-4">
            {nasaSelectedDate.extreme_events.hot_hours_percentage > 0 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  <Satellite className="h-3 w-3 text-orange-600" />
                </div>
                <div className="font-semibold text-orange-700">
                  {nasaSelectedDate.extreme_events.hot_hours_percentage}% of day
                </div>
                <div className="text-xs text-muted-foreground">
                  Hot conditions (30°C+)
                </div>
              </div>
            )}

            {nasaSelectedDate.extreme_events.heat_wave_percentage > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-4 w-4 text-red-600" />
                  <Satellite className="h-3 w-3 text-red-600" />
                </div>
                <div className="font-semibold text-red-700">
                  {nasaSelectedDate.extreme_events.heat_wave_percentage}% of day
                </div>
                <div className="text-xs text-muted-foreground">
                  Heat wave risk (32°C+)
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground border-t pt-4 pb-4">
        {hasNasaData ? (
          <>
            <div className="flex items-center gap-1.5">
              <Satellite className="h-3.5 w-3.5 text-primary" />
              <span>
                NASA POWER API — 20-year historical average for{' '}
                {format(selectedDate, 'MMMM dd')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5 text-slate-400" />
              <span>Live meteorology from OpenWeather API</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5 text-slate-400" />
            <span>Current conditions from OpenWeather API</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}