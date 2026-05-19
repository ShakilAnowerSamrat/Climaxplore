"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wind } from "lucide-react"
import { getAirQualityStatus } from "../utils/analysis-helpers"

interface AirQualityProps {
  airQuality: any
}

export function AirQuality({ airQuality }: AirQualityProps) {
  if (!airQuality) {
    return (
      <Card className="mission-control-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wind className="h-5 w-5 text-chart-3" />
            <span>AIR QUALITY INDEX</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Air quality data not available</p>
        </CardContent>
      </Card>
    )
  }

  const airQualityStatus = getAirQualityStatus(airQuality.list[0].main.aqi)

  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wind className="h-5 w-5 text-chart-3" />
          <span>AIR QUALITY INDEX</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-primary mb-2">{airQuality.list[0].main.aqi}</div>
                <Badge className={airQualityStatus.color}>
                  {airQualityStatus.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {airQualityStatus.description}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">CO (Carbon Monoxide)</span>
                <span className="font-mono">{airQuality.list[0].components.co.toFixed(2)} μg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">NO₂ (Nitrogen Dioxide)</span>
                <span className="font-mono">{airQuality.list[0].components.no2.toFixed(2)} μg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">O₃ (Ozone)</span>
                <span className="font-mono">{airQuality.list[0].components.o3.toFixed(2)} μg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PM2.5 (Fine Particles)</span>
                <span className="font-mono">{airQuality.list[0].components.pm2_5.toFixed(2)} μg/m³</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PM10 (Coarse Particles)</span>
                <span className="font-mono">{airQuality.list[0].components.pm10.toFixed(2)} μg/m³</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}