'use client';

import type { MapMarker } from '@/types/weather-map';
import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

interface Globe3DProps {
  markers: MapMarker[];
  onGlobeClick: (lat: number, lng: number) => void;
  className?: string;
}

interface GlobeMarker {
  lat: number;
  lng: number;
  name: string;
  temp?: number;
  weather?: string;
  humidity?: number;
  windSpeed?: number;
  size: number;
  color: string;
}

export const Globe3D = ({
  markers,
  onGlobeClick,
  className = '',
}: Globe3DProps) => {
  const globeEl = useRef<any>();
  const [globeReady, setGlobeReady] = useState(false);

  // Convert markers to globe format
  const globeMarkers: GlobeMarker[] = markers.map((marker) => ({
    lat: marker.lat,
    lng: marker.lon,
    name: marker.name,
    temp: marker.weather?.current?.temp,
    weather: marker.weather?.current?.weather?.[0]?.description,
    humidity: marker.weather?.current?.humidity,
    windSpeed: marker.weather?.current?.wind_speed,
    size: 0.8,
    color: getMarkerColor(marker.weather?.current?.temp),
  }));

  // Initialize globe settings
  useEffect(() => {
    if (globeEl.current) {
      // Enable auto-rotation
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;

      // Set initial point of view
      globeEl.current.pointOfView({ altitude: 2.5 }, 1000);

      setGlobeReady(true);
    }
  }, []);

  // Get marker color based on temperature
  function getMarkerColor(temp?: number): string {
    if (!temp) return '#60a5fa'; // blue-400
    if (temp < 0) return '#3b82f6'; // blue-500 (freezing)
    if (temp < 10) return '#10b981'; // green-500 (cold)
    if (temp < 20) return '#fbbf24'; // yellow-400 (mild)
    if (temp < 30) return '#f97316'; // orange-500 (warm)
    return '#ef4444'; // red-500 (hot)
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <Globe
        ref={globeEl}
        // Globe appearance
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        // Show atmosphere
        showAtmosphere={true}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.15}
        // Points (weather markers)
        pointsData={globeMarkers}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={0.01}
        pointRadius="size"
        pointColor="color"
        pointLabel={(d: any) => {
          const marker = d as GlobeMarker;
          return `
            <div style="
              background: rgba(0, 0, 0, 0.8);
              padding: 12px;
              border-radius: 8px;
              color: white;
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 200px;
            ">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px;">
                ${marker.name}
              </div>
              ${
                marker.temp !== undefined
                  ? `
                <div style="font-size: 24px; font-weight: bold; color: ${
                  marker.color
                };">
                  ${Math.round(marker.temp)}°C
                </div>
              `
                  : ''
              }
              ${
                marker.weather
                  ? `
                <div style="font-size: 12px; color: #cbd5e0; margin-top: 4px;">
                  ${marker.weather}
                </div>
              `
                  : ''
              }
              ${
                marker.humidity !== undefined
                  ? `
                <div style="font-size: 11px; color: #a0aec0; margin-top: 6px;">
                  💧 Humidity: ${marker.humidity}%
                </div>
              `
                  : ''
              }
              ${
                marker.windSpeed !== undefined
                  ? `
                <div style="font-size: 11px; color: #a0aec0;">
                  🌬️ Wind: ${marker.windSpeed.toFixed(1)} m/s
                </div>
              `
                  : ''
              }
            </div>
          `;
        }}
        // Click handler
        onGlobeClick={(coords) => {
          if (coords.lat !== undefined && coords.lng !== undefined) {
            console.log('[Globe3D] Click detected:', coords);
            onGlobeClick(coords.lat, coords.lng);
          }
        }}
        // Point interaction
        onPointClick={(point: any) => {
          console.log('[Globe3D] Marker clicked:', point);
          // Could add marker selection here
        }}
        // Rendering settings
        width={undefined}
        height={undefined}
        rendererConfig={{
          antialias: true,
          alpha: true,
        }}
      />
    </div>
  );
};