"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherInsights } from "../hooks/use-ai-insights"

interface AlternativeSuggestionsProps {
  insights: WeatherInsights
}

export function AlternativeSuggestions({ insights }: AlternativeSuggestionsProps) {
  if (insights.alternatives.length === 0) return null

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-blue-500/30 dark:border-blue-500/30 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-blue-500/30">
        <CardTitle className="text-blue-400 dark:text-blue-300 text-base">Alternative Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-3">
          {insights.alternatives.map((alt, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 dark:border-blue-500/30"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-slate-100 dark:text-slate-200 leading-relaxed">{alt}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}