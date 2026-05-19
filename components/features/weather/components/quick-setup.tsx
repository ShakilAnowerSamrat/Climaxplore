"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ActivityType } from "@/lib/risk-assessment"

interface QuickSetupProps {
  selectedActivity: ActivityType
  onLoadDefaults: () => void
  onLoadGeneralDefaults: () => void
}

export function QuickSetup({
  selectedActivity,
  onLoadDefaults,
  onLoadGeneralDefaults,
}: QuickSetupProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Setup</CardTitle>
        <CardDescription>Load preset configurations based on your activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onLoadDefaults}>
            Load {selectedActivity.name} Defaults
          </Button>
          <Button variant="outline" onClick={onLoadGeneralDefaults}>
            Load General Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}