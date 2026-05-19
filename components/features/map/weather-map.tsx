'use client';

import type { MapMarker, WeatherMapProps } from '@/types/weather-map';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { MapControls } from './components/map-controls';
import { MapLegend } from './components/map-legend';
import { TwoDMap } from './components/two-d-map';
import { useWeatherMarkers } from './hooks/use-weather-markers';
import { MAJOR_CITIES, type MapMode } from './utils/map-constants';

const WeatherMap3D = dynamic(
  () =>
    import('./weather-map-3d').then((mod) => ({ default: mod.WeatherMap3D })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">
            Loading 3D Globe...
          </div>
        </div>
      </div>
    ),
  }
);

export function WeatherMap({
  onLocationSelect,
  currentLocation,
  activity,
  preferences,
}: WeatherMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lon: -74.006 }); // Default to NYC
  const [zoom, setZoom] = useState(8);
  const [mapMode, setMapMode] = useState<MapMode>('temperature');
  const [is3DMode, setIs3DMode] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const {
    markers,
    loading,
    setLoading,
    loadWeatherForMarker,
    addMarker,
    updateMarkers,
    clearMarkers,
  } = useWeatherMarkers(activity, preferences);

  // Initialize map with current location
  useEffect(() => {
    setIsMounted(true);
    if (currentLocation) {
      setMapCenter({ lat: currentLocation.lat, lon: currentLocation.lon });
      const marker: MapMarker = {
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        name: currentLocation.name,
      };
      updateMarkers([marker]);
      loadWeatherForMarker(marker);
    }
  }, [currentLocation?.lat, currentLocation?.lon]); // Only depend on location coordinates, not functions

  const populateMajorCities = async () => {
    setLoading(true);
    try {
      const cityMarkers = MAJOR_CITIES.slice(0, 8).map((city) => ({
        lat: city.lat,
        lon: city.lon,
        name: city.name,
      }));

      updateMarkers(cityMarkers);

      // Load weather data for each city
      for (const marker of cityMarkers) {
        await loadWeatherForMarker(marker);
      }
    } catch (error) {
      console.error('Failed to populate cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (lat: number, lon: number) => {
    setLoading(true);

    try {
      const locationName = `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      const newMarker: MapMarker = {
        lat,
        lon,
        name: locationName,
      };

      await addMarker(newMarker);
      onLocationSelect(lat, lon, locationName);
    } catch (error) {
      console.error('Failed to add location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onLocationSelect(marker.lat, marker.lon, marker.name);
  };

  const getCurrentLocationWeather = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.error('[climaxplore] Geolocation is not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lon: longitude });

        const marker: MapMarker = {
          lat: latitude,
          lon: longitude,
          name: 'Current Location',
        };

        updateMarkers([marker]);
        await loadWeatherForMarker(marker);
        onLocationSelect(latitude, longitude, 'Current Location');
      },
      (error) => {
        console.error('[climaxplore] Geolocation error:', error);
      }
    );
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <MapControls
        mapMode={mapMode}
        is3DMode={is3DMode}
        loading={loading}
        onMapModeChange={setMapMode}
        on3DModeToggle={() => setIs3DMode(!is3DMode)}
        onCurrentLocation={getCurrentLocationWeather}
        onPopulateCities={populateMajorCities}
        onClearAll={clearMarkers}
      />

      {/* Map Display */}
      {is3DMode ? (
        <WeatherMap3D
          markers={markers}
          onLocationSelect={onLocationSelect}
          activity={activity}
          preferences={preferences}
          mapMode={mapMode}
        />
      ) : (
        <TwoDMap
          markers={markers}
          selectedMarker={selectedMarker}
          mapMode={mapMode}
          mapCenter={mapCenter}
          zoom={zoom}
          loading={loading}
          onMapClick={handleMapClick}
          onMarkerSelect={handleMarkerClick}
        />
      )}

      {/* Map Legend */}
      <MapLegend mapMode={mapMode} activity={activity} />
    </div>
  );
}