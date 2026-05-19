"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, RefreshCw, Zap } from "lucide-react"

interface AIInsightsHeaderProps {
  isLoading: boolean
  onRefresh: () => void
}

export function AIInsightsHeader({ isLoading, onRefresh }: AIInsightsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold dark:text-white bg-primary text-primary">
          AI Weather Intelligence
        </h3>
        <Badge
          variant="outline"
          className=" *:border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800
          "
        >
          <Zap className="h-3 w-3 mr-1" />
          Powered by Gemini
        </Badge>
      </div>
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="
          border-slate-300
          dark:border-slate-600
          hover:border-cyan-500
          bg-white
          dark:bg-slate-800
          hover:bg-cyan-50
          dark:hover:bg-slate-700
          text-slate-800
          dark:text-slate-100
          transition-colors
        "
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${
            isLoading
              ? 'animate-spin text-cyan-500'
              : 'text-cyan-600 dark:text-cyan-400'
          }`}
        />
        Refresh
      </Button>
    </div>
  );
}