"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

interface HistoricalHeaderControlsProps {
  location: string
  selectedPeriod: 7 | 14 | 30
  setSelectedPeriod: (period: 7 | 14 | 30) => void
  historicalData: any[]
  exportData: () => void
}

export function HistoricalHeaderControls({
  location,
  selectedPeriod,
  setSelectedPeriod,
  historicalData,
  exportData,
}: HistoricalHeaderControlsProps) {
  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>HISTORICAL WEATHER DATABASE</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedPeriod === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(7)}
            >
              7 Days
            </Button>
            <Button
              variant={selectedPeriod === 14 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(14)}
            >
              14 Days
            </Button>
            <Button
              variant={selectedPeriod === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(30)}
            >
              30 Days
            </Button>
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Location: {location}</span>
          <span>Data Points: {historicalData.length}</span>
          <span>Period: Last {selectedPeriod} days</span>
        </div>
      </CardContent>
    </Card>
  )
}