'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ActivityType } from '@/lib/risk-assessment';
import type { UserPreferences } from '@/lib/weather-api';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic import for Globe (client-side only)
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <div className="text-sm text-white">Loading 3D Globe...</div>
      </div>
    </div>
  ),
});

interface WeatherMap3DProps {
  markers: Array<{
    lat: number;
    lon: number;
    name: string;
    weather?: any;
    risk?: string;
  }>;
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  activity: ActivityType;
  preferences: UserPreferences;
  mapMode: 'temperature' | 'wind' | 'precipitation' | 'visibility' | 'pressure';
}

// Get marker color based on temperature or risk
function getMarkerColor(temp?: number, risk?: string): string {
  // Prioritize risk color if available
  if (risk) {
    switch (risk) {
      case 'low':
        return '#10b981'; // green-500
      case 'medium':
        return '#fbbf24'; // yellow-400
      case 'high':
        return '#f97316'; // orange-500
      case 'extreme':
        return '#ef4444'; // red-500
      default:
        return '#60a5fa'; // blue-400
    }
  }

  // Fall back to temperature color
  if (temp === undefined) return '#60a5fa'; // blue-400
  if (temp < 0) return '#3b82f6'; // blue-500 (freezing)
  if (temp < 10) return '#10b981'; // green-500 (cold)
  if (temp < 20) return '#fbbf24'; // yellow-400 (mild)
  if (temp < 30) return '#f97316'; // orange-500 (warm)
  return '#ef4444'; // red-500 (hot)
}

export function WeatherMap3D({
  markers,
  onLocationSelect,
  activity,
  preferences,
  mapMode,
}: WeatherMap3DProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Convert markers to globe format
  const globeMarkers = markers.map((marker) => ({
    lat: marker.lat,
    lng: marker.lon,
    name: marker.name,
    temp: marker.weather?.current?.temp,
    weather: marker.weather?.current?.weather?.[0]?.description,
    humidity: marker.weather?.current?.humidity,
    windSpeed: marker.weather?.current?.wind_speed,
    pressure: marker.weather?.current?.pressure,
    risk: marker.risk,
    size: 0.8,
    color: getMarkerColor(marker.weather?.current?.temp, marker.risk),
  }));

  if (!isMounted) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="text-sm text-white">Initializing 3D Globe...</div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative w-full h-96 overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* @ts-ignore - Globe component type issues */}
          <Globe
            // Globe appearance
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            // Show atmosphere
            showAtmosphere={true}
            atmosphereColor="lightskyblue"
            atmosphereAltitude={0.15}
            // Enable auto-rotation and camera controls
            animateIn={true}
            // Points (weather markers)
            pointsData={globeMarkers}
            pointLat="lat"
            pointLng="lng"
            pointAltitude={0.01}
            pointRadius="size"
            pointColor="color"
            pointLabel={(d: any) => {
              const marker = d;
              return `
                <div style="
                  background: rgba(0, 0, 0, 0.9);
                  padding: 12px;
                  border-radius: 8px;
                  color: white;
                  font-family: system-ui, -apple-system, sans-serif;
                  max-width: 220px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                ">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #60a5fa;">
                    ${marker.name}
                  </div>
                  ${
                    marker.temp !== undefined
                      ? `
                    <div style="font-size: 28px; font-weight: bold; color: ${
                      marker.color
                    }; margin-bottom: 6px;">
                      ${Math.round(marker.temp)}°C
                    </div>
                  `
                      : ''
                  }
                  ${
                    marker.weather
                      ? `
                    <div style="font-size: 12px; color: #cbd5e0; margin-bottom: 8px; text-transform: capitalize;">
                      ${marker.weather}
                    </div>
                  `
                      : ''
                  }
                  ${
                    marker.humidity !== undefined ||
                    marker.windSpeed !== undefined ||
                    marker.pressure !== undefined
                      ? `<div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px; margin-top: 8px;">`
                      : ''
                  }
                  ${
                    marker.humidity !== undefined
                      ? `
                    <div style="font-size: 11px; color: #a0aec0; margin-bottom: 4px;">
                      💧 Humidity: ${marker.humidity}%
                    </div>
                  `
                      : ''
                  }
                  ${
                    marker.windSpeed !== undefined
                      ? `
                    <div style="font-size: 11px; color: #a0aec0; margin-bottom: 4px;">
                      🌬️ Wind: ${marker.windSpeed.toFixed(1)} m/s
                    </div>
                  `
                      : ''
                  }
                  ${
                    marker.pressure !== undefined
                      ? `
                    <div style="font-size: 11px; color: #a0aec0;">
                      🌡️ Pressure: ${marker.pressure} hPa
                    </div>
                  `
                      : ''
                  }
                  ${
                    marker.humidity !== undefined ||
                    marker.windSpeed !== undefined ||
                    marker.pressure !== undefined
                      ? `</div>`
                      : ''
                  }
                </div>
              `;
            }}
            // Click handler
            onGlobeClick={(coords: any) => {
              if (coords.lat !== undefined && coords.lng !== undefined) {
                const locationName = `Location ${coords.lat.toFixed(
                  2
                )}, ${coords.lng.toFixed(2)}`;
                console.log('[climaxplore] 3D Globe clicked:', {
                  lat: coords.lat,
                  lng: coords.lng,
                  locationName,
                });
                onLocationSelect(coords.lat, coords.lng, locationName);
              }
            }}
            // Point interaction
            onPointClick={(point: any) => {
              console.log('[climaxplore] 3D Marker clicked:', point);
              if (point && point.lat !== undefined && point.lng !== undefined) {
                onLocationSelect(point.lat, point.lng, point.name);
              }
            }}
            // Rendering settings
            width={undefined}
            height={400}
            rendererConfig={{
              antialias: true,
              alpha: true,
            }}
          />

          {/* 3D Map Instructions */}
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white text-xs px-4 py-3 rounded-lg shadow-lg z-10">
            <div className="font-semibold mb-2 text-blue-400">
              🌍 3D Globe Controls
            </div>
            <div className="space-y-1.5 text-white/90">
              <div>
                • <span className="text-blue-300">Drag</span> to rotate the
                globe
              </div>
              <div>
                • <span className="text-blue-300">Scroll</span> to zoom in/out
              </div>
              <div>
                • <span className="text-blue-300">Click markers</span> for
                details
              </div>
              <div>
                • <span className="text-blue-300">Click globe</span> to add
                locations
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}