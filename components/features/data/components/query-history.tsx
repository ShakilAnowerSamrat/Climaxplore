"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Activity, MapPin, Trash2 } from "lucide-react"
import type { WeatherQuery } from "@/lib/data-persistence"
import { formatDate, getRiskColor } from "../utils/data-utils"

interface QueryHistoryProps {
  weatherHistory: WeatherQuery[]
  onClearHistory: () => void
  onLocationSelect: (lat: number, lon: number, name: string) => void
}

export function QueryHistory({ weatherHistory, onClearHistory, onLocationSelect }: QueryHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Weather Queries
          </div>
          <Button variant="outline" size="sm" onClick={onClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </CardTitle>
        <CardDescription>Your recent weather risk assessments</CardDescription>
      </CardHeader>
      <CardContent>
        {weatherHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No weather queries yet. Start exploring weather conditions to build your history!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weatherHistory.map((query) => (
              <div key={query.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{query.location.name}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(query.timestamp)}</div>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      <span className="capitalize">{query.activity}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {query.weather.temp}°C, {query.weather.conditions}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">{query.score}/100</div>
                    <Badge className={getRiskColor(query.riskLevel)} variant="outline">
                      {query.riskLevel}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onLocationSelect(query.location.lat, query.location.lon, query.location.name)
                    }
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}