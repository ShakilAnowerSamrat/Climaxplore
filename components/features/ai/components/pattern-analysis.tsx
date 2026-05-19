"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherInsights } from "../hooks/use-ai-insights"

interface PatternAnalysisProps {
  insights: WeatherInsights
}

export function PatternAnalysis({ insights }: PatternAnalysisProps) {
  if (!insights.patterns) return null

  return (
    <Card className="bg-white/60 dark:bg-[#0E0F12]/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md rounded-xl">
      <CardHeader className="pb-3 border-b border-slate-200/10 dark:border-slate-800/40">
        <CardTitle className="text-slate-800 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">Pattern Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <p className="text-slate-700 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">{insights.patterns}</p>
      </CardContent>
    </Card>
  )
}