"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherInsights } from "../hooks/use-ai-insights"

interface AlternativeSuggestionsProps {
  insights: WeatherInsights
}

export function AlternativeSuggestions({ insights }: AlternativeSuggestionsProps) {
  if (insights.alternatives.length === 0) return null

  return (
    <Card className="bg-white/60 dark:bg-[#0E0F12]/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md rounded-xl">
      <CardHeader className="pb-3 border-b border-slate-200/10 dark:border-slate-800/40">
        <CardTitle className="text-slate-800 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">Alternative Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ul className="space-y-3">
          {insights.alternatives.map((alt, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/55 border border-slate-200/20 dark:border-slate-800/40"
            >
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">{alt}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}