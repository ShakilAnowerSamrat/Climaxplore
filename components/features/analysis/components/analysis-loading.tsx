"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export function AnalysisLoading() {
  return (
    <Card className="mission-control-panel">
      <CardContent className="p-8 text-center">
        <Activity className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-lg font-semibold mb-2">ANALYZING ATMOSPHERIC DATA</h3>
        <p className="text-muted-foreground">Processing advanced weather patterns...</p>
      </CardContent>
    </Card>
  )
}