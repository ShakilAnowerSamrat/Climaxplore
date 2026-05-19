import { Cloud, Sun, CloudRain } from "lucide-react"
import type { WeatherData } from "@/lib/weather-api"

interface WeatherIconProps {
  weather: WeatherData
  className?: string
}

export const WeatherIcon = ({ weather, className = "h-4 w-4" }: WeatherIconProps) => {
  if (!weather?.current?.weather?.[0]) return <Cloud className={className} />

  const condition = weather.current.weather[0].main.toLowerCase()
  switch (condition) {
    case "clear":
      return <Sun className={`${className} text-yellow-500`} />
    case "rain":
      return <CloudRain className={`${className} text-blue-500`} />
    case "clouds":
      return <Cloud className={`${className} text-gray-500`} />
    default:
      return <Cloud className={className} />
  }
}