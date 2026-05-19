"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { ExtremeCondition } from "../utils/weather-helpers"
import { getSeverityColor } from "../utils/weather-helpers"
import {
  Flame,
  Snowflake,
  Wind,
  Zap,
  CloudRain,
  Droplets,
} from "lucide-react"

interface ExtremeConditionsAlertProps {
  conditions: ExtremeCondition[]
  activeTab: "current" | "future"
}

export function ExtremeConditionsAlert({ conditions, activeTab }: ExtremeConditionsAlertProps) {
  if (conditions.length === 0) return null

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "flame":
        return <Flame className="h-4 w-4" />
      case "snowflake":
        return <Snowflake className="h-4 w-4" />
      case "wind":
        return <Wind className="h-4 w-4" />
      case "zap":
        return <Zap className="h-4 w-4" />
      case "cloud-rain":
        return <CloudRain className="h-4 w-4" />
      case "droplets":
        return <Droplets className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Extreme Weather Conditions Alert
        </CardTitle>
        <CardDescription>Dangerous conditions detected - Take immediate precautions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {conditions.map((condition, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(condition.severity)}`}>
              <div className="flex items-center gap-3">
                <div className={condition.color}>{getIcon(condition.icon)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {condition.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {condition.type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{condition.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}