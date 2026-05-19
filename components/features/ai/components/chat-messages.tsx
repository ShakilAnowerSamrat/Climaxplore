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
                  message.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-cyan-500 to-emerald-500"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`rounded-lg p-3 min-w-0 flex-1 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-100 border border-slate-700"
                }`}
              >
                <p className="text-sm leading-relaxed break-words hyphens-auto overflow-wrap-anywhere word-break-break-word">
                  {message.content}
                </p>
                <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
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