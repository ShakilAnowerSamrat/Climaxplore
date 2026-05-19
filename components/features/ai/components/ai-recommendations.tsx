"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"
import { WeatherInsights } from "../hooks/use-ai-insights"

interface AIRecommendationsProps {
  insights: WeatherInsights
}

export function AIRecommendations({ insights }: AIRecommendationsProps) {
  if (insights.recommendations.length === 0) return null

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-emerald-500/30 dark:border-emerald-500/30 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-b border-emerald-500/20">
        <CardTitle className="text-emerald-400 dark:text-emerald-300 flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3">
          {insights.recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/30"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-slate-100 dark:text-slate-200 leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}