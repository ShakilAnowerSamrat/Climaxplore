"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface AnomalyDetectionProps {
  anomalies: any[]
}

export function AnomalyDetection({ anomalies }: AnomalyDetectionProps) {
  if (anomalies.length === 0) return null

  return (
    <Card className="mission-control-panel nasa-glow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-accent" />
          <span>WEATHER ANOMALY DETECTION</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {anomalies.map((anomaly, index) => (
            <div key={index} className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className={`${anomaly.severity === "high" ? "bg-destructive" : "bg-chart-3"}`}>
                  {anomaly.type.toUpperCase()}
                </Badge>
                <Badge variant="outline">{anomaly.severity.toUpperCase()}</Badge>
              </div>
              <p className="text-sm">{anomaly.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}