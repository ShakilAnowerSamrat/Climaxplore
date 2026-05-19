"use client"

import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Zap } from "lucide-react"

export function ChatHeader() {
  return (
    <CardHeader className="pb-3 flex-shrink-0">
      <CardTitle className="flex items-center gap-2 text-cyan-400">
        <Bot className="h-5 w-5" />
        ARIA Weather Assistant
        <Badge variant="outline" className="ml-auto border-emerald-500/30 text-emerald-400">
          <Zap className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </CardTitle>
    </CardHeader>
  )
}