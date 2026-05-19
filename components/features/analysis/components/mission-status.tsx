"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gauge } from "lucide-react"

export function MissionStatus() {
  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gauge className="h-5 w-5 text-primary" />
          <span>MISSION STATUS</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Data Quality</span>
            <Badge variant="secondary">EXCELLENT</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Satellite Link</span>
            <Badge className="bg-chart-2">STRONG</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Weather Model</span>
            <Badge variant="outline">GFS v16</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Update</span>
            <span className="text-xs font-mono">{new Date().toLocaleTimeString("en-US", { hour12: false })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}