import { Card, CardContent } from '@/components/ui/card';
import type { MapMarker } from '@/types/weather-map';
import dynamic from 'next/dynamic';
import type { MapMode } from '../utils/map-constants';
import { MapStatistics } from './map-statistics';

// Dynamic import for Leaflet (client-side only)
const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  { ssr: false }
);

interface TwoDMapProps {
  markers: MapMarker[];
  selectedMarker: MapMarker | null;
  mapMode: MapMode;
  mapCenter: { lat: number; lon: number };
  zoom: number;
  loading: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerSelect: (marker: MapMarker) => void;
}

export const TwoDMap = ({
  markers,
  selectedMarker,
  mapMode,
  mapCenter,
  zoom,
  loading,
  onMapClick,
  onMarkerSelect,
}: TwoDMapProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative w-full h-96 overflow-hidden rounded-lg">
          <LeafletMap
            center={[mapCenter.lat, mapCenter.lon]}
            zoom={Math.max(2, Math.min(zoom, 18))}
            markers={markers.map((marker) => ({
              name: marker.name,
              lat: marker.lat,
              lon: marker.lon,
              temp: marker.weather?.current?.temp,
              weather: marker.weather?.current?.weather?.[0]?.description,
              humidity: marker.weather?.current?.humidity,
              windSpeed: marker.weather?.current?.wind_speed,
              pressure: undefined,
            }))}
            onMapClick={(lat, lng) => onMapClick(lat, lng)}
          />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-[1000] pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="text-sm text-muted-foreground">
                  Loading weather data...
                </div>
              </div>
            </div>
          )}

          {/* Map Statistics - positioned over the map */}
          <div className="absolute bottom-4 left-4 z-[500]">
            <MapStatistics markers={markers} mapMode={mapMode} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};