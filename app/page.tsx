'use client';

import { WeatherAppController } from '@/components/core/weather-app-controller';
import { WeatherProvider } from '@/contexts/weather-context';

export default function WeatherApp() {
  return (
    <WeatherProvider>
      <WeatherAppController />
    </WeatherProvider>
  );
}