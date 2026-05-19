'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface WeatherMarker {
  name: string;
  lat: number;
  lon: number;
  temp?: number;
  weather?: string;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
}

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: WeatherMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

// Component to handle map click events
function MapClickHandler({
  onClick,
}: {
  onClick?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function LeafletMap({
  center = [20, 0],
  zoom = 2,
  markers = [],
  onMapClick,
  className = '',
}: LeafletMapProps) {
  return (
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onClick={onMapClick} />

        {markers.map((marker, index) => (
          <Marker
            key={`${marker.name}-${marker.lat}-${marker.lon}-${index}`}
            position={[marker.lat, marker.lon]}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <h3 className="font-bold text-lg mb-2">{marker.name}</h3>
                {marker.temp !== undefined && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Temperature:</span>
                    <span className="text-sm font-semibold">
                      {marker.temp.toFixed(1)}°C
                    </span>
                  </div>
                )}
                {marker.weather && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Condition:</span>
                    <span className="text-sm font-semibold capitalize">
                      {marker.weather}
                    </span>
                  </div>
                )}
                {marker.humidity !== undefined && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Humidity:</span>
                    <span className="text-sm font-semibold">
                      {marker.humidity.toFixed(0)}%
                    </span>
                  </div>
                )}
                {marker.windSpeed !== undefined && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Wind Speed:</span>
                    <span className="text-sm font-semibold">
                      {marker.windSpeed.toFixed(1)} m/s
                    </span>
                  </div>
                )}
                {marker.pressure !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pressure:</span>
                    <span className="text-sm font-semibold">
                      {marker.pressure.toFixed(0)} hPa
                    </span>
                  </div>
                )}
                {!marker.temp && !marker.weather && (
                  <p className="text-sm text-gray-500">
                    Click to view weather details
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}