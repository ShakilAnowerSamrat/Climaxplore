'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { WeatherData } from '@/lib/weather-api';
import { format } from 'date-fns';
import {
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';

interface FutureWeatherViewProps {
  futureWeather: WeatherData;
  selectedDate: Date;
}

export function FutureWeatherView({
  futureWeather,
  selectedDate,
}: FutureWeatherViewProps) {
  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Future Weather Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getWeatherIcon(futureWeather.current.weather[0].main)}
              <div>
                <div className="text-2xl">
                  {Math.round(futureWeather.current.temp)}°C
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  {futureWeather.current.weather[0].description}
                </div>
              </div>
            </div>
            <Badge variant="secondary">{format(selectedDate, 'PPP')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weather Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Thermometer className="h-6 w-6 text-orange-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {Math.round(futureWeather.current.temp)}°C
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Temperature
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Feels like {Math.round(futureWeather.current.feels_like)}°C
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Wind className="h-6 w-6 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {futureWeather.current.wind_speed.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Wind Speed (m/s)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Droplets className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="text-2xl font-bold">
                    {futureWeather.current.humidity}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Humidity
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Eye className="h-6 w-6 text-gray-500 mb-2" />
                  <div className="text-2xl font-bold">
                    {(futureWeather.current.visibility / 1000).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Visibility (km)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Temperature Range */}
          {futureWeather.forecast && futureWeather.forecast.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Temperature Range</span>
                <span className="font-medium">
                  {Math.round(futureWeather.forecast[0].temp.min)}°C -{' '}
                  {Math.round(futureWeather.forecast[0].temp.max)}°C
                </span>
              </div>
              <Progress
                value={
                  ((futureWeather.current.temp -
                    futureWeather.forecast[0].temp.min) /
                    (futureWeather.forecast[0].temp.max -
                      futureWeather.forecast[0].temp.min)) *
                  100
                }
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Conditions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {futureWeather.forecast && futureWeather.forecast.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Precipitation
                </span>
                <span className="font-semibold">
                  {Math.round(futureWeather.forecast[0].pop * 100)}%
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Wind Speed</span>
              <span className="font-semibold">
                {futureWeather.current.wind_speed.toFixed(1)} m/s
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Humidity</span>
              <span className="font-semibold">
                {futureWeather.current.humidity}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Visibility</span>
              <span className="font-semibold">
                {(futureWeather.current.visibility / 1000).toFixed(1)} km
              </span>
            </div>

            {futureWeather.current.uv_index !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">UV Index</span>
                <span className="font-semibold">
                  {futureWeather.current.uv_index}
                </span>
              </div>
            )}
          </div>

          {/* Weather Description */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Weather Description</p>
            <p className="text-sm text-muted-foreground">
              {futureWeather.current.weather[0].description
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}