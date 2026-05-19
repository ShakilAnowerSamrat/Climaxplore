"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function WeatherPatternAnalysis() {
  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle>WEATHER PATTERN ANALYSIS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Stability Index</h4>
            <Progress value={75} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Weather patterns show moderate stability with low probability of sudden changes.
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Predictability Score</h4>
            <Progress value={85} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              High confidence in forecast accuracy for the next 48 hours.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}