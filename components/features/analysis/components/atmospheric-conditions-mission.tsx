'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, Thermometer } from 'lucide-react';

interface AtmosphericConditionsProps {
  weatherData: any;
  pressureStatus: { status: string; color: string; risk: string };
  nasaData?: any;
}

export function AtmosphericConditionsMission({
  weatherData,
  pressureStatus,
  nasaData,
}: AtmosphericConditionsProps) {
  // Handle both OpenWeather raw format (main.temp) and simplified format (temp)
  const currentTemp = Math.round(
    weatherData?.main?.temp || weatherData?.temp || 0
  );
  const feelsLike = Math.round(
    weatherData?.main?.feels_like || weatherData?.feels_like || 0
  );
  const humidity = weatherData?.main?.humidity || weatherData?.humidity || 0;
  const windSpeed = weatherData?.wind?.speed || weatherData?.wind_speed || 0;
  const windDeg = weatherData?.wind?.deg || weatherData?.wind_direction || 0;
  const pressure = weatherData?.main?.pressure || weatherData?.pressure || 1013;

  // Check if we have NASA historical data for comparison
  const hasNASAData = nasaData?.temperature;
  const nasaAvgTemp = hasNASAData
    ? Math.round(nasaData.temperature.avg_celsius)
    : null;

  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-primary" />
            <span>ATMOSPHERIC CONDITIONS</span>
          </CardTitle>
          {hasNASAData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    NASA+OpenWeather
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Live data from OpenWeather API</p>
                  <p className="text-xs text-muted-foreground">
                    Historical context from NASA POWER
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Temperature */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {currentTemp}°
            </div>
            <div className="text-sm text-muted-foreground">TEMPERATURE</div>
            <div className="text-xs text-accent">FEELS {feelsLike}°</div>
            {nasaAvgTemp && nasaAvgTemp !== currentTemp && (
              <div className="text-xs text-muted-foreground mt-1">
                Avg: {nasaAvgTemp}° (NASA)
              </div>
            )}
          </div>

          {/* Humidity */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {humidity}%
            </div>
            <div className="text-sm text-muted-foreground">HUMIDITY</div>
            <Progress value={humidity} className="mt-2" />
          </div>

          {/* Wind */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {Math.round(windSpeed * 3.6)}
            </div>
            <div className="text-sm text-muted-foreground">WIND KM/H</div>
            <div className="text-xs text-accent">DIR {windDeg}°</div>
          </div>

          {/* Pressure */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {pressure}
            </div>
            <div className="text-sm text-muted-foreground">PRESSURE hPa</div>
            <Badge variant="outline" className={`mt-1 ${pressureStatus.color}`}>
              {pressureStatus.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}