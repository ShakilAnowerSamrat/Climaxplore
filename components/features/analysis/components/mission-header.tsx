'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Globe, MapPin, Radar, Satellite, Zap } from 'lucide-react';

interface MissionHeaderProps {
  missionTime: Date;
  systemStatus: string;
  location: string;
  selectedDate?: Date;
  coordinates?: { lat: number; lon: number };
}

export function MissionHeader({
  missionTime,
  systemStatus,
  location,
  selectedDate,
  coordinates,
}: MissionHeaderProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCoordinates = (coords?: { lat: number; lon: number }) => {
    if (!coords) return 'N/A';
    const latDir = coords.lat >= 0 ? 'N' : 'S';
    const lonDir = coords.lon >= 0 ? 'E' : 'W';
    return `${Math.abs(coords.lat).toFixed(2)}°${latDir}, ${Math.abs(
      coords.lon
    ).toFixed(2)}°${lonDir}`;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Satellite className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">
                WEATHER MISSION CONTROL
              </h1>
              <p className="text-sm text-muted-foreground">
                NASA Space Apps Challenge 2025
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono text-primary">
            {missionTime.toLocaleTimeString('en-US', { hour12: false })} UTC
          </div>
          <div className="text-sm text-muted-foreground">
            Mission Day:{' '}
            {Math.floor(
              (Date.now() - new Date('2025-01-01').getTime()) /
                (1000 * 60 * 60 * 24)
            )}
          </div>
        </div>
      </div>

      <Card className="mission-control-panel">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-3">
            {/* System Status Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="nasa-glow">
                  <Zap className="h-3 w-3 mr-1" />
                  SYSTEM: {systemStatus}
                </Badge>
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  LOCATION: {location.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  <Radar className="h-3 w-3 mr-1" />
                  SATELLITE: ACTIVE
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-chart-2 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">LIVE DATA</span>
              </div>
            </div>

            {/* Location & Date Details Row */}
            <div className="flex items-center space-x-6 text-sm border-t pt-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Coordinates:</span>
                <span className="font-mono text-primary">
                  {formatCoordinates(coordinates)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Analysis Date:</span>
                <span className="font-mono text-primary">
                  {selectedDate
                    ? formatDate(selectedDate)
                    : formatDate(new Date())}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}