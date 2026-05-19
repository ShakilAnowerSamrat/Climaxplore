"use client"

import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles } from "lucide-react"

export function ChatHeader() {
  return (
    <CardHeader className="pb-3 flex-shrink-0 border-b border-slate-200/10 dark:border-slate-800/40">
      <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">
        <Bot className="h-4.5 w-4.5 text-slate-850 dark:text-slate-100" />
        ARIA Weather Assistant
        <Badge variant="outline" className="ml-auto font-mono text-[9px] border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50 rounded-full px-2 py-0.5">
          <Sparkles className="h-2.5 w-2.5 mr-1 text-slate-400 dark:text-slate-500" />
          AI-Powered
        </Badge>
      </CardTitle>
    </CardHeader>
  )
}