"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Zap } from "lucide-react"
import { chatWithWeatherAssistant } from "@/lib/gemini-api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface WeatherChatAssistantProps {
  weatherContext: any
}

export default function WeatherChatAssistant({ weatherContext }: WeatherChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ARIA (Atmospheric Risk Intelligence Assistant), your NASA-trained weather AI. Ask me anything about current conditions, activity planning, or weather safety!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickQuestions = [
    "Is it safe for hiking today?",
    "When's the best time for outdoor photography?",
    "Will conditions improve tomorrow?",
    "What should I watch out for?",
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await chatWithWeatherAssistant({
        message: messageText,
        weatherContext,
        conversationHistory,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

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
    <Card className="h-[600px] flex flex-col bg-slate-900/50 border-cyan-500/20 overflow-hidden">
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

      <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0 overflow-hidden">
        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => sendMessage(question)}
              disabled={isLoading}
              className="text-xs border-slate-600 hover:border-cyan-500/50 hover:bg-cyan-500/10"
            >
              {question}
            </Button>
          ))}
        </div>

        {/* Messages */}
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

        {/* Input */}
        <div className="flex-shrink-0 w-full">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end w-full">
            <div className="flex-1 min-w-0 max-w-full">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
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
      </CardContent>
    </Card>
  )
}
