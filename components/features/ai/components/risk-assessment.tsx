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
    <Card className="bg-white/60 dark:bg-[#0E0F12]/60 border border-amber-200/60 dark:border-amber-900/30 shadow-sm backdrop-blur-md rounded-xl">
      <CardHeader className="pb-3 border-b border-amber-200/20 dark:border-amber-900/20">
        <CardTitle className="text-amber-800 dark:text-amber-450 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-500" />
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
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