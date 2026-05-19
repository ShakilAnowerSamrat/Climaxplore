"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { WeatherInsights } from "../hooks/use-ai-insights"

interface RiskAssessmentProps {
  insights: WeatherInsights
  getSeverityColor: (severity: string) => string
}

export function RiskAssessment({ insights, getSeverityColor }: RiskAssessmentProps) {
  if (insights.riskFactors.length === 0) return null

  return (
    <Card className="bg-white dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/40 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/20">
        <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {insights.riskFactors.map((risk, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50"
            >
              <Badge className={`${getSeverityColor(risk.severity)} font-medium px-3 py-1`}>
                {risk.severity}
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{risk.factor}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{risk.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}