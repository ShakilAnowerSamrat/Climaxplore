import type { WeatherData } from '@/lib/weather-api';
import { addMonths, format } from 'date-fns';

import {
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Snowflake,
  Wind,
  CloudFog,
  CloudLightning,
} from 'lucide-react';

export interface ExtremeCondition {
  type:
    | 'very_hot'
    | 'very_cold'
    | 'very_windy'
    | 'very_wet'
    | 'very_uncomfortable';
  severity: 'warning' | 'danger' | 'extreme';
  message: string;
  icon: string;
  color: string;
}

export const detectExtremeConditions = (
  weatherData: WeatherData
): ExtremeCondition[] => {
  const conditions: ExtremeCondition[] = [];
  const { current } = weatherData;

  // Very Hot conditions (>35°C)
  if (current.temp > 35) {
    conditions.push({
      type: 'very_hot',
      severity:
        current.temp > 40
          ? 'extreme'
          : current.temp > 37
          ? 'danger'
          : 'warning',
      message: `Extreme heat warning: ${Math.round(
        current.temp
      )}°C - Heat exhaustion risk`,
      icon: 'flame',
      color: 'text-red-600',
    });
  }

  // Very Cold conditions (<0°C)
  if (current.temp < 0) {
    conditions.push({
      type: 'very_cold',
      severity:
        current.temp < -10
          ? 'extreme'
          : current.temp < -5
          ? 'danger'
          : 'warning',
      message: `Freezing conditions: ${Math.round(
        current.temp
      )}°C - Hypothermia risk`,
      icon: 'snowflake',
      color: 'text-blue-600',
    });
  }

  // Very Windy conditions (>15 m/s)
  if (current.wind_speed > 15) {
    conditions.push({
      type: 'very_windy',
      severity:
        current.wind_speed > 25
          ? 'extreme'
          : current.wind_speed > 20
          ? 'danger'
          : 'warning',
      message: `High wind warning: ${current.wind_speed} m/s - Dangerous for outdoor activities`,
      icon: 'wind',
      color: 'text-orange-600',
    });
  }

  // Very Wet conditions (rain/storm)
  const hasStorm = current.weather.some((w) =>
    w.main.toLowerCase().includes('thunderstorm')
  );
  const hasHeavyRain = current.weather.some(
    (w) =>
      w.main.toLowerCase().includes('rain') && w.description.includes('heavy')
  );

  if (hasStorm) {
    conditions.push({
      type: 'very_wet',
      severity: 'extreme',
      message: 'Thunderstorm alert - Seek immediate indoor shelter',
      icon: 'zap',
      color: 'text-purple-600',
    });
  } else if (hasHeavyRain) {
    conditions.push({
      type: 'very_wet',
      severity: 'danger',
      message: 'Heavy rain warning - Flooding and visibility risks',
      icon: 'cloud-rain',
      color: 'text-blue-600',
    });
  }

  // Very Uncomfortable conditions (high heat index)
  const heatIndex =
    current.temp + (current.humidity / 100) * (current.temp - 14.5);
  if (heatIndex > 40 || (current.humidity > 85 && current.temp > 30)) {
    conditions.push({
      type: 'very_uncomfortable',
      severity: heatIndex > 45 ? 'extreme' : 'danger',
      message: `Dangerous heat index: ${Math.round(
        heatIndex
      )}°C - High humidity makes it feel much hotter`,
      icon: 'droplets',
      color: 'text-yellow-600',
    });
  }

  return conditions;
};

export const getMonthDisplayName = (monthKey: string) => {
  if (monthKey === 'current') return 'Current';
  const offset = Number.parseInt(monthKey.replace('month', ''));
  return format(addMonths(new Date(), offset), 'MMMM yyyy');
};

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low':
      return 'bg-primary text-primary-foreground';
    case 'medium':
      return 'bg-accent text-accent-foreground';
    case 'high':
      return 'bg-destructive text-destructive-foreground';
    case 'extreme':
      return 'bg-destructive text-destructive-foreground animate-pulse';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const getFactorColor = (status: string) => {
  switch (status) {
    case 'optimal':
      return 'text-primary';
    case 'acceptable':
      return 'text-accent';
    case 'poor':
      return 'text-destructive';
    case 'dangerous':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
};

export const getFactorIcon = (status: string) => {
  switch (status) {
    case 'optimal':
      return 'check-circle';
    case 'acceptable':
      return 'alert-triangle';
    case 'poor':
    case 'dangerous':
      return 'x-circle';
    default:
      return 'alert-triangle';
  }
};



// export const getWeatherIcon = (weatherMain: string): string => {
//   if (!weatherMain) return 'cloud';

//   switch (weatherMain.toLowerCase()) {
//     case 'clear':
//       return 'sun';

//     case 'clouds':
//       return 'cloud';

//     case 'rain':
//     case 'drizzle':
//       return 'cloud-rain';

//     case 'thunderstorm':
//       return 'zap';

//     case 'snow':
//       return 'snowflake';

//     case 'mist':
//     case 'fog':
//     case 'haze':
//     case 'smoke':
//       return 'cloud-fog';

//     case 'dust':
//     case 'sand':
//     case 'ash':
//       return 'wind';

//     case 'squall':
//     case 'tornado':
//       return 'cloud-lightning';

//     default:
//       return 'cloud';
//   }
// };

export const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'warning':
      return 'border-yellow-500 bg-yellow-50 text-yellow-800';
    case 'danger':
      return 'border-orange-500 bg-orange-50 text-orange-800';
    case 'extreme':
      return 'border-red-500 bg-red-50 text-red-800 animate-pulse';
    default:
      return 'border-gray-500 bg-gray-50 text-gray-800';
  }
};