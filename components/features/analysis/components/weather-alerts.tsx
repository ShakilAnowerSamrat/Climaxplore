"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface WeatherAlertsProps {
  weatherAlerts: any[]
}

export function WeatherAlerts({ weatherAlerts }: WeatherAlertsProps) {
  if (weatherAlerts.length === 0) return null

  return (
    <Card className="mission-control-panel border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>ACTIVE WEATHER ALERTS</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weatherAlerts.map((alert, index) => (
            <div key={index} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="destructive">{alert.event}</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(alert.start * 1000).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{alert.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}