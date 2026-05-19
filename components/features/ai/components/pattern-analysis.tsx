"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherInsights } from "../hooks/use-ai-insights"

interface PatternAnalysisProps {
  insights: WeatherInsights
}

export function PatternAnalysis({ insights }: PatternAnalysisProps) {
  if (!insights.patterns) return null

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-purple-500/30 dark:border-purple-500/30 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30">
        <CardTitle className="text-purple-400 dark:text-purple-300 text-base">Pattern Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-slate-100 dark:text-slate-200 leading-relaxed">{insights.patterns}</p>
      </CardContent>
    </Card>
  )
}