import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Snowflake,
  Sun,
  Wind,
  Zap,
} from 'lucide-react';

export const getWeatherIcon = (weatherMain?: string) => {
  console.log('[getWeatherIcon] weatherMain:', weatherMain);

  if (!weatherMain)
    return <Cloud className="h-10 w-10 text-muted-foreground" />;

  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return <Sun className="h-10 w-10 text-yellow-400" />;

    case 'clouds':
      return <Cloud className="h-10 w-10 text-gray-400" />;

    case 'rain':
    case 'drizzle':
      return <CloudRain className="h-10 w-10 text-blue-400" />;

    case 'thunderstorm':
      return <Zap className="h-10 w-10 text-yellow-500" />;

    case 'snow':
      return <Snowflake className="h-10 w-10 text-blue-200" />;

    case 'mist':
    case 'fog':
    case 'haze':
    case 'smoke':
      return <CloudFog className="h-10 w-10 text-gray-300" />;

    case 'dust':
    case 'sand':
    case 'ash':
      return <Wind className="h-10 w-10 text-orange-300" />;

    case 'squall':
    case 'tornado':
      return <CloudLightning className="h-10 w-10 text-purple-500" />;

    default:
      return <Cloud className="h-10 w-10 text-gray-400" />;
  }
};