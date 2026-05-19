'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertTriangle, Info, Radar } from 'lucide-react';

interface EnvironmentalHazardAssessmentProps {
  weatherData: any;
  visibilityStatus: { status: string; color: string; risk: string };
  uvStatus: { status: string; color: string; risk: string };
  nasaData?: any;
}

export function EnvironmentalHazardAssessment({
  weatherData,
  visibilityStatus,
  uvStatus,
  nasaData,
}: EnvironmentalHazardAssessmentProps) {
  // Get precipitation probability from NASA if available
  const precipProbability = nasaData?.precipitation?.probability || null;
  const hasNASAPrecip = precipProbability !== null;

  // Check for extreme weather warnings from NASA
  const hasHeatWaveRisk =
    nasaData?.extreme_events?.heat_waves?.probability > 30;
  const hasColdSnapRisk =
    nasaData?.extreme_events?.cold_snaps?.probability > 30;
  const hasHeavyRainRisk =
    nasaData?.extreme_events?.heavy_rain?.probability > 20;

  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Radar className="h-5 w-5 text-destructive" />
            <span>ENVIRONMENTAL HAZARD ASSESSMENT</span>
          </CardTitle>
          {(hasHeatWaveRisk || hasColdSnapRisk || hasHeavyRainRisk) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge
                    variant="destructive"
                    className="text-xs animate-pulse"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    ALERT
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">Extreme Weather Risk Detected</p>
                  {hasHeatWaveRisk && (
                    <p className="text-xs">
                      • Heat Wave:{' '}
                      {nasaData.extreme_events.heat_waves.probability}%
                    </p>
                  )}
                  {hasColdSnapRisk && (
                    <p className="text-xs">
                      • Cold Snap:{' '}
                      {nasaData.extreme_events.cold_snaps.probability}%
                    </p>
                  )}
                  {hasHeavyRainRisk && (
                    <p className="text-xs">
                      • Heavy Rain:{' '}
                      {nasaData.extreme_events.heavy_rain.probability}%
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Visibility */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">VISIBILITY</span>
              <Badge className={visibilityStatus.color}>
                {visibilityStatus.status}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {((weatherData.visibility || 10000) / 1000).toFixed(1)} km
            </div>
            <div className="text-xs text-muted-foreground">
              RISK LEVEL: {visibilityStatus.risk}
            </div>
          </div>

          {/* UV Index */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">UV INDEX</span>
              <Badge className={uvStatus.color}>{uvStatus.status}</Badge>
            </div>
            <div className="text-2xl font-bold">{weatherData.uvi || 0}</div>
            <div className="text-xs text-muted-foreground">
              RISK LEVEL: {uvStatus.risk}
            </div>
          </div>

          {/* Precipitation - Enhanced with NASA data */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PRECIPITATION</span>
              <Badge variant="outline">
                {weatherData.rain ? 'ACTIVE' : 'NONE'}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {weatherData.rain?.['1h'] || 0} mm
            </div>
            <div className="text-xs text-muted-foreground">LAST HOUR</div>
            {hasNASAPrecip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground cursor-help">
                      <Info className="h-3 w-3" />
                      <span>Historical: {precipProbability}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Based on {nasaData.period?.years_analyzed || 10} years of
                      NASA data
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nasaData.precipitation.rainy_days || 0} rainy days
                      observed
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}