"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Database } from "lucide-react"

interface HistoricalLoadingProps {
  selectedPeriod: number
}

export function HistoricalLoading({ selectedPeriod }: HistoricalLoadingProps) {
  return (
    <Card className="mission-control-panel">
      <CardContent className="p-8 text-center">
        <Database className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">ACCESSING HISTORICAL DATABASE</h3>
        <p className="text-muted-foreground">Retrieving {selectedPeriod} days of weather data...</p>
      </CardContent>
    </Card>
  )
}