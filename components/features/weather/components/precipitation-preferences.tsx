"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

interface PrecipitationPreferencesProps {
  veryWet: number
  onPreferenceChange: (key: string, value: number) => void
  getComfortLevel: (value: number, min: number, max: number) => { level: string; color: string }
}

export function PrecipitationPreferences({
  veryWet,
  onPreferenceChange,
  getComfortLevel,
}: PrecipitationPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Rain Sensitivity
        </CardTitle>
        <CardDescription>Set your precipitation tolerance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="very-wet">Rain Risk Threshold</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{Math.round(veryWet * 100)}%</span>
            <Badge
              variant="outline"
              className={getComfortLevel(veryWet * 100, 30, 90).color + " text-white"}
            >
              {getComfortLevel(veryWet * 100, 30, 90).level}
            </Badge>
          </div>
        </div>
        <Slider
          id="very-wet"
          min={0.3}
          max={0.9}
          step={0.1}
          value={[veryWet]}
          onValueChange={([value]) => onPreferenceChange("veryWet", value)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Probability of precipitation that you consider too risky for outdoor activities
        </p>
      </CardContent>
    </Card>
  )
}