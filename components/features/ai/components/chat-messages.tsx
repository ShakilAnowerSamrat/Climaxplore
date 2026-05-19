"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User } from "lucide-react"
import { Message } from "../hooks/use-weather-chat"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  scrollAreaRef: React.RefObject<HTMLDivElement>
}

export function ChatMessages({ messages, isLoading, scrollAreaRef }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 pr-4 min-h-0" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-2 max-w-[85%] min-w-0 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" 
                    ? "bg-slate-900 dark:bg-slate-100" 
                    : "bg-slate-50 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/40"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white dark:text-slate-950" />
                ) : (
                  <Bot className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                )}
              </div>
              <div
                className={`rounded-xl p-3.5 min-w-0 flex-1 ${
                  message.role === "user"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-medium"
                    : "bg-slate-50/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border border-slate-200/30 dark:border-slate-850/40"
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed break-words hyphens-auto overflow-wrap-anywhere word-break-break-word">
                  {message.content}
                </p>
                <p className="text-[10px] opacity-50 mt-1.5 font-mono">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/40 flex items-center justify-center">
              <Bot className="h-4 w-4 text-slate-750 dark:text-slate-250" />
            </div>
            <div className="bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-850/40 rounded-xl p-3">
              <div className="flex gap-1.5 py-1 px-0.5">
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-slate-450 dark:bg-slate-550 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-slate-500 dark:bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}