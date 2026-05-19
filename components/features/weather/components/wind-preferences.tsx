"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Wind } from "lucide-react"

interface WindPreferencesProps {
  veryWindy: number
  onPreferenceChange: (key: string, value: number) => void
  getComfortLevel: (value: number, min: number, max: number) => { level: string; color: string }
}

export function WindPreferences({
  veryWindy,
  onPreferenceChange,
  getComfortLevel,
}: WindPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          Wind Sensitivity
        </CardTitle>
        <CardDescription>Set your wind speed tolerance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="very-windy">Too Windy Threshold</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{veryWindy} m/s</span>
            <Badge
              variant="outline"
              className={getComfortLevel(veryWindy, 10, 30).color + " text-white"}
            >
              {getComfortLevel(veryWindy, 10, 30).level}
            </Badge>
          </div>
        </div>
        <Slider
          id="very-windy"
          min={10}
          max={30}
          step={1}
          value={[veryWindy]}
          onValueChange={([value]) => onPreferenceChange("veryWindy", value)}
          className="w-full"
        />
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>10 m/s: Light breeze</div>
          <div>20 m/s: Strong wind</div>
          <div>30 m/s: Very strong wind</div>
        </div>
      </CardContent>
    </Card>
  )
}