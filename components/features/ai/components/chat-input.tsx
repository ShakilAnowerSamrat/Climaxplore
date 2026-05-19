"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ChatInputProps {
  input: string
  setInput: (input: string) => void
  onSubmit: (e: React.FormEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isLoading: boolean
}

export function ChatInput({ input, setInput, onSubmit, onKeyDown, isLoading }: ChatInputProps) {
  return (
    <div className="flex-shrink-0 w-full pt-2 border-t border-slate-200/10 dark:border-slate-800/40">
      <form onSubmit={onSubmit} className="flex gap-2 items-center w-full">
        <div className="flex-1 min-w-0 max-w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask ARIA about weather conditions..."
            disabled={isLoading}
            className="w-full max-w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-900 dark:focus:border-white resize-none min-h-[40px] max-h-32 overflow-y-auto break-words rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm py-2.5 px-3.5"
            rows={1}
            style={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 h-10 w-10 p-0 rounded-xl flex-shrink-0 flex items-center justify-center cursor-pointer shadow-sm border border-transparent transition-colors duration-200"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}