"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Star } from "lucide-react"

interface SolarActivityProps {
  weatherData: any
}

export function SolarActivity({ weatherData }: SolarActivityProps) {
  return (
    <Card className="mission-control-panel nasa-glow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sun className="h-5 w-5 text-accent" />
          <span>SOLAR ACTIVITY</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Sunrise</span>
            <span className="font-mono">
              {weatherData.sys?.sunrise
                ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Sunset</span>
            <span className="font-mono">
              {weatherData.sys?.sunset
                ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Day Length</span>
            </div>
            <div className="text-lg font-bold text-primary">
              {weatherData.sys?.sunrise && weatherData.sys?.sunset
                ? `${Math.floor((weatherData.sys.sunset - weatherData.sys.sunrise) / 3600)}h ${Math.floor(((weatherData.sys.sunset - weatherData.sys.sunrise) % 3600) / 60)}m`
                : "--h --m"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}