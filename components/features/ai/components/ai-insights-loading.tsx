"use client"

import { Card, CardContent } from "@/components/ui/card"

export function AIInsightsLoading() {
  return (
    <Card className="bg-slate-900/50 dark:bg-slate-800/50 border-slate-700 dark:border-slate-700 shadow-lg backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-200 dark:text-slate-300">ARIA is analyzing weather patterns...</span>
        </div>
      </CardContent>
    </Card>
  )
}