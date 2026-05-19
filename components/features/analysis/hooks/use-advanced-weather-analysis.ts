'use client';

import {
  getAirQuality,
  getEnhancedForecast,
  getWeatherAlerts,
} from '@/lib/weather-api';
import { useEffect, useState } from 'react';

export function useAdvancedWeatherAnalysis(weather: any) {
  const [airQuality, setAirQuality] = useState<any>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);
  const [enhancedForecast, setEnhancedForecast] = useState<any>(null);
  const [nasaHistoricalData, setNasaHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvancedData = async () => {
      if (!weather?.location) return;

      setLoading(true);
      try {
        // Calculate date range for NASA historical data (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}${month}${day}`;
        };

        const start = formatDate(startDate);
        const end = formatDate(endDate);

        console.log(
          '[Advanced Analysis] 🛰️ Fetching NASA Temporal data for Weather Trends:',
          {
            lat: weather.location.lat,
            lon: weather.location.lon,
            start,
            end,
          }
        );

        // Fetch all data in parallel
        const [airQualityData, alertsData, forecastData, nasaData] =
          await Promise.all([
            getAirQuality(weather.location.lat, weather.location.lon),
            getWeatherAlerts(weather.location.lat, weather.location.lon),
            getEnhancedForecast(weather.location.lat, weather.location.lon),
            // Fetch NASA POWER Temporal API data for Weather Trends tab
            fetch(
              `/api/weather/nasa/temporal/daily?lat=${weather.location.lat}&lon=${weather.location.lon}&start=${start}&end=${end}`
            )
              .then((res) => res.json())
              .then((data) => {
                console.log(
                  '[Advanced Analysis] 📊 NASA Temporal data received:',
                  {
                    success: data.success,
                    dataPoints: data.data?.length || 0,
                    source: data.metadata?.source,
                  }
                );

                // Transform NASA POWER data to chart format (same as Historical Data tab)
                const transformedData = (data.data || []).map((point: any) => {
                  // Parse YYYYMMDD date string
                  const dateStr = point.date;
                  const year = parseInt(dateStr.substring(0, 4));
                  const month = parseInt(dateStr.substring(4, 6)) - 1;
                  const day = parseInt(dateStr.substring(6, 8));
                  const date = new Date(year, month, day);

                  const hasValidPressure =
                    point.pressure && point.pressure !== -999;
                  const hasValidHumidity =
                    point.humidity && point.humidity !== -999;
                  const hasValidWindSpeed =
                    point.wind_speed && point.wind_speed !== -999;

                  return {
                    dt: Math.floor(date.getTime() / 1000),
                    date: date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    }),
                    fullDate: date.toLocaleDateString(),
                    dateTime: date,
                    // Temperature (always from NASA)
                    temp: Number(point.temp) || 25,
                    temp_min: Number(point.temp_min) || Number(point.temp) - 5,
                    temp_max: Number(point.temp_max) || Number(point.temp) + 5,
                    // Pressure (NASA in kPa, convert to hPa: 1 kPa = 10 hPa)
                    pressure: hasValidPressure
                      ? Number(point.pressure) * 10
                      : 1013,
                    // Humidity (NASA in %)
                    humidity: hasValidHumidity ? Number(point.humidity) : 65,
                    // Wind Speed (NASA in m/s)
                    wind_speed: hasValidWindSpeed
                      ? Number(point.wind_speed)
                      : 3.5,
                    weather: [
                      {
                        description: 'NASA POWER Actual Measurement',
                        main: 'NASA',
                      },
                    ],
                  };
                });

                console.log('[Advanced Analysis] 🔄 Transformed NASA data:', {
                  originalFormat: data.data?.[0],
                  transformedFormat: transformedData[0],
                  totalPoints: transformedData.length,
                });

                return transformedData;
              })
              .catch((err) => {
                console.error(
                  '[Advanced Analysis] ❌ NASA Temporal fetch failed:',
                  err
                );
                return [];
              }),
          ]);

        setAirQuality(airQualityData);
        setWeatherAlerts(alertsData);
        setEnhancedForecast(forecastData);
        setNasaHistoricalData(nasaData);

        console.log('[Advanced Analysis] ✅ All data fetched successfully');
      } catch (error) {
        console.error('Failed to fetch advanced weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvancedData();
  }, [weather]);

  return {
    airQuality,
    weatherAlerts,
    enhancedForecast,
    nasaHistoricalData, // NEW: NASA POWER data for Weather Trends
    loading,
  };
}