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
    <div className="flex-shrink-0 w-full">
      <form onSubmit={onSubmit} className="flex gap-2 items-end w-full">
        <div className="flex-1 min-w-0 max-w-full">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask ARIA about weather conditions... (Press Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="w-full max-w-full bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-cyan-500 resize-none min-h-[40px] max-h-32 overflow-y-auto break-words"
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
          className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 h-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}