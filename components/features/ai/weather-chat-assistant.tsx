"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useWeatherChat } from "./hooks/use-weather-chat"
import { ChatHeader } from "./components/chat-header"
import { QuickQuestions } from "./components/quick-questions"
import { ChatMessages } from "./components/chat-messages"
import { ChatInput } from "./components/chat-input"

interface WeatherChatAssistantProps {
  weatherContext: any
}

export default function WeatherChatAssistant({ weatherContext }: WeatherChatAssistantProps) {
  const [input, setInput] = useState("")
  const {
    messages,
    isLoading,
    scrollAreaRef,
    quickQuestions,
    sendMessage,
  } = useWeatherChat(weatherContext)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col bg-white/60 dark:bg-[#0E0F12]/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 shadow-sm overflow-hidden rounded-xl">
      <ChatHeader />
      <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0 overflow-hidden">
        <QuickQuestions questions={quickQuestions} onQuestionClick={sendMessage} isLoading={isLoading} />
        <ChatMessages messages={messages} isLoading={isLoading} scrollAreaRef={scrollAreaRef} />
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}