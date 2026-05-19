"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import type { EnhancedRiskAssessment, ActivityType } from "@/lib/risk-assessment"
import { getFactorColor, getFactorIcon } from "../utils/weather-helpers"

interface RiskFactorBreakdownProps {
  riskAssessment: EnhancedRiskAssessment
  activity: ActivityType
}

function RenderFactorIcon({ status }: { status: string }) {
  const iconName = getFactorIcon(status)
  switch (iconName) {
    case 'check-circle':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/10" />
    case 'alert-triangle':
      return <AlertTriangle className="h-4 w-4 text-amber-500 fill-amber-500/10" />
    case 'x-circle':
      return <XCircle className="h-4 w-4 text-rose-500 fill-rose-500/10" />
    default:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
  }
}

export function RiskFactorBreakdown({ riskAssessment, activity }: RiskFactorBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Factors</CardTitle>
        <CardDescription>Detailed breakdown for {activity.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(riskAssessment.factors).map(([factor, data]) => (
          <div key={factor} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RenderFactorIcon status={data.status} />
                <span className="text-sm font-medium capitalize">{factor}</span>
              </div>
              <Badge variant="outline" className={getFactorColor(data.status)}>
                {data.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={data.score} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground w-8">{data.score}</span>
            </div>
            <p className="text-xs text-muted-foreground">{data.impact}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}