"use client"

import { Button } from "@/components/ui/button"

interface QuickQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isLoading: boolean
}

export function QuickQuestions({ questions, onQuestionClick, isLoading }: QuickQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 flex-shrink-0">
      {questions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onQuestionClick(question)}
          disabled={isLoading}
          className="text-xs border-slate-600 hover:border-cyan-500/50 hover:bg-cyan-500/10"
        >
          {question}
        </Button>
      ))}
    </div>
  )
}