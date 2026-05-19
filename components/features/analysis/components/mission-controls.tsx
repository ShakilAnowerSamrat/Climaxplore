"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Satellite, Globe, Radar } from "lucide-react"

interface MissionControlsProps {
  onLocationChange: (location: string) => void
}

export function MissionControls({ onLocationChange }: MissionControlsProps) {
  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle>MISSION CONTROLS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Satellite className="h-4 w-4 mr-2" />
          Refresh Satellite Data
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => onLocationChange("")}>
          <Globe className="h-4 w-4 mr-2" />
          Change Location
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <Radar className="h-4 w-4 mr-2" />
          Historical Analysis
        </Button>
      </CardContent>
    </Card>
  )
}