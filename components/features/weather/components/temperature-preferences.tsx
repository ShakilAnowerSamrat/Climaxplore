"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Thermometer } from "lucide-react"

interface TemperaturePreferencesProps {
  veryHot: number
  veryCold: number
  onPreferenceChange: (key: string, value: number) => void
  getComfortLevel: (value: number, min: number, max: number) => { level: string; color: string }
}

export function TemperaturePreferences({
  veryHot,
  veryCold,
  onPreferenceChange,
  getComfortLevel,
}: TemperaturePreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Temperature Comfort Zone
        </CardTitle>
        <CardDescription>Set your temperature thresholds for outdoor comfort</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hot Temperature Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="very-hot">Too Hot Threshold</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{veryHot}°C</span>
              <Badge
                variant="outline"
                className={getComfortLevel(veryHot, 25, 40).color + " text-white"}
              >
                {getComfortLevel(veryHot, 25, 40).level}
              </Badge>
            </div>
          </div>
          <Slider
            id="very-hot"
            min={25}
            max={40}
            step={1}
            value={[veryHot]}
            onValueChange={([value]) => onPreferenceChange("veryHot", value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Activities will be flagged as risky when temperature exceeds this value
          </p>
        </div>

        <Separator />

        {/* Cold Temperature Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="very-cold">Too Cold Threshold</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{veryCold}°C</span>
              <Badge
                variant="outline"
                className={getComfortLevel(15 - veryCold, 0, 15).color + " text-white"}
              >
                {getComfortLevel(15 - veryCold, 0, 15).level}
              </Badge>
            </div>
          </div>
          <Slider
            id="very-cold"
            min={-5}
            max={15}
            step={1}
            value={[veryCold]}
            onValueChange={([value]) => onPreferenceChange("veryCold", value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Activities will be flagged as risky when temperature drops below this value
          </p>
        </div>
      </CardContent>
    </Card>
  )
}