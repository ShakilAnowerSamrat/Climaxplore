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
    <Card className="bg-white/60 dark:bg-[#0E0F12]/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md rounded-xl">
      <CardHeader className="pb-3 border-b border-slate-200/10 dark:border-slate-800/40">
        <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
          <Lightbulb className="h-4.5 w-4.5 text-emerald-500" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ul className="space-y-3">
          {insights.recommendations.map((rec, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/55 border border-slate-200/20 dark:border-slate-800/40"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}