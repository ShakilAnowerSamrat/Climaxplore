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
    <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-orange-500/30 dark:border-orange-500/30 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/20">
        <CardTitle className="text-orange-400 dark:text-orange-300 flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {insights.riskFactors.map((risk, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 border border-slate-700/50 dark:border-slate-700/50"
            >
              <Badge className={`${getSeverityColor(risk.severity)} font-medium px-3 py-1`}>
                {risk.severity}
              </Badge>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-100 dark:text-slate-200 mb-2">{risk.factor}</h4>
                <p className="text-slate-300 dark:text-slate-300 leading-relaxed">{risk.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}