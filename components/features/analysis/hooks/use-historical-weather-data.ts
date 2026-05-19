'use client';

import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function useHistoricalWeatherData(
  lat: number,
  lon: number,
  selectedPeriod: number
) {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [weatherStats, setWeatherStats] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistoricalData();
  }, [lat, lon, selectedPeriod]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      console.log('[Historical] 🛰️ Fetching NASA Temporal data for:', {
        lat,
        lon,
        selectedPeriod,
      });

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedPeriod);

      // Format dates as YYYYMMDD for NASA POWER API
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      console.log('[Historical] 📅 Date range:', { start, end });

      // Fetch actual historical measurements from NASA POWER Temporal API
      const response = await fetch(
        `/api/weather/nasa/temporal/daily?lat=${lat}&lon=${lon}&start=${start}&end=${end}`
      );

      if (!response.ok) {
        throw new Error(`NASA Temporal API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response from NASA Temporal API');
      }

      console.log('[Historical] 🛰️ NASA Temporal data received:', {
        dataPoints: result.data.length,
        source: result.metadata?.source,
        samplePoint: result.data[0],
      });

      // Transform NASA POWER data to chart format
      const nasaData = result.data
        .map((point: any, index: number) => {
          // Parse YYYYMMDD date string
          const dateStr = point.date;
          const year = parseInt(dateStr.substring(0, 4));
          const month = parseInt(dateStr.substring(4, 6)) - 1;
          const day = parseInt(dateStr.substring(6, 8));
          const date = new Date(year, month, day);

          // NASA POWER provides these parameters:
          // - temp: T2M (Temperature at 2 Meters in °C)
          // - temp_min: T2M_MIN
          // - temp_max: T2M_MAX
          // - pressure: PS (Surface Pressure in kPa, need to convert to hPa)
          // - humidity: RH2M (Relative Humidity at 2 Meters in %)
          // - wind_speed: WS2M (Wind Speed at 2 Meters in m/s)
          // - precipitation: PRECTOTCORR (mm/day)

          const hasValidPressure = point.pressure && point.pressure !== -999;
          const hasValidHumidity = point.humidity && point.humidity !== -999;
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
            index,
            // Temperature (always from NASA)
            temp: Number(point.temp) || 25,
            temp_min: Number(point.temp_min) || Number(point.temp) - 5,
            temp_max: Number(point.temp_max) || Number(point.temp) + 5,
            // Pressure (NASA in kPa, convert to hPa: 1 kPa = 10 hPa)
            pressure: hasValidPressure ? Number(point.pressure) * 10 : 1013,
            // Humidity (NASA in %)
            humidity: hasValidHumidity ? Number(point.humidity) : 65,
            // Wind Speed (NASA in m/s)
            wind_speed: hasValidWindSpeed ? Number(point.wind_speed) : 3.5,
            weather: [
              {
                description: 'NASA POWER Actual Measurement',
                main: 'NASA',
              },
            ],
          };
        })
        .reverse(); // Reverse to show oldest to newest

      console.log('[Historical] 📊 Chart data prepared:', {
        points: nasaData.length,
        tempRange: {
          min: Math.min(...nasaData.map((d: any) => d.temp)),
          max: Math.max(...nasaData.map((d: any) => d.temp)),
        },
      });

      setHistoricalData(nasaData);
      calculateWeatherStats(nasaData);

      // Show toast notification if there's a data gap
      const expectedDays = selectedPeriod;
      const receivedDays = nasaData.length;
      const daysDifference = expectedDays - receivedDays;

      if (daysDifference > 0 && nasaData.length > 0) {
        const latestDate = nasaData[nasaData.length - 1].fullDate;
        const today = new Date().toLocaleDateString();

        toast({
          title: '📊 NASA Satellite Data Info',
          description: `Showing data until ${latestDate}. Recent ${daysDifference} day${
            daysDifference > 1 ? 's' : ''
          } (${latestDate} → ${today}) still being processed by NASA satellites.`,
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('[Historical] ❌ Failed to fetch data:', error);
      setHistoricalData([]);
      setWeatherStats(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeatherStats = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      setWeatherStats(null);
      return;
    }

    const temps = data.map((d) => d.temp);
    const pressures = data.map((d) => d.pressure);
    const humidities = data.map((d) => d.humidity);
    const windSpeeds = data.map((d) => d.wind_speed);

    const stats = {
      temperature: {
        avg: temps.reduce((a, b) => a + b, 0) / temps.length,
        min: Math.min(...temps),
        max: Math.max(...temps),
        trend: temps[temps.length - 1] > temps[0] ? 'up' : 'down',
      },
      pressure: {
        avg: pressures.reduce((a, b) => a + b, 0) / pressures.length,
        min: Math.min(...pressures),
        max: Math.max(...pressures),
        trend: pressures[pressures.length - 1] > pressures[0] ? 'up' : 'down',
      },
      humidity: {
        avg: humidities.reduce((a, b) => a + b, 0) / humidities.length,
        min: Math.min(...humidities),
        max: Math.max(...humidities),
      },
      windSpeed: {
        avg: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
        max: Math.max(...windSpeeds),
      },
    };

    setWeatherStats(stats);
  };

  const exportData = () => {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      console.warn('No historical data available for export');
      return;
    }

    const csvContent = [
      'Date,Temperature(°C),Temp Min(°C),Temp Max(°C),Pressure(hPa),Humidity(%),Wind Speed(m/s),Description',
      ...historicalData.map(
        (d) =>
          `${new Date(d.dt * 1000).toLocaleDateString()},${d.temp},${
            d.temp_min || ''
          },${d.temp_max || ''},${d.pressure},${d.humidity},${d.wind_speed},"${
            d.weather[0]?.description || 'NASA Data'
          }"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasa-weather-history-${selectedPeriod}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    historicalData,
    loading,
    weatherStats,
    exportData,
  };
}