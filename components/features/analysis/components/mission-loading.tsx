"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Satellite } from "lucide-react"

export function MissionLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="mission-control-panel nasa-glow">
        <CardContent className="p-8 text-center">
          <Satellite className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-xl font-bold mb-2">INITIALIZING MISSION CONTROL</h2>
          <p className="text-muted-foreground">Establishing satellite connection...</p>
        </CardContent>
      </Card>
    </div>
  )
}