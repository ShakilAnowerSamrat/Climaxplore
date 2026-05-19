'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AtmosphericConditionsProps {
  weather: any;
  nasaHistoricalData?: any[];
}

export function AtmosphericConditions({
  weather,
  nasaHistoricalData = [],
}: AtmosphericConditionsProps) {
  // Use latest NASA data if available for atmospheric conditions
  const latestNASA =
    nasaHistoricalData.length > 0
      ? nasaHistoricalData[nasaHistoricalData.length - 1]
      : null;

  // Calculate average from NASA data for more accurate atmospheric conditions
  const avgNASAData =
    nasaHistoricalData.length > 0
      ? {
          pressure:
            nasaHistoricalData.reduce((sum, d) => sum + (d.pressure || 0), 0) /
            nasaHistoricalData.length,
          humidity:
            nasaHistoricalData.reduce((sum, d) => sum + (d.humidity || 0), 0) /
            nasaHistoricalData.length,
          wind_speed:
            nasaHistoricalData.reduce(
              (sum, d) => sum + (d.wind_speed || 0),
              0
            ) / nasaHistoricalData.length,
        }
      : null;

  console.log('[Atmospheric Conditions] 📊 Data sources:', {
    hasNASA: !!latestNASA,
    nasaDataPoints: nasaHistoricalData.length,
    usingNASAPressure: !!latestNASA?.pressure,
    usingNASAHumidity: !!latestNASA?.humidity,
    usingNASAWindSpeed: !!latestNASA?.wind_speed,
  });

  // Use NASA data where available, fall back to OpenWeather
  const pressure = latestNASA?.pressure
    ? `${(latestNASA.pressure * 10).toFixed(1)} hPa` // NASA PS is in kPa, convert to hPa
    : weather?.current?.pressure
    ? `${weather.current.pressure} hPa`
    : 'N/A';

  const humidity = latestNASA?.humidity
    ? `${latestNASA.humidity.toFixed(1)}%`
    : weather?.current?.humidity
    ? `${weather.current.humidity}%`
    : 'N/A';

  const windSpeed = latestNASA?.wind_speed
    ? `${latestNASA.wind_speed.toFixed(1)} m/s`
    : weather?.current?.wind_speed
    ? `${weather.current.wind_speed.toFixed(1)} m/s`
    : 'N/A';

  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ATMOSPHERIC CONDITIONS
          {latestNASA && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              🛰️ NASA POWER
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Atmospheric Pressure</span>
            <span className="font-mono">{pressure}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Humidity</span>
            <span className="font-mono">{humidity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Wind Speed</span>
            <span className="font-mono">{windSpeed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Visibility</span>
            <span className="font-mono">
              {((weather?.current?.visibility || 0) / 1000).toFixed(1)} km
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">UV Index</span>
            <span className="font-mono">
              {weather?.current?.uv_index || 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Dew Point</span>
            <span className="font-mono">
              {weather?.current
                ? `${(
                    weather.current.temp -
                    (100 - weather.current.humidity) / 5
                  ).toFixed(1)}°C`
                : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}