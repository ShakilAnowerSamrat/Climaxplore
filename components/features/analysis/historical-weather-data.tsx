'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { HistoricalHeaderControls } from './components/historical-header-controls';
import { HistoricalLoading } from './components/historical-loading';
import { HumidityChart } from './components/humidity-chart';
import { PressureChart } from './components/pressure-chart';
import { TemperatureChart } from './components/temperature-chart';
import { WeatherStatistics } from './components/weather-statistics';
import { WindSpeedChart } from './components/wind-speed-chart';
import { useHistoricalWeatherData } from './hooks/use-historical-weather-data';

interface HistoricalWeatherDataProps {
  lat: number;
  lon: number;
  location: string;
}

export function HistoricalWeatherData({
  lat,
  lon,
  location,
}: HistoricalWeatherDataProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 14 | 30>(7);
  const { historicalData, loading, weatherStats, exportData } =
    useHistoricalWeatherData(lat, lon, selectedPeriod);

  if (loading) {
    return <HistoricalLoading selectedPeriod={selectedPeriod} />;
  }

  return (
    <div className="space-y-6">
      <HistoricalHeaderControls
        location={location}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        historicalData={historicalData}
        exportData={exportData}
      />

      <WeatherStatistics weatherStats={weatherStats} />

      <Tabs defaultValue="temperature" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="pressure">Pressure</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="wind">Wind Speed</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature">
          <TemperatureChart historicalData={historicalData} />
        </TabsContent>

        <TabsContent value="pressure">
          <PressureChart historicalData={historicalData} />
        </TabsContent>

        <TabsContent value="humidity">
          <HumidityChart historicalData={historicalData} />
        </TabsContent>

        <TabsContent value="wind">
          <WindSpeedChart historicalData={historicalData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}