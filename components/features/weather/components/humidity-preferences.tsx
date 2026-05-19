"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Droplets } from "lucide-react"

interface HumidityPreferencesProps {
  veryHumid: number
  onPreferenceChange: (key: string, value: number) => void
  getComfortLevel: (value: number, min: number, max: number) => { level: string; color: string }
}

export function HumidityPreferences({
  veryHumid,
  onPreferenceChange,
  getComfortLevel,
}: HumidityPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Humidity Tolerance
        </CardTitle>
        <CardDescription>Set your humidity comfort level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="very-humid">Too Humid Threshold</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{veryHumid}%</span>
            <Badge
              variant="outline"
              className={getComfortLevel(veryHumid, 60, 95).color + " text-white"}
            >
              {getComfortLevel(veryHumid, 60, 95).level}
            </Badge>
          </div>
        </div>
        <Slider
          id="very-humid"
          min={60}
          max={95}
          step={5}
          value={[veryHumid]}
          onValueChange={([value]) => onPreferenceChange("veryHumid", value)}
          className="w-full"
        />
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>60%: Comfortable</div>
          <div>75%: Noticeable</div>
          <div>90%: Very humid</div>
        </div>
      </CardContent>
    </Card>
  )
}